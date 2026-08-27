# Architecture

FLOWLINE is a monorepo with two deployable products and shared contracts.

```text
ops-console (Angular + Apollo)
        |  GraphQL  /graphql   venue, modelStatus, demoTick, resetDemo
        |  REST     /api/analyze  camera-frame upload
        v
crowd-api (FastAPI + Strawberry)
        ├─ CSRNet (HF) / heuristic
        ├─ risk engine
        └─ density-weighted graph router
```

## Why GraphQL and REST

GraphQL is used for **structured application state**: nested venue graphs, snapshots, bottlenecks, routes, and model status. One schema drives Angular GraphQL Code Generator, so the console does not hand-write response types.

REST remains responsible for **multipart camera uploads**. Binary files are a transport concern; forcing them through GraphQL multipart would add client and CI complexity without changing inference. `/api/analyze` still returns the same snapshot payload, which the console maps onto the generated GraphQL `Snapshot` type.

Legacy REST ops endpoints (`/api/venue`, `/api/demo/tick`, …) stay for compatibility.

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

1. **Replay** — GraphQL `demoTick(t)` over scripted densities
2. **Upload** — REST multipart → CSRNet → snapshot mapped to GraphQL types
3. **Fallback** — heuristic density if HF weights unavailable

## Non-goals (for now)

- Camera calibration / homography
- Multi-venue editor
- Splitting risk/routing/inference into extra packages
