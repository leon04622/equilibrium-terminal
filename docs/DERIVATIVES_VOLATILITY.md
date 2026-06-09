# Options, Derivatives & Volatility Infrastructure (Phase 45)

Institutional derivatives intelligence layer — options chains, volatility analytics, gamma positioning, and funding/OI surveillance.

## Capabilities

| Phase | Implementation |
|-------|----------------|
| Options ingestion | `OptionsIngestionEngine` — Deribit public chain + Binance/OKX synthesis |
| Volatility | `VolatilityEngine` — IV, RV, skew, term structure, regime |
| Options analytics | `OptionsAnalyticsEngine` — put/call, max pain, OI ladder |
| Gamma & positioning | `GammaPositioningEngine` — dealer gamma, pin, squeeze risk |
| Perp & funding | `PerpFundingAnalyticsEngine` — cross-venue funding, OI, crowding |
| Market state | `DerivativesMarketStateEngine` — fragility, leverage saturation |
| Cross-market | `CrossMarketDerivativesEngine` — basis, fragmentation |
| Alerts | `DerivativesAlertEngine` — IV, funding, OI, gamma, liquidation |
| Dashboards | `DerivativesDashboardModes` — vol, chain, funding, gamma, cross |

## Terminal UI

- **DERIVATIVES DESK** panel (`derivdesk`) — EXPAND workspace
- Experience bar: `V{derivativesScore}`
- Chart: enable **funding** / **open_interest** overlays (existing chart toolbar)

## APIs

- `GET /api/derivatives/vitals?asset=BTC`

## Data pipeline

```
Deribit options REST → derivativesMarketState
Phase 42 CEX quotes   → PerpFundingAnalyticsEngine
HL candles/book       → VolatilityEngine (realized vol)
                     → DerivativesIntelligenceOrchestrator
```

## Philosophy

Human trader remains central. Derivatives intelligence informs vol, positioning, and risk decisions — no autonomous options trading.
