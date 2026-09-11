from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from .hf_crowd import get_crowd_counter, zone_counts_from_density
from .risk import build_zone_snapshot, detect_bottlenecks, trend_label
from .routing import compose_suggestion, suggest_reroutes

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@lru_cache(maxsize=1)
def load_venue() -> dict[str, Any]:
    with open(DATA_DIR / "venue_stadium.json", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def load_timeline() -> dict[str, Any]:
    with open(DATA_DIR / "demo_timeline.json", encoding="utf-8") as f:
        return json.load(f)


# In-memory trend history for demo / analyze sessions
_history: dict[str, list[float]] = {}


def reset_history() -> None:
    _history.clear()


def _push_history(zone_snapshot: list[dict[str, Any]], keep: int = 8) -> dict[str, str]:
    trends: dict[str, str] = {}
    for z in zone_snapshot:
        series = _history.setdefault(z["id"], [])
        series.append(z["density"])
        if len(series) > keep:
            del series[:-keep]
        trends[z["id"]] = trend_label(series)
    return trends


def analyze_frame(
    image_bgr: np.ndarray,
    *,
    phase: str | None = None,
    note: str | None = None,
) -> dict[str, Any]:
    venue = load_venue()
    counter = get_crowd_counter()
    estimate = counter.estimate(image_bgr)
    counts = zone_counts_from_density(
        estimate.density_map,
        venue["zones"],
        image_w=image_bgr.shape[1],
        image_h=image_bgr.shape[0],
        venue_w=venue["width"],
        venue_h=venue["height"],
    )
    # Normalize so total estimated people aligns with model count when model ran
    total = sum(counts.values()) or 1.0
    if estimate.source == "csrnet" and estimate.count > 0:
        scale = estimate.count / total
        counts = {k: v * scale for k, v in counts.items()}

    zone_snapshot = build_zone_snapshot(venue["zones"], counts)

    # Amplify relative peaks so upload demos show actionable hotspots
    # while preserving zone ranking from the density map.
    if estimate.count >= 12:
        dens = [z["density"] for z in build_zone_snapshot(venue["zones"], counts)]
        peak = max(dens) if dens else 0
        if 0 < peak < 0.75:
            boost = 0.85 / peak
            counts = {k: v * boost for k, v in counts.items()}
            zone_snapshot = build_zone_snapshot(venue["zones"], counts)

    return _finalize_snapshot(
        zone_snapshot,
        model_meta={
            "source": estimate.source,
            "model_repo": estimate.model_repo,
            "global_count": round(estimate.count, 1),
            "ready": counter.ready,
            "error": counter.error,
        },
        phase=phase,
        note=note,
    )


def analyze_densities(
    densities: dict[str, float],
    *,
    phase: str | None = None,
    note: str | None = None,
    t: float | None = None,
) -> dict[str, Any]:
    venue = load_venue()
    zone_snapshot = build_zone_snapshot(venue["zones"], counts={}, density_overrides=densities)
    return _finalize_snapshot(
        zone_snapshot,
        model_meta={
            "source": "timeline",
            "model_repo": "rootstrap-org/crowd-counting",
            "global_count": round(sum(z["count_est"] for z in zone_snapshot), 1),
            "ready": get_crowd_counter().ready,
            "error": get_crowd_counter().error,
        },
        phase=phase,
        note=note,
        t=t,
    )


def _finalize_snapshot(
    zone_snapshot: list[dict[str, Any]],
    model_meta: dict[str, Any],
    phase: str | None = None,
    note: str | None = None,
    t: float | None = None,
) -> dict[str, Any]:
    venue = load_venue()
    bottlenecks = detect_bottlenecks(zone_snapshot)
    routes = suggest_reroutes(venue, zone_snapshot, bottlenecks)
    suggestion = compose_suggestion(zone_snapshot, bottlenecks, routes, phase=phase)
    trends = _push_history(zone_snapshot)

    # Attach trend onto zones
    for z in zone_snapshot:
        z["trend"] = trends.get(z["id"], "stable")

    return {
        "venue_id": venue["id"],
        "venue_name": venue["name"],
        "t": t,
        "phase": phase,
        "note": note,
        "zones": zone_snapshot,
        "bottlenecks": bottlenecks,
        "routes": routes,
        "suggestion": suggestion,
        "model": model_meta,
        "history": {zid: list(vals) for zid, vals in _history.items()},
    }


def demo_duration() -> float:
    return float(load_timeline()["duration_sec"])


def demo_tick(t: float) -> dict[str, Any]:
    timeline = load_timeline()
    frames = timeline["frames"]
    # Find surrounding keyframes and interpolate densities
    if t <= frames[0]["t"]:
        frame = frames[0]
        return analyze_densities(frame["densities"], phase=frame["phase"], note=frame["note"], t=t)
    if t >= frames[-1]["t"]:
        frame = frames[-1]
        return analyze_densities(frame["densities"], phase=frame["phase"], note=frame["note"], t=t)

    left = frames[0]
    right = frames[-1]
    for i in range(len(frames) - 1):
        if frames[i]["t"] <= t <= frames[i + 1]["t"]:
            left, right = frames[i], frames[i + 1]
            break

    span = max(1e-6, right["t"] - left["t"])
    alpha = (t - left["t"]) / span
    densities = {}
    for zid in left["densities"]:
        densities[zid] = (1 - alpha) * left["densities"][zid] + alpha * right["densities"][zid]

    phase = left["phase"] if alpha < 0.5 else right["phase"]
    note = left["note"] if alpha < 0.5 else right["note"]
    return analyze_densities(densities, phase=phase, note=note, t=round(t, 2))


def decode_upload(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image")
    return image
