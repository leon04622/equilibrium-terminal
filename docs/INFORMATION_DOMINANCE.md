# Information Dominance & Discovery (Phase 17)

## Objective

Make Equilibrium the **fastest** way for professional traders to discover what matters, understand structure, and act with full context — without AI overriding judgment.

## Shipped capabilities

### Unified intelligence index

`IntelligenceIndex` aggregates assets, intelligence items, macro tickers, tactical wire, agent signals, and commands into one searchable index.

### OmniBar command layer

- Live discovery results grouped by category (SYM, INTEL, NARR, MACRO, WHALE, CMD…)
- Commands: `/nav`, `/watch`, `/unwatch`, `/intel`, `/liq`, `/macro`, `/vol`, `/summarize`, `/focus`, `/trade`
- `/summarize` — AI context summary with explicit **no trade advice** prompt
- Index row select → navigate to widget + asset

### Market surveillance monitor

- **MOVERS** heat strip from `allMids` tick changes
- **WATCHLIST** (institutional surveillance list)
- **WHAT MATTERS NOW** prioritized headlines
- Per-asset **TIMELINE** from intelligence + wire

### Execution context strip

Information-aware fields on trade ticket: spread, slippage tier, regime, stress, velocity, exec pipeline — **context only**.

### Mission-aligned copy

- Decision panel reframed as **MARKET CONTEXT** (not “Decision OS”)
- Developments use surveillance language (structure noted, monitor, review) — not trade calls

## Architecture

```
Streams → IntelligenceIndex (3s)
              ↓
    InformationDiscoveryEngine.search()
              ↓
           OmniBar UI

allMids + atmosphere → MarketSurveillanceEngine (2s)
              ↓
    MarketSurveillanceMonitor
```

## Roadmap

### 17b

- [ ] Keyboard shortcuts (G+asset, W+watch, etc.)
- [ ] Cross-exchange divergence feed
- [ ] Funding / OI columns in movers table
- [ ] Persist watchlist to workspace snapshot API

### 17c

- [ ] Full-text intelligence index (worker-backed)
- [ ] Relationship graph from Omni `/net`
- [ ] Multi-monitor layout presets (Bloomberg-style)
