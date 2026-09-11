from __future__ import annotations

import json
import threading
import time
import urllib.error
import urllib.request
import uuid
from dataclasses import dataclass

DEFAULT_THRESHOLD = 0.75


@dataclass
class AlertConfig:
    density_threshold: float = DEFAULT_THRESHOLD
    webhook_url: str | None = None


@dataclass
class Incident:
    id: str
    zone_id: str
    zone_label: str
    risk: str
    density: float
    t: float | None
    suggestion: str
    open: bool
    created_at: float
    resolved_at: float | None = None


_config = AlertConfig()
_incidents: list[Incident] = []
_open: dict[str, str] = {}


def get_config() -> AlertConfig:
    return _config


def update_config(
    *,
    density_threshold: float | None = None,
    webhook_url: str | None = None,
    clear_webhook: bool = False,
) -> AlertConfig:
    if density_threshold is not None:
        _config.density_threshold = min(1.2, max(0.3, float(density_threshold)))
    if clear_webhook:
        _config.webhook_url = None
    elif webhook_url is not None:
        url = webhook_url.strip()
        _config.webhook_url = url or None
    return _config


def list_incidents() -> list[Incident]:
    return list(reversed(_incidents))


def clear_incidents() -> None:
    _incidents.clear()
    _open.clear()


def ack_incident(incident_id: str) -> Incident | None:
    for inc in _incidents:
        if inc.id != incident_id:
            continue
        inc.open = False
        inc.resolved_at = time.time()
        if _open.get(inc.zone_id) == inc.id:
            del _open[inc.zone_id]
        return inc
    return None


def ingest_snapshot(snapshot: dict) -> list[Incident]:
    opened: list[Incident] = []
    hot = set(snapshot.get("bottlenecks") or [])
    zones = {z["id"]: z for z in snapshot.get("zones") or []}
    now = time.time()
    for zid in hot:
        if zid in _open:
            continue
        zone = zones.get(zid, {})
        inc = Incident(
            id=str(uuid.uuid4()),
            zone_id=zid,
            zone_label=str(zone.get("label", zid)),
            risk=str(zone.get("risk", "high")),
            density=float(zone.get("density", 0.0)),
            t=snapshot.get("t"),
            suggestion=str(snapshot.get("suggestion") or ""),
            open=True,
            created_at=now,
        )
        _incidents.append(inc)
        _open[zid] = inc.id
        opened.append(inc)
        _fire_webhook(inc)
    for zid, iid in list(_open.items()):
        if zid in hot:
            continue
        inc = next((item for item in _incidents if item.id == iid), None)
        if inc:
            inc.open = False
            inc.resolved_at = now
        del _open[zid]
    return opened


def _fire_webhook(inc: Incident) -> None:
    url = _config.webhook_url
    if not url:
        return
    payload = {
        "id": inc.id,
        "zoneId": inc.zone_id,
        "zoneLabel": inc.zone_label,
        "risk": inc.risk,
        "density": inc.density,
        "t": inc.t,
        "suggestion": inc.suggestion,
        "open": inc.open,
    }
    threading.Thread(target=_post_webhook, args=(url, payload), daemon=True).start()


def _post_webhook(url: str, payload: dict) -> None:
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=2)
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        return
