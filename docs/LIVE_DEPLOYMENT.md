# Phase 60 — Live Market Deployment & Institutional Alpha

Operational validation layer — real-world usage drives priorities, not endless feature expansion.

## Widget

- **ID:** `livedeploy`
- **Panel:** LIVE DEPLOY
- **Experience bar:** `N{deploymentScore}`

## API

`GET /api/live-deployment/vitals`

## Composed systems (do not duplicate)

| Engine | Source |
|--------|--------|
| Controlled alpha | `InviteGateEngine`, `AlphaFeatureFlags`, desk org workspaces |
| Infra validation | DevOps, execution analytics, terminal stream |
| Telemetry | `RetentionMetricsEngine`, `WorkflowObserverEngine`, trader telemetry |
| Retention | Alpha retention + trust validation |
| Feedback | `FeedbackIterationEngine` pain points |
| Hardening | Hardening + reliability + DevOps streams |
| Support | Ops command incidents, tickets, runtime controls |
| Enterprise | Commercial + hardening readiness |

## Dashboard modes

- Alpha control
- Infra validation
- Telemetry ops
- Enterprise go-live
- Incident ready

## Invite codes (default)

`EQ-ALPHA-2026`, `EQ-HL-DESK`, `EQ-EXEC` — override via `NEXT_PUBLIC_EQ_ALPHA_CODES`.

URL shortcut: `https://equilibrium-terminal-three.vercel.app/?invite=EQ-ALPHA-2026`

## Bypass for operator / owner testing (Vercel env)

| Variable | Value | Effect |
|----------|-------|--------|
| `NEXT_PUBLIC_EQ_OPERATOR_ACCESS` | `true` | Skip invite gate entirely |
| `NEXT_PUBLIC_EQ_ALPHA_INVITE_REQUIRED` | `false` | Same — open production access |

Redeploy after changing env vars.

## Philosophy

Feature-complete enough. Focus: reliability, workflow superiority, retention, institutional confidence.
