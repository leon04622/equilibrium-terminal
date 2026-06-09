# Historical Market Memory, Replay & Regime Analysis (Phase 47)

Persistent institutional market memory — event archives, chart replay integration, regime epochs, analog search, and research annotation memory.

## Capabilities

| Phase | Implementation |
|-------|----------------|
| Event archive | `HistoricalEventArchiveEngine` — time-indexed local archive |
| Replay | `MarketReplayOrchestrator` — wraps `chartReplayEngine` + book/intel context |
| Regime analysis | `RegimeAnalysisEngine` — vol/liquidity/leverage/macro epochs |
| Search | `HistoricalSearchEngine` — searchable event archive |
| Analogs | `MarketAnalogEngine` — similarity vs operational memory + live metrics |
| Liquidity history | `HistoricalLiquidityEngine` — depth/fragmentation time series |
| Narrative evolution | `NarrativeEvolutionEngine` — phase timeline |
| Portfolio memory | `PortfolioRiskMemoryEngine` — leverage/drawdown history |
| Research memory | `ResearchAnnotationMemoryEngine` — desk annotations |

## Terminal UI

- **MARKET MEMORY** panel (`memorydesk`) — EXPAND workspace
- **Chart** — existing replay controls sync via `chartReplayEngine`
- Experience bar: `H{memoryScore}`

## APIs

- `GET /api/memory/vitals?asset=BTC&q=liquidation`

## Storage

Client-side `localStorage` keys: `eq-historical-events-v1`, `eq-regime-epochs-v1`, `eq-liq-history-v1`

## Philosophy

Operational memory for human traders — revisit regimes and events; no autonomous backtesting or signal generation.
