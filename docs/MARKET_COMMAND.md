# Phase 58 — Global Market Command Center

Centralized situational awareness and institutional visual operations layer for Equilibrium Terminal.

## Widget

- **ID:** `marketcmd`
- **Panel:** MARKET CMD
- **Experience bar:** `S{situationalScore}`

## API

`GET /api/market-command/vitals` — situational score, telemetry, brief, AI summary.

## Subsystems (composed, not duplicated)

| Engine | Role |
|--------|------|
| `GlobalMarketOverviewEngine` | Coverage, regime, stress, intel density |
| `SystemicRiskCommandEngine` | Leverage, contagion, fragmentation |
| `LiquidityMapsCommandEngine` | Flow maps + execution book depth |
| `VolatilityCommandEngine` | Regime, stress, derivatives desk |
| `IncidentCommandModeEngine` | Distribution incidents + systemic alerts |
| `CrossAssetVisualizationEngine` | Cross-market, macro, global intel |
| `OrganizationalCommandEngine` | Desk ops + enterprise alert governance |
| `VisualOrchestrationEngine` | Terminal mode, density, immersion |
| `SituationalAiSummaryEngine` | AI-assisted summary only |

## Dashboard modes

- Situation room
- Systemic watch
- Liquidity map
- Incident command
- Cross-asset

Modes persist in `eq-market-command-mode-v1` and adjust adaptive workspace terminal mode.

## Philosophy

Continuous situational awareness for professional operators — not disconnected widgets or AI replacing traders.
