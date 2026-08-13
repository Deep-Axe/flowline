from __future__ import annotations

from fastapi import APIRouter, Query

from ..schemas import DemoTimeline, ModelStatus, OkResponse, Snapshot, Venue
from ..services.engine import demo_tick, load_timeline, load_venue, reset_history
from ..services.hf_crowd import get_crowd_counter

router = APIRouter()


@router.get("/venue", response_model=Venue)
def get_venue() -> Venue:
    return Venue.model_validate(load_venue())


@router.get("/demo/timeline", response_model=DemoTimeline)
def get_timeline() -> DemoTimeline:
    return DemoTimeline.model_validate(load_timeline())


@router.get("/demo/tick", response_model=Snapshot)
def get_demo_tick(t: float = Query(0, ge=0, le=120)) -> Snapshot:
    return Snapshot.model_validate(demo_tick(t))


@router.post("/demo/reset", response_model=OkResponse)
def demo_reset() -> OkResponse:
    reset_history()
    return OkResponse(ok=True)


@router.get("/model/status", response_model=ModelStatus)
def model_status() -> ModelStatus:
    counter = get_crowd_counter()
    return ModelStatus(
        ready=counter.ready,
        device=str(counter.device),
        repo="rootstrap-org/crowd-counting",
        dataset="rootstrap-org/crowd-counting (ShanghaiTech Part B samples)",
        error=counter.error,
    )
