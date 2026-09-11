from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator
from enum import Enum

import strawberry
from strawberry.file_uploads import Upload

from .schemas import (
    ModelStatus as ModelStatusModel,
    Snapshot as SnapshotModel,
    Venue as VenueModel,
)

from .services.alerts import (
    Incident as IncidentRecord,
    ack_incident as resolve_incident,
    clear_incidents as reset_incidents,
    get_config,
    list_incidents,
    update_config,
)
from .services.engine import (
    analyze_frame,
    decode_upload,
    demo_duration,
    demo_tick,
    load_venue,
    reset_history,
)
from .services.hf_crowd import get_crowd_counter


@strawberry.enum
class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@strawberry.type
class GraphEdgeType:
    from_zone: str
    to: str
    capacity: float


@strawberry.type
class VenueZoneType:
    id: str
    label: str
    type: str
    capacity: float
    polygon: list[list[float]]
    centroid: list[float]


@strawberry.type
class VenueGraphType:
    nodes: list[str]
    edges: list[GraphEdgeType]


@strawberry.type
class VenueType:
    id: str
    name: str
    width: float
    height: float
    zones: list[VenueZoneType]
    graph: VenueGraphType


@strawberry.type
class ZoneSnapshotType:
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


@strawberry.type
class RouteSuggestionType:
    from_zone: str
    to: str
    avoid_zones: list[str] | None
    path: list[str]
    path_labels: list[str]
    message: str


@strawberry.type
class ModelMetaType:
    source: str
    model_repo: str
    global_count: float
    ready: bool
    error: str | None = None


@strawberry.type
class HistorySeriesType:
    zone_id: str
    values: list[float]


@strawberry.type
class IncidentType:
    id: strawberry.ID
    zone_id: str
    zone_label: str
    risk: RiskLevel
    density: float
    t: float | None
    suggestion: str
    open: bool
    created_at: float
    resolved_at: float | None = None


@strawberry.type
class AlertConfigType:
    density_threshold: float
    webhook_url: str | None = None


@strawberry.type
class SnapshotType:
    venue_id: str
    venue_name: str
    t: float | None
    phase: str | None
    note: str | None
    zones: list[ZoneSnapshotType]
    bottlenecks: list[str]
    routes: list[RouteSuggestionType]
    suggestion: str
    model: ModelMetaType
    history: list[HistorySeriesType]
    incidents: list[IncidentType]


@strawberry.type
class ModelStatusType:
    ready: bool
    device: str
    repo: str
    dataset: str
    error: str | None = None


@strawberry.type
class ResetDemoPayload:
    ok: bool


def venue_from_model(model: VenueModel) -> VenueType:
    edges: list[GraphEdgeType] = []
    for edge in model.graph.edges:
        edges.append(
            GraphEdgeType(
                from_zone=str(edge.get("from", "")),
                to=str(edge.get("to", "")),
                capacity=float(edge.get("capacity", 0)),
            )
        )
    return VenueType(
        id=model.id,
        name=model.name,
        width=model.width,
        height=model.height,
        zones=[
            VenueZoneType(
                id=z.id,
                label=z.label,
                type=z.type,
                capacity=z.capacity,
                polygon=z.polygon,
                centroid=z.centroid,
            )
            for z in model.zones
        ],
        graph=VenueGraphType(nodes=model.graph.nodes, edges=edges),
    )


def snapshot_from_model(model: SnapshotModel) -> SnapshotType:
    history = [HistorySeriesType(zone_id=k, values=v) for k, v in model.history.items()]
    return SnapshotType(
        venue_id=model.venue_id,
        venue_name=model.venue_name,
        t=model.t,
        phase=model.phase,
        note=model.note,
        zones=[
            ZoneSnapshotType(
                id=z.id,
                label=z.label,
                type=z.type,
                capacity=z.capacity,
                count_est=z.count_est,
                density=z.density,
                risk=RiskLevel(z.risk),
                centroid=z.centroid,
                polygon=z.polygon,
                trend=z.trend,
            )
            for z in model.zones
        ],
        bottlenecks=model.bottlenecks,
        routes=[
            RouteSuggestionType(
                from_zone=r.from_,
                to=r.to,
                avoid_zones=r.avoid_zones,
                path=r.path,
                path_labels=r.path_labels,
                message=r.message,
            )
            for r in model.routes
        ],
        suggestion=model.suggestion,
        model=ModelMetaType(
            source=model.model.source,
            model_repo=model.model.model_repo,
            global_count=model.model.global_count,
            ready=model.model.ready,
            error=model.model.error,
        ),
        history=history,
        incidents=[incident_from_store(item) for item in list_incidents()],
    )


