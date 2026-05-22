# Daily Market Operating Environment (Phase 20)

Equilibrium Terminal as the **daily operational home** for serious crypto traders — institutional prep, session awareness, and calm market context. AI organizes information only; humans decide.

## Systems

| Module | Role |
|--------|------|
| `SessionClockEngine` | Asia / Europe / US / overlap / weekend crypto sessions; liquidity phase; next transition |
| `DailyBriefingEngine` | Overnight summary, vol/liq/funding/macro/narrative bullets — answers *what matters before the session* |
| `MarketStateLayer` | Persistent vol, liquidity, funding, sentiment, macro risk, breadth, risk-on/off |
| `MarketMemoryArchive` | Local session archives for operational memory |
| `AlertPrioritizer` | Session- and watchlist-aware alert ranking (reduces fatigue) |
| `RoutineCatalog` | Morning briefing, vol/liq/funding scans, execution prep, post-session review |
| `SessionWorkflowEngine` | London / NY / Asia open, weekend, post-FOMC, ETF hours presets |
| `PersonalOpsEngine` | Watchlist, alerts, journal, saved views, checklist |

## UI

- **DAILY OPERATIONS** panel (`dailyops`) — tabs: BRIEF · STATE · SESSION · MY OPS · ROUTINES
- **Header strip** (`DailyStateStrip`) — live session + market condition at a glance

## Commands & shortcuts

- `/briefing` or `/brief` — focus daily ops
- `/routine morning_briefing` — launch routine
- `Ctrl+B` — daily operations panel
- Session presets from SESSION tab (Asia / London / NY / Weekend / Post-FOMC / ETF)

## Storage

- `eq-market-memory-v1` — session memory entries
- `eq-personal-ops-v1` — pins, favorites, checklist

## Principles

- No trade calls or autonomous execution
- Calm, surveillance-style copy
- Trader retention through routine and session continuity
