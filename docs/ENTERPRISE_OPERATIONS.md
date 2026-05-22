# Enterprise Operations & Institutional Management (Phase 28)

Equilibrium transitions from individual/team trading workflows to **full institutional operational infrastructure** — the layer hedge funds, prop firms, and crypto-native institutions use to run entire market operations inside the terminal.

## Architecture

```
types/enterprise-operations.ts     — schemas
lib/enterprise/                    — 10 engines + EnterpriseOrchestrator
store/useEnterpriseOpsStore.ts     — UI state
hooks/useEnterpriseOperations.ts   — tick, sync, event wiring
components/.../EnterpriseOperationsConsole.tsx
api/enterprise/sync                — tenant ops sync
api/enterprise/vitals              — enterprise health
```

Builds on Phase 13 (production platform), Phase 22 (reliability), Phase 27 (collaboration).

## Panel

| ID | Commands | Shortcut |
|----|----------|----------|
| `enterpriseops` | `/enterprise`, `/enterpriseops`, `/orgops`, `/focus enterprise` | `Ctrl+Shift+O` |

Entitlement: **`enterpriseOpsEnabled`** (enterprise tier only)

## Subsystems

### Enterprise workspace management
- Organization-level workspaces with tenant isolation
- Centralized workspace templates (institutional, prop, treasury presets)
- Team inheritance and layout versioning

### Organizational RBAC
Extended roles: admin, portfolio_manager, trader, analyst, researcher, read_only, compliance, operations

Fine-grained permissions: org management, desk management, orders, research, alerts, portfolio, audit, compliance, infra deploy

### Multi-desk operations
Six desk types: macro, execution, quant, treasury, research, monitoring — each with specialized workflow modes and status

### Portfolio & treasury visibility
- Cross-asset exposure rows (spot, perp, stablecoin, defi)
- Treasury summary: AUM, stablecoin %, cross-exchange balance, leverage, net delta

### Enterprise alert governance
- Org-wide and desk-scoped alert rules
- Escalation tiers: desk → org → compliance → executive
- Subscriber counts and trigger history

### Compliance & auditability
Unified audit trail from:
- Platform save logs (`serverSaveLogs`)
- Collaboration audit entries
- Access, execution, workspace, intelligence events

Gated by `canViewAudit` permission.

### Enterprise communication
Operational notices: briefings, incidents, operational notices, execution coordination — no social behavior.

### Organizational knowledge
Playbooks, event analysis, execution reviews, market reaction archives.

### Multi-tenant architecture
Tenant partitions with isolation levels (strict, standard, shared_infra), data boundaries, sync regions.

### Enterprise reliability
Uptime, redundancy mode, failover readiness, DR RPO/RTO, deterministic ops flag — derived from Phase 22 reliability engine + platform vitals.

## Console tabs

**ORG · DESKS · PORTFOLIO · ALERTS · AUDIT · COMMS · KNOWLEDGE · TENANT · RELIABILITY**

## Event bus

- `enterprise:notice` — critical operational notices

## Integration map

| Existing panel | Enterprise feed |
|----------------|-----------------|
| `dailyops` | Session routines, briefings |
| `reliability` | Trust score, runtime health |
| `infra` | Gateway/worker vitals |
| `collab` | Desk audit, team activity |
| `positions` | Live portfolio exposure |

## Roadmap

- JWT-gated enterprise API routes
- External IdP / billing-linked tier enforcement
- Real cross-exchange treasury aggregation
- Compliance export (SOC2-style audit bundles)
- Multi-region tenant deployment controls

## Long-term objective

Equilibrium evolves into **institutional operational infrastructure for crypto markets** — deeply embedded across organizations the way Bloomberg is embedded across traditional finance.
