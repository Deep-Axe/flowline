from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["low", "medium", "high", "critical"]


class HealthResponse(BaseModel):
    status: str


class GraphEdge(BaseModel):
    from_: str = Field(alias="from")
    to: str
    capacity: float

    model_config = {"populate_by_name": True}


class VenueZone(BaseModel):
    id: str
    label: str
    type: str
    capacity: float
    polygon: list[list[float]]
    centroid: list[float]


class VenueGraph(BaseModel):
    nodes: list[str]
    edges: list[dict[str, Any]]


class Venue(BaseModel):
    id: str
    name: str
    width: float
    height: float
    zones: list[VenueZone]
    graph: VenueGraph


class ZoneSnapshot(BaseModel):
    id: str
    label: str
    type: str
    capacity: float
    count_est: float
    density: float
    risk: RiskLevel
    centroid: list[float]
    polygon: list[list[float]]
    trend: str | None = None


class RouteSuggestion(BaseModel):
    from_: str = Field(alias="from")
    to: str
    avoid_zones: list[str] | None = None
    path: list[str]
    path_labels: list[str]
    message: str

    model_config = {"populate_by_name": True}


class ModelMeta(BaseModel):
    source: str
    model_repo: str
    global_count: float
    ready: bool
    error: str | None = None


class Snapshot(BaseModel):
    venue_id: str
    venue_name: str
    t: float | None = None
    phase: str | None = None
    note: str | None = None
    zones: list[ZoneSnapshot]
    bottlenecks: list[str]
    routes: list[RouteSuggestion]
    suggestion: str
    model: ModelMeta
    history: dict[str, list[float]]


class OkResponse(BaseModel):
    ok: bool


class ModelStatus(BaseModel):
    ready: bool
    device: str
    repo: str
    dataset: str
    error: str | None = None


class TimelineFrame(BaseModel):
    t: float
    phase: str
    note: str
    densities: dict[str, float]


class DemoTimeline(BaseModel):
    duration_sec: float
    frames: list[TimelineFrame]