def incident_from_store(inc: IncidentRecord) -> IncidentType:
    return IncidentType(
        id=strawberry.ID(inc.id),
        zone_id=inc.zone_id,
        zone_label=inc.zone_label,
        risk=RiskLevel(inc.risk),
        density=inc.density,
        t=inc.t,
        suggestion=inc.suggestion,
        open=inc.open,
        created_at=inc.created_at,
        resolved_at=inc.resolved_at,
    )


def alert_config_from_store() -> AlertConfigType:
    cfg = get_config()
    return AlertConfigType(density_threshold=cfg.density_threshold, webhook_url=cfg.webhook_url)


def model_status_from_pydantic(model: ModelStatusModel) -> ModelStatusType:
    return ModelStatusType(
        ready=model.ready,
        device=model.device,
        repo=model.repo,
        dataset=model.dataset,
        error=model.error,
    )


@strawberry.type
class Query:
    @strawberry.field
    def venue(self) -> VenueType:
        return venue_from_model(VenueModel.model_validate(load_venue()))

    @strawberry.field
    def model_status(self) -> ModelStatusType:
        counter = get_crowd_counter()
        return model_status_from_pydantic(
            ModelStatusModel(
                ready=counter.ready,
                device=str(counter.device),
                repo="rootstrap-org/crowd-counting",
                dataset="rootstrap-org/crowd-counting (ShanghaiTech Part B samples)",
                error=counter.error,
            )
        )

    @strawberry.field
    def demo_tick(self, t: float = 0.0) -> SnapshotType:
        return snapshot_from_model(SnapshotModel.model_validate(demo_tick(t)))

    @strawberry.field
    def incidents(self) -> list[IncidentType]:
        return [incident_from_store(item) for item in list_incidents()]

    @strawberry.field
    def alert_config(self) -> AlertConfigType:
        return alert_config_from_store()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def reset_demo(self) -> ResetDemoPayload:
        reset_history()
        reset_incidents()
        return ResetDemoPayload(ok=True)

    @strawberry.mutation
    def update_alert_config(
        self,
        density_threshold: float | None = None,
        webhook_url: str | None = None,
    ) -> AlertConfigType:
        update_config(
            density_threshold=density_threshold,
            webhook_url=webhook_url,
            clear_webhook=webhook_url == "",
        )
        return alert_config_from_store()

    @strawberry.mutation
    def clear_incidents(self) -> ResetDemoPayload:
        reset_incidents()
        return ResetDemoPayload(ok=True)

    @strawberry.mutation
    def ack_incident(self, id: strawberry.ID) -> IncidentType | None:
        inc = resolve_incident(str(id))
        return incident_from_store(inc) if inc else None

    @strawberry.mutation
    async def analyze_camera(
        self,
        file: Upload,
        phase: str | None = "camera_upload",
        reset: bool = False,
    ) -> SnapshotType:
        if reset:
            reset_history()
        raw = await file.read()
        if not raw:
            raise ValueError("Empty file")
        image = decode_upload(raw)
        return snapshot_from_model(SnapshotModel.model_validate(analyze_frame(image, phase=phase)))


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def demo_playback(
        self,
        start: float = 0.0,
        step: float = 0.5,
        interval_ms: int = 500,
    ) -> AsyncGenerator[SnapshotType, None]:
        duration = demo_duration()
        t = min(duration, max(0.0, start))
        step = max(0.1, step)
        delay = max(0, interval_ms) / 1000.0
        first = True
        while True:
            if not first and delay:
                await asyncio.sleep(delay)
            first = False
            yield snapshot_from_model(SnapshotModel.model_validate(demo_tick(t)))
            if t >= duration:
                break
            t = min(duration, t + step)


schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)
