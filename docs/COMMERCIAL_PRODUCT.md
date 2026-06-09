# Commercial Product & Release Readiness (Phase 39)

Equilibrium Terminal is packaged as institutional market infrastructure — not a retail dashboard.

## Product tiers

| Tier | Maps to subscription | Audience |
|------|---------------------|----------|
| **Professional** | `desk` | Solo operators, PMs |
| **Desk** | `team` | Multi-trader desks |
| **Institutional** | `enterprise` | Funds, market makers |
| **Enterprise Infrastructure** | `enterprise` | Dedicated deploy, SLA |

Catalog: `src/lib/commercial/ProductCatalog.ts`

## Entitlements

Feature gating uses `ENTITLEMENTS_BY_TIER` and `WIDGET_ENTITLEMENT_MAP` in `src/types/production-platform.ts`.

Runtime: `SubscriptionEntitlementEngine.canAccessWidget(type)`

## Onboarding

- Walkthrough overlay on first sessions (`OnboardingWalkthrough`)
- Progress in `localStorage` key `eq-onboarding-v1`
- API: `GET/POST /api/commercial/onboarding`

Steps: workspace template → exchange connect → execution desk → OmniBar → expand workspace.

## Customer operations

- Support tickets derived from ops incidents (`CustomerOperationsEngine`)
- PRODUCT panel → **SUPPORT** tab

## Release channels

Integrated with DevOps `DeploymentOrchestrator`:

- **stable** — production default
- **beta** — blue/green staging
- **canary** — partial rollout

See `ReleaseManagementEngine` and `docs/DEVOPS_OPERATIONS.md`.

## Admin platform

PRODUCT panel → **ADMIN** — sessions, feature flags, deployments, subscriptions, incidents.

## APIs

- `GET /api/commercial/vitals` — readiness, trust, subscription summary
- `GET/POST /api/commercial/onboarding` — onboarding state

## Analytics

`ProductAnalyticsEngine` tracks onboarding completion, workspace depth, feature adoption, retention signal.

## Market positioning

Bloomberg for crypto · institutional market infrastructure · execution-aware operating system · human trader central.

## Release channels {#release-channels}

Documented rollout policy for enterprise contracts and beta programs.
