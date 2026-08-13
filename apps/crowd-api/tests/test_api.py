from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


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
