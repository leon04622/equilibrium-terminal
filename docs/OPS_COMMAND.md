# Internal Admin, Operations & Platform Control (Phase 51)

Equilibrium's **operational command center** — internal tooling for infrastructure, deployments, incidents, org admin, feature rollouts, runtime controls, support, security audit, billing visibility, and product intelligence.

## Philosophy

- **Observable, controllable, diagnosable** at institutional scale
- **Human operator central** — no autonomous infrastructure changes
- Extends DevOps (Phase 38), Enterprise Ops (Phase 28), Commercial admin (Phase 40)

## Architecture

```
types/ops-command.ts
lib/ops-command/              — 12 engines + orchestrator
store/useOpsCommandStore.ts
hooks/useOpsCommand.ts
components/.../OpsCommandConsole.tsx
api/ops-command/vitals
```

## Panel

| ID | Title | Experience |
|----|-------|------------|
| `opscommand` | OPS COMMAND | `C{controlScore}` |

Entitlement: **`infraDiagnosticsEnabled`** (team+ tier)

## Subsystems (Phases 1–10)

1. **Admin dashboard** — users, orgs, deployments, infra, WS, ingest, alerts, execution
2. **Observability center** — API, stream, ingestion, observability pipeline, regions
3. **Incident management** — open incidents, runbooks, auto-detect from DevOps
4. **Feature flags & release** — wedge, advanced panels, canary, enterprise, mobile (toggle in UI)
5. **Org administration** — tenants, seats, tiers from enterprise orchestrator
6. **Runtime controls** — stream restart, ingest failover, replay flush, cache, emergency calm
7. **Customer support** — tickets derived from operational incidents
8. **Security & audit** — compliance audit trail from enterprise ops
9. **Billing & entitlements** — plan, readiness, onboarding, API quota visibility
10. **Product intelligence** — readiness, retention, feature adoption, panel depth

## API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ops-command/vitals` | GET | Control score, incidents, command brief |

## Dashboard modes

- Command center · Incident ops · Release control · Customer support · Security & audit

## Extension path

1. RBAC-gated ops command (admin role only)
2. Server-persisted feature flags + org overrides
3. Live CI/CD deploy hooks from panel
4. PagerDuty / Slack escalation integration
5. Full internal admin SPA (separate route)
