# Runbook: Incident Response

## Severity

| Level | Example | Response |
|-------|---------|----------|
| SEV1 | Total outage, cannot trade | Immediate, all hands |
| SEV2 | Stream stale >30s, auth broken | <15 min acknowledge |
| SEV3 | Stress mode, elevated latency | Monitor, next window |

## Workflow

1. **Detect** — `/api/ops/health`, PERF HUD, LIVE OPS incidents
2. **Triage** — stream vs auth vs deploy vs exchange
3. **Mitigate** — runbook-specific (see STREAM_RECONNECT, DEPLOYMENT_ROLLBACK)
4. **Communicate** — status + ETA (no trade advice)
5. **Resolve** — verify operational score ≥85
6. **Postmortem** — audit trail, action items

## Escalation

- On-call engineer → platform lead → exchange status page if HL outage

## Tools

- Vercel logs / analytics
- Browser: RELIABILITY, INFRA LIVE OPS, TRUST tabs
- `GET /api/security/audit` (authenticated)
