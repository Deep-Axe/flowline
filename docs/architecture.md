# Architecture

FLOWLINE is a monorepo with two deployable products and one shared contract.

```text
ops-console  --OpenAPI-->  crowd-api  -->  CSRNet (HF) / heuristic
                               |
                               +--> risk engine
                               +--> density-weighted graph router
```

## Applications

| App | Path | Responsibility |
|---|---|---|
| Ops Console | `apps/ops-console` | Control-room UI: map, replay, upload, suggestions |
| Crowd API | `apps/crowd-api` | Inference, risk, routing, demo timeline |

## Contracts

`packages/contracts` owns:

1. Exported `openapi.json` from FastAPI models
2. Generated TypeScript client (`@hey-api/openapi-ts`)

Do not hand-maintain request/response types in the console. Change the API schemas, regenerate, update UI in the same PR.

## Data flow

1. **Replay** — scripted densities in `demo_timeline.json` → risk + routes (no camera)
2. **Upload** — image → CSRNet density map → zone integrals → risk + routes
3. **Fallback** — if HF weights unavailable, spatial heuristic still produces a density map

## Non-goals (for now)

- Camera calibration / homography
- Multi-venue editor
- Separate packages for risk/routing/inference (single consumer today)
