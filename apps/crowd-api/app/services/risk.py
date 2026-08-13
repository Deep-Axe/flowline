from __future__ import annotations

from typing import Any, Literal

RiskLevel = Literal["low", "medium", "high", "critical"]


def risk_level(ratio: float) -> RiskLevel:
    if ratio >= 0.90:
        return "critical"
    if ratio >= 0.75:
        return "high"
    if ratio >= 0.45:
        return "medium"
    return "low"


def build_zone_snapshot(
    zones: list[dict[str, Any]],
    counts: dict[str, float],
    density_overrides: dict[str, float] | None = None,
) -> list[dict[str, Any]]:
    snapshot: list[dict[str, Any]] = []
    for zone in zones:
        zid = zone["id"]
        capacity = float(zone["capacity"])
        if density_overrides and zid in density_overrides:
            density = float(density_overrides[zid])
            count_est = density * capacity
        else:
            count_est = float(counts.get(zid, 0.0))
            density = min(1.5, count_est / capacity) if capacity > 0 else 0.0
        density = max(0.0, min(1.2, density))
        ratio = density  # already capacity-normalized
        snapshot.append(
            {
                "id": zid,
                "label": zone["label"],
                "type": zone["type"],
                "capacity": capacity,
                "count_est": round(count_est, 1),
                "density": round(density, 3),
                "risk": risk_level(ratio),
                "centroid": zone["centroid"],
                "polygon": zone["polygon"],
            }
        )
    return snapshot


def detect_bottlenecks(zone_snapshot: list[dict[str, Any]], threshold: float = 0.75) -> list[str]:
    return [z["id"] for z in zone_snapshot if z["density"] >= threshold]


def trend_label(history: list[float]) -> str:
    if len(history) < 2:
        return "stable"
    delta = history[-1] - history[0]
    if delta > 0.08:
        return "worsening"
    if delta < -0.08:
        return "improving"
    return "stable"
