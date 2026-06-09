# Phase 54 — Global News, Macro & Cross-Asset Intelligence

Global information nervous system: news ingestion, event normalization, macro intelligence, ETF flows, regulatory monitoring, cross-asset relationships, propagation, and operational alerting.

## Console

- **Widget:** `globaldesk` — GLOBAL INTEL
- **Experience bar:** `G{globalScore}`
- **API:** `GET /api/global-intel/vitals`
- **Entitlement:** none (available on expanded workspace)

## Engines

| Phase | Engine |
|-------|--------|
| News ingestion | `NewsIngestionDeskEngine` → `InformationDistributionOrchestrator` |
| Event normalization | `EventNormalizationEngine` → structured `MacroEvent` |
| Macro intelligence | `MacroIntelligenceDeskEngine` → `useMarketAtmosphereStore` |
| ETF / institutional | `EtfFlowDeskEngine` → coverage institutional watches |
| Regulatory | `RegulatoryPolicyDeskEngine` |
| Cross-asset | `CrossAssetRelationshipDeskEngine` → `CrossMarketEngine` |
| Propagation | `EventPropagationDeskEngine` → cascade + narrative |
| Alerting | `GlobalAlertingDeskEngine` |

## Related panels

- `macro` — compact macro tape
- `newswire` — MARKET NEWSWIRE (Phase 23)
- `marketcoverage` — venue & ETF coverage registry
- `systemicintel` — systemic propagation & risk
