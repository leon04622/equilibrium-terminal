# DevOps & Global Operations (Phase 38)

Deployment infrastructure is product quality — always-on market infrastructure.

## Environments

| ID | Purpose | Config |
|----|---------|--------|
| `local` | Development | `NEXT_PUBLIC_EQ_ENV=local` |
| `staging` | Vercel preview | `VERCEL_ENV=preview` |
| `qa` | Pre-prod validation | CI / manual |
| `production` | Live traders | `VERCEL_ENV=production` |
| `enterprise` | Dedicated tenants | `NEXT_PUBLIC_EQ_ENV=enterprise` |

Profiles: `src/config/environments.ts`

## API endpoints

| Route | Use |
|-------|-----|
| `GET /api/ops/health` | Liveness / readiness (LB, uptime monitors) |
| `GET /api/ops/vitals` | Gateway + process operational metrics |
| `GET /api/ops/regions` | Multi-region routing table |

## CI/CD

- **`.github/workflows/ci.yml`** — lint + build on PR/push
- **`.github/workflows/deploy-production.yml`** — manual production deploy + smoke check

Local:

```bash
npm run ci
npm run ops:health
npm run publish:vercel
```

## Observability (in-terminal)

- **INFRA** panel → **LIVE OPS** tab — regions, SLO, stream resilience, incidents
- **PERF** HUD — FPS, stream coalescing (Phase 36)
- **RELIABILITY / TRUST** — security + runtime trust

## Runbooks

- `docs/runbooks/DEPLOYMENT_ROLLBACK.md`
- `docs/runbooks/INCIDENT_RESPONSE.md`
- `docs/runbooks/HIGH_VOLATILITY.md`
- `docs/runbooks/STREAM_RECONNECT.md`

## Secrets (production)

| Variable | Required |
|----------|----------|
| `EQUILIBRIUM_JWT_SECRET` | Yes (≥32 chars) |
| `EQUILIBRIUM_JWT_ROTATED_AT` | Recommended |
| `VERCEL_TOKEN` | GitHub deploy workflow |

## Global architecture (staged)

Current: **Vercel edge + regional serverless** with client-side HL WebSocket.

Roadmap: dedicated WS gateways (Fly.io/K8s), regional read replicas, queue-backed ingestion.

## SLO target

**99.9%** operational score composite (terminal + stream + API health).
