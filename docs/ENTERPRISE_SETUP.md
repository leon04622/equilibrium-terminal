# Enterprise Setup Guide

## Organization provisioning

1. Contract **Enterprise Infrastructure** or **Institutional** tier
2. Configure `EQUILIBRIUM_DEPLOY_ENV=enterprise` on deployment
3. Set `EQUILIBRIUM_JWT_SECRET` (≥32 characters) for auth plane
4. Enable RBAC roles via SIWE session (`admin`, `trader`, `analyst`)

## Team setup

- **Desk** tier: up to 8 seats, Team Net, Alpha Lab
- **Institutional**: enterprise ops, integrations, global strategy modules
- Workspace snapshots via `/api/workspace/snapshot`

## Deployment options

| Mode | Provider | Notes |
|------|----------|-------|
| Hosted | Vercel (`iad1`) | Default production |
| Dedicated | AWS / GCP / K8s | Enterprise infra tier |
| Edge | Cloudflare | Static + API routing |

See `docs/DEVOPS_OPERATIONS.md` and runbooks in `docs/runbooks/`.

## Support & incidents

- PRODUCT → **SUPPORT** for ticket visibility
- INFRA → **LIVE OPS** for regional health
- Runbooks: `INCIDENT_RESPONSE.md`, `HIGH_VOLATILITY.md`

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Widget locked | Entitlement tier vs `WIDGET_ENTITLEMENT_MAP` |
| Auth failures | JWT secret, SIWE session |
| Stream down | INFRA LIVE OPS, `STREAM_RECONNECT` runbook |
| Low readiness score | PRODUCT → ANALYTICS, complete onboarding |
