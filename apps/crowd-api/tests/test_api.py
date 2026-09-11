from __future__ import annotations

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
FRAME = Path(__file__).resolve().parents[3] / "samples" / "camera-frames" / "quiet.jpg"


def _gql(query: str, variables: dict | None = None):
    payload: dict = {"query": query}
    if variables:
        payload["variables"] = variables
    return client.post("/graphql", json=payload)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_venue_schema():
    res = client.get("/api/venue")
    assert res.status_code == 200
    body = res.json()
    assert body["id"] == "plaksha_arena"
    assert len(body["zones"]) >= 5


def test_demo_tick_entry_peak():
    res = client.get("/api/demo/tick", params={"t": 16})
    assert res.status_code == 200
    body = res.json()
    assert "gate_a" in body["bottlenecks"]
    assert body["suggestion"]
    assert body["routes"]


def test_graphql_venue():
    res = _gql(
        """
        query Venue {
          venue {
            id
            name
            width
            height
            zones { id label type capacity }
            graph {
              nodes
              edges { fromZone to capacity }
            }
          }
        }
        """
    )
    assert res.status_code == 200
    venue = res.json()["data"]["venue"]
    assert venue["id"] == "plaksha_arena"
    assert len(venue["zones"]) >= 5
    assert venue["graph"]["edges"]


def test_graphql_model_status():
    res = _gql("query { modelStatus { ready device repo dataset error } }")
    assert res.status_code == 200
    status = res.json()["data"]["modelStatus"]
    assert "ready" in status
    assert "crowd-counting" in status["repo"]


def test_graphql_demo_tick_and_reset():
    tick = _gql(
        "query DemoTick($t: Float!) { demoTick(t: $t) { bottlenecks suggestion routes { fromZone pathLabels } } }",
        {"t": 16.0},
    )
    assert tick.status_code == 200
    data = tick.json()["data"]["demoTick"]
    assert "gate_a" in data["bottlenecks"]
    assert data["suggestion"]
    assert data["routes"]

    reset = _gql("mutation { resetDemo { ok } }")
    assert reset.status_code == 200
    assert reset.json()["data"]["resetDemo"]["ok"] is True


def test_rest_camera_upload():
    assert FRAME.exists()
    with FRAME.open("rb") as fh:
        res = client.post(
            "/api/analyze",
            files={"file": ("quiet.jpg", fh, "image/jpeg")},
            data={"phase": "camera_upload"},
        )
    assert res.status_code == 200
    body = res.json()
    assert "zones" in body
    assert "suggestion" in body
    assert "model" in body


ANALYZE_CAMERA = """
mutation AnalyzeCamera($file: Upload!, $phase: String, $reset: Boolean) {
  analyzeCamera(file: $file, phase: $phase, reset: $reset) {
    suggestion
    bottlenecks
    model { source ready globalCount }
    zones { id density }
  }
}
"""


def test_graphql_camera_upload():
    assert FRAME.exists()
    operations = {
        "query": ANALYZE_CAMERA,
        "variables": {"file": None, "phase": "camera_upload", "reset": False},
    }
    with FRAME.open("rb") as fh:
        res = client.post(
            "/graphql",
            data={
                "operations": json.dumps(operations),
                "map": '{"0":["variables.file"]}',
            },
            files={"0": ("quiet.jpg", fh, "image/jpeg")},
        )
    assert res.status_code == 200
    payload = res.json()
    assert "errors" not in payload
    snap = payload["data"]["analyzeCamera"]
    assert snap["suggestion"]
    assert snap["model"]["source"]
    assert snap["zones"]


def test_graphql_demo_playback_subscription():
    from strawberry.subscriptions import GRAPHQL_TRANSPORT_WS_PROTOCOL

    query = """
    subscription {
      demoPlayback(start: 16, step: 50, intervalMs: 0) {
        t
        bottlenecks
        suggestion
      }
    }
    """
    with client.websocket_connect("/graphql", subprotocols=[GRAPHQL_TRANSPORT_WS_PROTOCOL]) as ws:
        ws.send_json({"type": "connection_init"})
        ack = ws.receive_json()
        assert ack["type"] == "connection_ack"
        ws.send_json({"id": "1", "type": "subscribe", "payload": {"query": query}})
        first = ws.receive_json()
        assert first["type"] == "next"
        peak = first["payload"]["data"]["demoPlayback"]
        assert peak["t"] == 16
        assert "gate_a" in peak["bottlenecks"]
        last = ws.receive_json()
        assert last["type"] == "next"
        assert last["payload"]["data"]["demoPlayback"]["t"] == 60
        done = ws.receive_json()
        assert done["type"] == "complete"


def test_graphql_incidents_and_alert_config(monkeypatch):
    from app.services.alerts import DEFAULT_THRESHOLD, clear_incidents, update_config

    clear_incidents()
    update_config(density_threshold=DEFAULT_THRESHOLD, clear_webhook=True)

    posted: list[dict] = []

    class Immediate:
        def __init__(self, group=None, target=None, name=None, args=(), kwargs=None, *, daemon=None):
            if target:
                target(*args, **(kwargs or {}))

        def start(self):
            return None

    def fake_urlopen(req, timeout=2):
        posted.append(json.loads(req.data.decode("utf-8")))

        class _Resp:
            def __enter__(self):
                return self

            def __exit__(self, *args):
                return False

            def read(self):
                return b"ok"

        return _Resp()

    monkeypatch.setattr("app.services.alerts.threading.Thread", Immediate)
    monkeypatch.setattr("app.services.alerts.urllib.request.urlopen", fake_urlopen)

    cfg = _gql(
        """
        mutation {
          updateAlertConfig(densityThreshold: 0.75, webhookUrl: "http://example.test/hook") {
            densityThreshold
            webhookUrl
          }
        }
        """
    )
    assert cfg.json()["data"]["updateAlertConfig"]["webhookUrl"] == "http://example.test/hook"

    tick = _gql(
        "query { demoTick(t: 16) { bottlenecks incidents { zoneId zoneLabel open } } }"
    )
    assert tick.status_code == 200
    data = tick.json()["data"]["demoTick"]
    assert "gate_a" in data["bottlenecks"]
    open_zones = [i["zoneId"] for i in data["incidents"] if i["open"]]
    assert "gate_a" in open_zones
    assert posted and posted[0]["zoneId"] == "gate_a"

    again = _gql("query { demoTick(t: 16) { incidents { zoneId open } } }")
    gate_open = [i for i in again.json()["data"]["demoTick"]["incidents"] if i["zoneId"] == "gate_a" and i["open"]]
    assert len(gate_open) == 1

    quiet = _gql("query { demoTick(t: 0) { incidents { zoneId open } } }")
    assert all(not i["open"] or i["zoneId"] != "gate_a" for i in quiet.json()["data"]["demoTick"]["incidents"])

    reset = _gql("mutation { resetDemo { ok } }")
    assert reset.json()["data"]["resetDemo"]["ok"] is True
    empty = _gql("query { incidents { id } }")
    assert empty.json()["data"]["incidents"] == []

    update_config(density_threshold=DEFAULT_THRESHOLD, clear_webhook=True)



