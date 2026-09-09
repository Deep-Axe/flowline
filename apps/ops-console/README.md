# FLOWLINE Ops Console

Angular 22 control-room UI. Venue, model status, replay, and reset go through **Apollo → GraphQL**. Camera frames use **HttpClient → REST** `/api/analyze`. Node **24.19.0** or newer (`^22.22.3 || ^24.15.0`).

```powershell
npm install
npm --prefix apps/ops-console run codegen
npm --prefix apps/ops-console run dev
```

Angular CLI commands must run in this folder (`apps/ops-console`), not the monorepo root. `npm --workspace exec ng update` looks at the root package and reports `@angular/core` as missing.

```powershell
npm run lint
npm run test
npm run typecheck
npm run build
```
