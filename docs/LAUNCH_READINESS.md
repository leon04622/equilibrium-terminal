# Launch Readiness & Pre-Launch Hardening (Phase 40)

Phase 40 stops major feature expansion and unifies systems for institutional launch.

## Launch readiness score

Composite of required gates:

| Gate | Threshold | Weight |
|------|-----------|--------|
| System integration | 80 | Required |
| Workflow continuity | 70 | Required |
| Data quality | 85 | Required |
| Security hardening | 75 | Required |
| Performance | 70 | Required |
| Commercial readiness | 65 | Optional |
| UX cohesion | 75 | Optional |

Orchestrator: `src/lib/hardening/HardeningOrchestrator.ts`

## Integration audit domains

Ingestion · Intelligence · Execution · Charting · Workspaces · Collaboration · APIs · Alerting · OmniBar · Knowledge graph · Security · Enterprise · DevOps

## Workflow continuity

Discovery → Analysis → Monitoring → Execution → Journaling → Alerting → Persistence → Research → Collaboration

## Terminal UI

**RELIABILITY** panel → **LAUNCH** tab — integration audit, workflow scores, blockers, pre-launch environments.

Experience bar: `L{score}` launch readiness alongside `R{commercial}` and ops metrics.

## APIs & scripts

```bash
npm run ops:readiness
# EQ_READINESS_URL=https://equilibrium-terminal-three.vercel.app npm run ops:readiness
```

- `GET /api/hardening/readiness`

## Pre-launch environments

| ID | Purpose |
|----|---------|
| staging | Pre-production integration |
| qa | Regression workflows |
| stress | Volatility replay |
| enterprise_demo | Institutional demos |

Configure via `NEXT_PUBLIC_EQ_ENV` — see `src/config/environments.ts`.

## Related docs

- `docs/DEVOPS_OPERATIONS.md`
- `docs/COMMERCIAL_PRODUCT.md`
- `docs/ONBOARDING.md`
- `docs/runbooks/`

## Launch approval

`launchApproved: true` when all **required** gates are not `fail` and no blockers remain.

Controlled launch = deploy only when `ops:readiness` exits 0 in CI.
