# Portfolio, Risk & Treasury Management (Phase 44)

Institutional financial operating layer — unified portfolio visibility, real-time risk, treasury monitoring, and collateral health on top of Hyperliquid account streams and Phase 42 multi-exchange quotes.

## Capabilities

| Phase | Implementation |
|-------|----------------|
| Unified portfolio | `UnifiedPortfolioEngine` — HL positions + enterprise treasury seed |
| Risk | `RiskEngine` — leverage, liquidation proximity, concentration, bias |
| Treasury | `TreasuryVisibilityEngine` — stablecoins, liquidity, custody |
| Analytics | `PortfolioAnalyticsEngine` — PnL, drawdown, capital efficiency |
| Collateral | `CollateralLiquidityEngine` — margin health, utilization, liq proximity |
| Cross-venue | `CrossVenuePositionEngine` — HL + CEX fragmentation |
| Alerts | `PortfolioRiskAlertEngine` — liquidation, leverage, concentration |
| Dashboards | `PortfolioDashboardModes` — trader risk, treasury, overview, collateral, exposure |
| History | `PortfolioHistoryEngine` — local exposure / leverage memory |
| Telemetry | `PortfolioDeskTelemetry` — compute latency, data quality |

## Terminal UI

- **POSITIONS** panel — live HL book (wedge desk)
- **PORTFOLIO DESK** (`portfoliodesk`) — EXPAND workspace, unified financial operating console
- Experience bar: `P{portfolioHealthScore}`

## APIs

- `GET /api/portfolio/vitals?asset=BTC`

## Data pipeline

```
HL clearinghouse WS → terminalStore (positions, margin)
                   → PortfolioDeskOrchestrator
Phase 42 CEX quotes → CrossVenuePositionEngine
Enterprise seed     → PortfolioTreasuryEngine (treasury rows)
```

## Philosophy

Human trader and treasury operator remain central. Portfolio intelligence informs capital decisions — no autonomous allocation or AI trading.
