# Billing, Entitlement & Institutional Commercial Infrastructure (Phase 52)

The **monetization and entitlement core** of Equilibrium Terminal — institutional-grade subscriptions, feature gating, org seats, API metering, and billing operations.

## Philosophy

- Not retail gimmick billing — **desk, fund, enterprise, and API consumer** tiers
- Centralized entitlements via `SubscriptionEntitlementEngine` + `ENTITLEMENTS_BY_TIER`
- Human trader remains central; commercial layer gates **modules**, not judgment

## Architecture

```
types/billing-commercial.ts
lib/billing-desk/                 — 12 engines + orchestrator
store/useBillingDeskStore.ts
hooks/useBillingDesk.ts
components/.../BillingDeskConsole.tsx
api/billing/vitals
```

Builds on Phase 39 (`lib/commercial/`), Phase 28 enterprise ops, Phase 51 ops command.

## Panel

| ID | Title | Experience |
|----|-------|------------|
| `billingdesk` | BILLING DESK | `B{commercialScore}` |

Entitlement: **`diagnosticsEnabled`** (desk tier+)

## Product tiers

| Tier | Subscription map | Seats (default) |
|------|------------------|-----------------|
| Professional | `desk` | 1 |
| Desk | `team` | 8 |
| Institutional | `enterprise` | 64 |
| Enterprise Infrastructure | `enterprise` | 256 |

Catalog: `src/lib/commercial/ProductCatalog.ts`

## Subsystems (Phases 1–10)

1. **Subscription architecture** — plans, cycles, trials, renewals
2. **Entitlement engine** — modules, widgets, API scopes
3. **Org & seat management** — provisioning, admin users
4. **API usage metering** — quotas, streams, webhooks
5. **Billing operations** — invoices, failed payments
6. **Payment infrastructure** — Stripe (staged), wire, tax, dunning
7. **Enterprise licensing** — MSA, dedicated infra, negotiated pricing
8. **Access governance** — entitlement audit log
9. **Commercial analytics** — retention, adoption, seat/API utilization
10. **Reliability** — payment retry, entitlement cache, fault tolerance

## APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/billing/vitals` | GET | Commercial score, telemetry, plans |
| `/api/commercial/vitals` | GET | Legacy product readiness (Phase 39) |

## Dashboard modes

- Subscription ops · Entitlement admin · Enterprise licensing · Usage metering · Billing support

## Extension path

1. Stripe Checkout + Customer Portal integration
2. Server-side entitlement sync (Redis/org partition)
3. Usage-based billing for API overage
4. Self-serve plan upgrade/downgrade flows
5. SOC2-aligned billing audit exports
