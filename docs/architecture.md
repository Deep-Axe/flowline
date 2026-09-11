# Architecture

FLOWLINE is a monorepo with two deployable products and shared contracts.

```text
ops-console (Angular + Apollo)
        |  GraphQL  /graphql   venue, modelStatus, demoTick, resetDemo, analyzeCamera
        |  GraphQL WS          demoPlayback live ticks
        v
crowd-api (FastAPI + Strawberry)
        ├─ CSRNet (HF) / heuristic
        ├─ risk engine
        ├─ incident log / webhook
        └─ density-weighted graph router
```

## Why GraphQL and REST

GraphQL is the console's application API: nested venue graphs, snapshots, bottlenecks, routes, model status, and camera analysis (`analyzeCamera` with the `Upload` scalar and the GraphQL multipart request spec). One schema drives Angular GraphQL Code Generator.

REST `POST /api/analyze` and the other `/api/*` ops endpoints remain for OpenAPI clients and compatibility. The Angular console does not call REST for upload.

## Applications

| App | Path | Responsibility |
|---|---|---|
| Ops Console | `apps/ops-console` | Angular 22 control room: map, replay, upload, suggestions |
| Crowd API | `apps/crowd-api` | FastAPI, Strawberry GraphQL, CSRNet, risk, routing |

## Contracts

`packages/contracts` owns:

1. `openapi.json` — FastAPI REST (including analyze)
2. `schema.graphql` — Strawberry SDL
3. Generated OpenAPI TypeScript client (Hey API)

The Angular app generates `src/generated/graphql.ts` from `schema.graphql` plus `src/graphql/*.graphql`. Do not edit generated files.

## Data flow

1. **Replay** — GraphQL subscription `demoPlayback` streams timeline snapshots; `demoTick(t)` is the seek/boot query
2. **Upload** — GraphQL multipart `analyzeCamera` → CSRNet → `Snapshot`
3. **Alerts** — rising-edge incidents when zone density crosses the operator threshold; optional webhook; console beep
4. **Fallback** — heuristic density if HF weights unavailable

## Non-goals (for now)

- Camera calibration / homography
- Multi-venue editor
- Splitting risk/routing/inference into extra packages
