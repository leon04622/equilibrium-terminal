# Terminal Performance — Low-Latency Runtime (Phase 36)

Institutional-grade operational performance layer. Performance is product quality.

## Architecture

| Module | Role |
|--------|------|
| `PerformanceEngine` | Boots monitors, publishes vitals, multi-window pulse |
| `StreamProcessingEngine` | rAF-coalesced L2 + trade ingress, backpressure |
| `RenderMonitor` | FPS, p95 frame time, dropped frames |
| `StressModeController` | Auto/manual high-volatility coalesce mode |
| `MemoryOrchestrator` | Long-session buffer pruning (2 min cycle) |
| `MultiWindowCoordinator` | `BroadcastChannel` bridge for detached windows |
| `PerformanceBudgets` | Strict latency budgets |

## Stream path

```
Hyperliquid WS → useTerminalStreams → StreamProcessingEngine (coalesce)
  → rAF flush → terminalStore.applyBook / pushTrades
```

Under **stress mode** (`data-eq-stress` on `<html>`):
- Trade batches capped and intel tape writes skipped (`skipIntel`)
- Larger coalesce windows

Stress triggers: >90 msg/s, frame drops, heap >512MB, manual **STR** toggle.

## Observability

- Header: **PERF** toggles compact HUD (FPS · ms · stream/s · heap)
- **EXPAND** workspace → **DIAGNOSTICS** panel → runtime row (FPS, P95, coalesce, stress)
- Trader telemetry row unchanged (EVT/s, buffer, heap hint)

## Budgets (defaults)

| Metric | Warn | Critical |
|--------|------|----------|
| Frame time | 20ms | 33ms |
| Stream flush | 12ms | — |
| Command parse | 8ms | — |
| Heap | — | 512MB |

## Multi-monitor

`MultiWindowCoordinator` broadcasts vitals + asset/layout hooks. Detached windows should subscribe on init (future panel).

## Extension

- Register panel render timings via `PerformanceEngine` (future)
- Wire multi-exchange adapters through `StreamProcessingEngine` priority queues
- Off-main-thread normalization in `StreamProcessingEngine.flush` (Worker)
