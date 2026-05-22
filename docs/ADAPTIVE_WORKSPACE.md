# Adaptive Workspace Intelligence (Phase 15)

## Objective

Evolve Equilibrium Terminal from maximum information density to **context-aware information orchestration** — surfacing the highest-value panels for the current trader state, market regime, and workflow.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  AdaptiveOrchestratorBar (mode / focus / auto / sync)      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  useAdaptiveWorkspace (8s tick + mode/focus subscriptions)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 WorkspaceContextEngine  PanelPriorityEngine  AttentionGovernor
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                   LayoutOrchestrator
                            │
                            ▼
              useAdaptiveWorkspaceStore
                            │
                            ▼
              WorkspaceManager (layout + emphasis)
```

### Core modules

| Module | Role |
|--------|------|
| `WorkspaceContextEngine` | Aggregates asset, execution, regime, volatility, telemetry friction |
| `PanelPriorityEngine` | relevance · urgency · activity · affinity → composite score |
| `AttentionGovernor` | Cognitive load model; flash/alert/intel suppression flags |
| `ModePresets` | Mode + focus layout seeds before dynamic resize |
| `LayoutOrchestrator` | Applies presets, scales heights, collapse/hide deprioritized panels |
| `PanelDefinitions` | Per-mode base weights for all workspace panels |

### Terminal modes

`balanced`, `execution`, `research`, `macro`, `scalping`, `ai_analyst`, `portfolio`, `narrative`, `quant`

### Focus modes

`execution_deep`, `chart_isolated`, `ai_briefing`, `macro_command`, `asset_war_room`

## Panel priority model

Each panel receives:

- **Relevance** — mode weights + regime/workflow boosts
- **Urgency** — volatility, slippage tier, execution state, alerts
- **Activity** — focus panel, workflow phase
- **Affinity** — dwell time from Phase 11 telemetry trends

Composite score drives: emphasize (ring highlight), collapse (min height), hide (removed from visible grid).

## Attention management

When `overloadRisk > 0.5`:

- Suppress non-critical flashes
- Deduplicate intelligence surfacing (consumer hooks TBD)
- Throttle alert fan-out when alert fatigue is high

## Integration points

- **Phase 11** — `useTraderTelemetry` (affinity, friction); `autoApplyLayout` stays `false` to avoid RGL loops
- **Phase 10** — `useMarketAtmosphereStore.regime.regime`, stress gauge
- **Phase 14** — slippage risk tier, execution coin
- **User lock** — manual drag/resize locks auto-adapt for 5 minutes

## Usage

1. Select **terminal mode** from the header orchestrator bar.
2. Optional **focus mode** for deep-work layouts.
3. Toggle **AUTO** to enable periodic layout commits (off by default).
4. **SYNC** applies orchestration immediately.

## Implementation roadmap

### Phase 15a (shipped)

- [x] Types, store, context engine, priority engine
- [x] Layout orchestrator + mode/focus presets
- [x] Attention governor + cognitive load surfacing
- [x] Header orchestrator bar + workspace wiring
- [x] Panel emphasis styling

### Phase 15b (next)

- [ ] Wire `suppressFlashes` / `throttleAlerts` into AlertPanel + ProactiveMonitor
- [ ] Merge `AdaptiveOptimizer` velocity suggestions with orchestrator (single commit path)
- [ ] Persist mode + affinity to workspace snapshot (Phase 13 API)
- [ ] Regime auto-mode switch (opt-in): recommend → apply when confidence high

### Phase 15c (learning)

- [ ] Panel ignore/engage ML features from telemetry export batch
- [ ] Session workflow classifier (executing vs research) with hysteresis
- [ ] A/B layout proposals with trader accept/reject feedback

### Phase 15d (focus infrastructure)

- [ ] True fullscreen focus (hide chrome, single panel viewport)
- [ ] War room: sync chart + book + intel to single asset bus channel
- [ ] AI briefing: timed narrative digest with reduced panel set

## Design principle

> Do not display everything at once. Display the highest-value information for the current trader state.
