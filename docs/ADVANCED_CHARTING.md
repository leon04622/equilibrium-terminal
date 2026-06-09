# Advanced Charting, Visual Analytics & Market Replay (Phase 34)

Charts are **operational decision surfaces** — not decoration.

## Architecture

| Module | Role |
|--------|------|
| `ChartDataEngine` | Viewport windowing, trade→OHLCV fallback, incremental merge |
| `ChartSyncCoordinator` | Linked timeframe / cursor sync via event bus |
| `ReplayEngine` | Historical candle playback, scrub, speed |
| `EventOverlayEngine` | Intelligence + large-trade markers |
| `VolumeProfileEngine` | Volume profile rows, CVD / aggressor flow |
| `ChartAnalyticsOrchestrator` | Unified chart analytics snapshot |
| `useChartAnalyticsStore` | UI state: timeframe, overlays, replay, display candles |
| `ChartAnalyticsToolbar` | LIVE / REPLAY / SYNC / timeframe / scrub |

## Shipped in V1

- Timeframe selection (1s → 1d)
- Event markers on chart (intel + large trades)
- Volume profile + flow metrics from tape
- Market replay (play / pause / scrub / live)
- Multi-chart sync bus (`chart:sync`, `chart:cursor`)
- Microstructure strip (spread, book imbalance)
- Tactical canvas overlay (liquidity / liquidation zones)

## Roadmap

| Track | Items |
|-------|--------|
| Microstructure | Depth overlay, aggressor footprints, withdrawal zones |
| Derivatives | Funding / OI / IV overlays, liquidation heatmap |
| Multi-chart | Detached windows, multi-monitor layouts |
| Replay+ | Order book replay, macro event playback |
| Annotations | Trend lines, zones, collaborative tags |
| Performance | Virtualized history, incremental series updates |

## Panel

Primary surface: **Chart** panel on execution desk and full workspace.

Human trader central — AI does not draw trade signals on chart.
