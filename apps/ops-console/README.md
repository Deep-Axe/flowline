# FLOWLINE Ops Console

Angular 22 control-room UI. Venue, model status, replay, and reset go through **Apollo → GraphQL**. Camera frames use **HttpClient → REST** `/api/analyze`. Node **24.19.0** or newer (`^22.22.3 || ^24.15.0`).

```powershell
npm install
npm --workspace apps/ops-console run codegen
npm --workspace apps/ops-console run dev
```

Dev server: http://127.0.0.1:5173 (proxies `/graphql` and `/api` to `:8001`).

```powershell
npm --workspace apps/ops-console run lint
npm --workspace apps/ops-console run test
npm --workspace apps/ops-console run typecheck
npm --workspace apps/ops-console run build
```
