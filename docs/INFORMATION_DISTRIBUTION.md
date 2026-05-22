# Real-Time Information Distribution (Phase 23)

Equilibrium evolves from **market intelligence consumption** to **market intelligence distribution infrastructure** — a crypto-native operational newswire. Human traders remain central; AI organizes and routes information only.

## Architecture

| Module | Role |
|--------|------|
| `NewswireIngestPipeline` | Merges alerts, tactical wire, surveillance, intel, coverage into unified tape |
| `EventPrioritizationEngine` | Urgency · impact · relevance scoring with volatility-aware boosts |
| `IncidentMonitorEngine` | Exchange stress, API instability, depegs, liquidation regime, treasury/bridge signals |
| `BriefingDispatchEngine` | Pre-market, volatility, macro, liquidity, narrative, exchange stress, daily state |
| `PersonalizedDeliveryEngine` | Watchlist + active-asset contextual filtering |
| `InformationQualityGovernor` | Dedupe suppression, verification ratio, timestamp integrity |
| `NotificationDeliveryEngine` | Desktop + webhook delivery with severity thresholds |
| `ExternalDistributionEngine` | Syndication feed metadata and export format |
| `InformationDistributionOrchestrator` | Unified snapshot |

## UI

- **MARKET NEWSWIRE** panel (`newswire`) — tabs: TAPE · INCIDENTS · BRIEFINGS · PERSONAL · DELIVERY · SYNDICATE
- Commands: `/newswire`, `/wire`, `/distribute`, `/incidents`
- Focus: `/focus newswire` · shortcut `Ctrl+N`

## Event bus

| Event | Purpose |
|-------|---------|
| `distribution:event` | Critical ranked newswire item surfaced |
| `distribution:incident` | Operational incident flagged |
| `briefing:published` | Briefing dispatch hook (extension) |

## External APIs

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/distribution/feed` | GET | Institutional JSON feed (cached ranked tape) |
| `/api/distribution/feed` | POST | Terminal sync of live ranked events |
| `/api/distribution/webhook` | POST | Proxy webhook delivery for configured URLs |

## Delivery philosophy

- **Terminal-first** — tape is authoritative in-session
- **Calm by default** — dedupe + severity gates prevent spam
- **Urgent when necessary** — critical events → desktop + webhook + reliability audit
- **Institutional tone** — operational headlines, no social-media presentation

## Implementation roadmap

1. **Now** — Unified ingest, ranking, incidents, briefings, personal delivery, desktop/webhook
2. **Next** — Telegram/Discord bot connectors, email digest scheduler
3. **Next** — RSS/Atom syndication, API keys, subscriber entitlements
4. **Next** — Multi-tenant feed partitioning for fund desks
5. **Long-term** — Embeddable widgets, research syndication, media integrations

## Extension path

1. Connect external newswire sources into `NewswireIngestPipeline` with `InformationQualityGovernor` validation
2. Wire `NotificationDeliveryEngine` to production Telegram/Discord APIs
3. Persist delivery log server-side for compliance audit trails
4. Cross-link incidents → `AlertWorkflowBridge` for stress-session automation (human-triggered only)
