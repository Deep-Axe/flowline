# FLOWLINE

Crowd-operations prototype for venues: see density form, flag bottlenecks, suggest reroutes before queues turn unsafe.

![FLOWLINE ops console — quiet concourse](docs/screenshots/01-ops-console-idle.png)

**Apps**

- `apps/ops-console` — React control-room dashboard
- `apps/crowd-api` — FastAPI + CSRNet (Hugging Face) + risk + routing

**Contract**

- `packages/contracts` — OpenAPI schema + generated TypeScript client

## Screenshots

### Entry rush — Gate A bottleneck + reroute

![Entry rush with Gate A hotspot and Gate B reroute](docs/screenshots/02-entry-rush-reroute.png)

### Exit crush — West Exit critical, divert east

![Exit crush with West Exit critical and eastbound reroute](docs/screenshots/03-exit-crush.png)

### Camera upload — live CSRNet inference

![Camera frame upload with CSRNet density and Main Walkway bottleneck](docs/screenshots/04-camera-upload.png)

Regenerate screenshots (API on `:8001`, console on `:5173`):

```powershell
node scripts/capture_screenshots.mjs
```

## Quick start

```powershell
# once
python -m venv .venv
.\.venv\Scripts\pip install -r apps\crowd-api\requirements.txt httpx pytest
npm install
.\.venv\Scripts\python scripts\export_openapi.py
npm --workspace packages/contracts run generate
.\.venv\Scripts\python scripts\stamp_contracts.py

# API
$env:PYTHONPATH = "apps\crowd-api"
.\.venv\Scripts\python -m uvicorn app.main:app --reload --reload-dir apps\crowd-api\app --host 127.0.0.1 --port 8001

# Console (other terminal)
npm --workspace apps/ops-console run dev
```

Open http://127.0.0.1:5173

If you use [Task](https://taskfile.dev): `task setup`, `task contracts`, `task dev`, `task check`.

## Demo

See [docs/demo.md](docs/demo.md). Sample frames live in `samples/camera-frames/`.

## Architecture

See [docs/architecture.md](docs/architecture.md).

```text
Camera / replay  →  crowd-api  →  ops-console map
                      ├─ CSRNet (HF) or heuristic
                      ├─ capacity risk
                      └─ density-weighted routes
```

## Hugging Face

- Model: [`rootstrap-org/crowd-counting`](https://huggingface.co/rootstrap-org/crowd-counting)
- Dataset card: [`rootstrap-org/crowd-counting`](https://huggingface.co/datasets/rootstrap-org/crowd-counting)

## Check

```powershell
$env:PYTHONPATH = "apps\crowd-api"
.\.venv\Scripts\python -m pytest apps\crowd-api\tests -q
npm --workspace apps/ops-console run typecheck
npm --workspace apps/ops-console run build
```
