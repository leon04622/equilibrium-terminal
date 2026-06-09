# OmniBar — Command System & Global Information Retrieval

Phase 35 operational layer: terminal-native navigation via commands, not dashboard clicks.

## Architecture

| Module | Role |
|--------|------|
| `CommandRegistry` | Typed commands, aliases, fuzzy autocomplete |
| `OmniCommandRouter` | Alias resolve → `IntentParser` → recent history |
| `IntentParser` | Low-latency regex parse (<5ms target) |
| `GlobalSearchIndex` | Unified local index (intel + watchlist + workspace + alerts) |
| `OmniContextEngine` | Selected asset, mode, wedge desk, watchlist, recent cmds |
| `InformationDiscoveryEngine` | Scored fuzzy search over index entries |
| `useOmniCommand` | Intent execution (panels, trade draft, wedge layout) |

## Command examples

| Input | Action |
|-------|--------|
| `BTC` | Select asset, focus chart |
| `BTC-PERP` | Select BTC (perp shorthand) |
| `/chart ETH` | Chart + asset |
| `/depth SOL` | DOM ladder |
| `/liq SOL` | HyperBook |
| `/monitor funding` | Slippage / funding monitor |
| `/alerts BTC` | Alerts panel |
| `/exec buy BTC 0.5` | Trade ticket prefill |
| `/workspace BTC execution` | Asset workspace orchestrator |
| `/workspace macro` | Terminal mode → macro |
| `/desk` | V1 HL execution desk layout |
| `/expand` | Full platform workspace |
| `/help` | Command catalog (stays open) |

## Wedge gating

In **desk focus** mode, advanced commands (`/journal`, `/coverage`, …) route to wedge-safe widgets per `wedgeAccess.ts`. V1 commands include `/chart`, `/depth`, `/exec`, `/monitor`, `/alerts`.

## AI boundary

`/summarize` and semantic fallbacks use Copilot for **facts and structure only** — no trade recommendations.

## Keyboard

- `⌘K` / `Ctrl+K` — open OmniBar
- `/` — open OmniBar (when not in an input)
- `Enter` — execute query

## Indexing

`useInformationDiscovery` rebuilds `GlobalSearchIndex` every 3s while the discovery pipeline is active.

## Extension

Register new commands in `CommandRegistry` and add matching regex/handlers in `IntentParser`. Plugin-style registration can append to the registry array at module load time.
