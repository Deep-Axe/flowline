# React to Angular migration

This note maps the original Vite/React ops console (branch `main`) onto the Angular 22 standalone app on `angular-22`.

Angular 22 requires Node `^22.22.3 || ^24.15.0 || ^26`. This branch pins **Node 24.19.0** (see `.node-version`) and **Angular 22**. Switch back to `main` for the React/Vite console.

## Why GraphQL and REST together

Structured application state (venue layout, model readiness, demo snapshots, reset) is a typed graph of nested objects. GraphQL gives the console one schema, generated TypeScript types, and explicit loading/error handling without hand-maintained DTO copies.

Camera-frame analysis uses GraphQL `analyzeCamera` with the multipart request spec (`Upload` scalar). REST `POST /api/analyze` remains for OpenAPI/compatibility.

## Component mapping

| React | Angular |
|---|---|
| `App.tsx` boot / layout | `App` + `OpsShellComponent` |
| Header status pills | `ModelStatusComponent` |
| `VenueMap.tsx` | `VenueMapComponent` |
| Density trend SVG | `TrendChartComponent` |
| Play / pause / reset | `PlaybackControlsComponent` |
| Hidden file input + analyze | `CameraUploadComponent` |
| Bottleneck list | `BottleneckListComponent` |
| Active reroutes | `RouteSuggestionsComponent` |
| Suggestion banner + errors | `OpsShellComponent` + `StatusBannerComponent` |
| `src/api.ts` OpenAPI wrappers | `OpsGraphqlService` (Apollo + GraphQL multipart upload) |

## State

- **Signals** hold venue, snapshot, playback clock, playing flag, upload busy, preview URL, and error text.
- **RxJS** is used inside services for Apollo watches, GraphQL multipart upload, and `demoPlayback` subscriptions (replacing requestAnimationFrame polling of `demoTick`).

## Contracts

- REST OpenAPI remains in `packages/contracts` for `/api/analyze` and legacy REST ops endpoints.
- GraphQL schema is exported to `packages/contracts/schema.graphql`.
- Angular GraphQL Code Generator writes `apps/ops-console/src/generated/graphql.ts` from that schema plus `*.graphql` operations. Do not edit generated files by hand.

## Algorithms unchanged

Crowd counting (`hf_crowd` / CSRNet), risk scoring, and graph rerouting stay in `apps/crowd-api/app/services`. GraphQL resolvers call the same engine functions as REST.

The Vite/React ops console was replaced by this Angular app. Do not reintroduce React or Vite into `apps/ops-console`.

## Workspace notes

The npm workspaces layout hoists some packages to the repo root. Root `package.json` lists `@angular/common`, `@angular/compiler`, `@angular/core`, and `typescript` so Apollo, ESLint, and the application builder can resolve those modules next to `apollo-angular`. That is not a second Angular app.

`ng update` must run inside `apps/ops-console` (or `npm run update:console` from the repo root). `npm --workspace exec ng update` from the root package sees no `@angular/core` dependency.

Angular 22 application-builder and Vitest are already in use. Karma, SSR, and trusted-proxy-header migrations do not apply to this console.

Docker: `docker compose up --build` is the documented deploy path. This Windows checkout did not have `docker` on PATH, so compose was not verified here; the Dockerfiles still build the API and the nginx-wrapped Angular bundle.
