# Institutional API, SDK & Platform Extensibility (Phase 49)

Equilibrium transitions from self-contained terminal to **programmable crypto market infrastructure** — enabling institutions, developers, quants, and desks to integrate directly with Equilibrium systems.

## Philosophy

Bloomberg became indispensable because organizations built workflows around its infrastructure. Equilibrium evolves similarly: **institutional extensibility without autonomous AI execution**. APIs organize and deliver; humans remain central.

## Architecture

```
types/platform-extensibility.ts     — schemas
lib/platform-desk/                  — 10 engines + orchestrator
store/usePlatformDeskStore.ts
hooks/usePlatformDesk.ts
components/.../PlatformDeskConsole.tsx
api/platform/vitals                 — gateway health & score
```

Builds on industry integrations (Phase 29), data ingestion (Phase 24), distribution webhooks (Phase 23), and phase vitals APIs (43–48).

## Panel

| ID | Title | Experience |
|----|-------|------------|
| `platformdesk` | PLATFORM DESK | `E{platformScore}` |

Entitlement: **`null`** (advanced workspace, same as recent desk panels)

## Subsystems (Phases 1–10)

### 1 — Institutional API gateway
Unified catalog: legacy integration routes + all phase vitals endpoints + staged WebSocket gateway.

### 2 — SDK ecosystem
TypeScript (beta), Python (beta), Go/Rust (staged) — market ingestion, intelligence, alerts, workspace automation, research hooks.

### 3 — Plugin & extensibility
Registry: custom panels, OmniBar extensions, chart analytics overlays, workspace automation, dashboard builder (staged).

### 4 — Quant & research APIs
Replay, events, derivatives, volatility, liquidity, research vitals — REST and streaming surfaces per asset.

### 5 — Webhook & event delivery
Critical alerts, intel digest, execution fills, regime shifts, workflow triggers — delivery counts and status.

### 6 — Enterprise integration
Treasury, OMS, risk, reporting, internal dashboards — REST/webhook/FIX-staged connectors.

### 7 — Authorization & API security
Scoped API keys (local persistence), rate limits, daily quotas, usage tracking — integrates with `ApiSecurityGuard` on routes.

### 8 — Developer experience
API reference, SDK guides, playground (`/api/platform/vitals`), examples, onboarding checklist.

### 9 — Embeddable infrastructure
Reuses `EmbeddableInfrastructureEngine` — newswire, intel monitor, vol gauge, portfolio strip, surveillance.

### 10 — Platform observability
Per-route p50/p99, error rates, request rates — gateway-derived telemetry.

## APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/platform/vitals` | GET | Platform score, telemetry, integration brief |

Query: `?asset=BTC`

## Dashboard modes

- **API gateway** — ingestion + integrations panels
- **SDK & developer** — integrations + ecosystem
- **Quant & research** — memory, research, derivatives desks
- **Enterprise connect** — enterprise ops + portfolio
- **Embeddable ops** — integrations + newswire

## SDK

```bash
# TypeScript (beta)
npm install @equilibrium/terminal-sdk

# Python (beta)
pip install equilibrium-terminal
```

## Onboarding

1. Request scoped API key (desk read-only or quant streaming).
2. Probe `/api/platform/vitals?asset=BTC`.
3. Subscribe to `/api/ingestion/events` for normalized events.
4. Configure webhooks via distribution gateway.
5. Embed widgets from `/api/integrations/feed`.

## Extension path

1. Publish SDK packages to npm/PyPI with signed request helpers.
2. Live WebSocket gateway at `/ws/market` with API key auth.
3. Server-side API key vault + org RBAC from `RbacEngine`.
4. Plugin marketplace with signed extensions.
5. OpenAPI spec generation from gateway catalog.
