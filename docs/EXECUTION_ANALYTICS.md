# Execution Analytics, Order Flow & Liquidity Visibility (Phase 43)

Operational execution intelligence layer — built on Phase 14 `OrderFlowEngine` (Web Worker) and DOM/slippage widgets.

## Capabilities

| Phase | Implementation |
|-------|----------------|
| Order flow | `OrderFlowAnalyticsEngine` — aggression, sweeps, momentum, imbalance |
| Liquidity | `LiquidityVisibilityEngine` — heatmap, voids, spoof/iceberg scores |
| Execution quality | `ExecutionQualityEngine` — slippage, spread, latency, efficiency |
| Microstructure | `MicrostructureEngine` — spread velocity, vacuum, pressure |
| Cross-venue | `CrossVenueExecutionEngine` — HL vs CEX divergence |
| Chart overlays | `ExecutionChartOverlayBridge` → chart `execution` markers |
| Alerts | `ExecutionAlertEngine` — collapse, flow spikes, slippage, spreads |
| Workspace modes | Scalping, liquidity monitor, vol execution, multi-venue, HF |

## Terminal UI

- **DOM LADDER** + **SLIPPAGE RADAR** — wedge execution desk (existing)
- **EXECUTION INTEL** panel (`execintel`) — EXPAND workspace, unified analytics console
- Chart overlays: enable **aggressor_flow** / **imbalance** in chart toolbar

## APIs

- `GET /api/execution/vitals?asset=BTC`

## Worker pipeline

```
HL book/trades → OrderFlowEngine (worker) → useExecutionIntelligenceStore
                                         → ExecutionAnalyticsOrchestrator
```

## Philosophy

Human trader remains central. Execution intelligence informs decisions — no autonomous trading.
