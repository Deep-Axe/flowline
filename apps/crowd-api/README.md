# FLOWLINE Crowd API

FastAPI service for venue crowd density, bottleneck detection, and rerouting.

## Run

```powershell
cd apps/crowd-api
# from repo root with venv:
$env:PYTHONPATH = "apps/crowd-api"
uvicorn app.main:app --reload --reload-dir apps/crowd-api/app --host 127.0.0.1 --port 8001
```

OpenAPI: http://127.0.0.1:8001/openapi.json  
GraphQL: http://127.0.0.1:8001/graphql  

Replay: GraphQL subscription `demoPlayback` over WebSocket (`graphql-transport-ws`).  
Camera frames: GraphQL `analyzeCamera` (`Upload` scalar, multipart). REST `POST /api/analyze` remains for OpenAPI clients.

## Hugging Face

- Model: `rootstrap-org/crowd-counting` (CSRNet)
- Dataset card: `rootstrap-org/crowd-counting` (ShanghaiTech Part B samples)
