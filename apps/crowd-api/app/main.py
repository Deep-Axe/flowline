from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from strawberry.fastapi import GraphQLRouter

from .graphql_schema import schema
from .routes.analyze import router as analyze_router
from .routes.api import router as api_router
from .schemas import HealthResponse


def custom_generate_unique_id(route: APIRoute) -> str:
    tag = route.tags[0] if route.tags else "api"
    return f"{tag}-{route.name}"


app = FastAPI(
    title="FLOWLINE Crowd API",
    description=(
        "Crowd density, bottleneck detection, and rerouting for venue operations. "
        "Inference via Hugging Face rootstrap-org/crowd-counting (CSRNet)."
    ),
    version="1.0.0",
    generate_unique_id_function=custom_generate_unique_id,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api", tags=["ops"])
app.include_router(analyze_router, prefix="/api", tags=["ops"])
app.include_router(GraphQLRouter(schema, multipart_uploads_enabled=True), prefix="/graphql")


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(status="ok")
