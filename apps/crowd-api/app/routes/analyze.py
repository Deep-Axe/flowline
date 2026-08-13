from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..schemas import Snapshot
from ..services.engine import analyze_frame, decode_upload, reset_history

router = APIRouter()


@router.post("/analyze", response_model=Snapshot)
async def analyze(
    file: UploadFile = File(...),
    phase: str | None = Form(None),
    reset: bool = Form(False),
) -> Snapshot:
    if reset:
        reset_history()
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        image = decode_upload(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return Snapshot.model_validate(analyze_frame(image, phase=phase))
