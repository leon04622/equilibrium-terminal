---
pdf_options:
  format: A4
  margin: 20mm 15mm
  printBackground: true
stylesheet: []
---

# Equilibrium Terminal
## Complete Platform User Guide

**Version:** 1.0 · May 2026  
**Product:** Institutional Hyperliquid execution desk & expanded crypto operating terminal  
**Production URL:** https://equilibrium-terminal-three.vercel.app  

---

> **Disclaimer:** This guide describes platform capabilities for operational training. Nothing herein is financial advice. The human trader remains in control. Equilibrium does not execute autonomous trades.

---

## Table of Contents

1. [What Equilibrium Terminal Is](#1-what-equilibrium-terminal-is)
2. [Step-by-Step: How the Platform Works](#2-step-by-step-how-the-platform-works)
3. [Access, Login & First Session](#3-access-login--first-session)
4. [Header, Experience Bar & Workspace Modes](#4-header-experience-bar--workspace-modes)
5. [Core Execution Desk (V1 Wedge)](#5-core-execution-desk-v1-wedge)
6. [OmniBar Command System](#6-omnibar-command-system)
7. [Alerts, Intelligence & Notifications](#7-alerts-intelligence--notifications)
8. [Wallet, Execution & Hyperliquid Connection](#8-wallet-execution--hyperliquid-connection)
9. [Expanded Workspace — All Panels](#9-expanded-workspace--all-panels)
10. [Keyboard Shortcuts & Quick Reference](#10-keyboard-shortcuts--quick-reference)
11. [Troubleshooting](#11-troubleshooting)
12. [Appendix: Alpha Codes & Environment](#12-appendix-alpha-codes--environment)

---


<div style="page-break-after: always;"></div>

## 1. What Equilibrium Terminal Is

Equilibrium Terminal is built to become **the Bloomberg Terminal for crypto** — an institutional-grade environment for digital asset markets.

### Core mission

| Pillar | Meaning for you |
|--------|-----------------|
| **Information superiority** | Book, tape, intel, alerts, and newswire in one surface |
| **Execution superiority** | Native Hyperliquid ticket, DOM, slippage awareness |
| **Workflow superiority** | Command-first navigation (OmniBar), draggable panels |
| **Operational clarity** | Calm institutional UI — no retail clutter |
| **Human-centered** | AI summarizes and organizes — **you** decide and execute |

### What Equilibrium is NOT

- Not an auto-trading bot  
- Not “AI tells you what to buy”  
- Not a social or gamified retail app  

### Two workspace modes

| Mode | Label | Who it is for |
|------|--------|----------------|
| **Desk focus (default)** | HL EXECUTION DESK | Day-to-day Hyperliquid trading — 9 core panels |
| **Full workspace** | EQUILIBRIUM TERMINAL | Power users, desks, research — 40+ panels via **EXPAND** |

Toggle between them with **EXPAND** in the header or OmniBar `/desk` and `/expand`.

---


<div style="page-break-after: always;"></div>

## 2. Step-by-Step: How the Platform Works

Follow this sequence every session. Numbers match the operational flow inside the product.

### Step 1 — Open the terminal & unlock alpha

1. Navigate to the production URL (or your deployment).  
2. If the **Alpha Invite Gate** appears, enter an invite code (see [Appendix](#12-appendix-alpha-codes--environment)) or use `?invite=YOUR-CODE` in the URL.  
3. Click **UNLOCK TERMINAL**.  
4. *Note:* Invite unlock is separate from wallet connection.

### Step 2 — Confirm live data connection

1. Check the header **stream status** (connected / reconnecting / offline).  
2. Core panels (HyperBook, Chart) should update within seconds.  
3. If offline, wait for reconnect or refresh — execution should not proceed on stale data.

### Step 3 — Select your market (active coin)

1. Use the **asset picker** or press **Ctrl+K** (OmniBar).  
2. Type a symbol (e.g. `BTC`, `ETH`, `HYPE`) and press **Enter**.  
3. **All coin-scoped panels sync:** chart, L2 book, trade tape subscription, alerts, DOM, slippage.

### Step 4 — Read the market (pre-trade)

1. **HyperBook** — liquidity, spread, depth imbalance.  
2. **Chart** — price structure; HUD shows regime, stress, stream pulse.  
3. **TAPE (Tactical Wire)** — intelligence vectors (whales, funding, clusters).  
4. **Surveillance** — regime and stress gauge.  
5. **Slippage radar** — estimated impact before you size an order.

### Step 5 — Configure & submit an order

1. Open **Trade ticket** (EXEC panel).  
2. Choose side, size, order type (limit/market per product support).  
3. Read **Execution warning banner** if liquidity is thin.  
4. **Connect wallet** if not connected; approve Hyperliquid agent when prompted.  
5. Submit — confirm **ORDER SUBMITTING** state; verify fill in ticket/positions.

### Step 6 — Monitor risk & events

1. **Positions** — live PnL, size, liquidation proximity.  
2. **ALERTS** — rule triggers (OI, funding flip, whale ≥$75k, liq clusters).  
3. Click any alert row to **focus chart** on that symbol.

### Step 7 — Use commands for speed

1. **Ctrl+K** → `/depth`, `/chart`, `/exec`, `/monitor`, `/alerts`.  
2. `/desk` resets wedge layout; `/expand` opens full platform.

### Step 8 — Optional: expand for research & ops

1. Click **EXPAND** when you need reliability, newswire, portfolio desk, etc.  
2. Scroll workspace or use OmniBar to focus specific panels.  
3. Return to desk with **EXPAND** off or `/desk`.

### Data flow (simplified)

```
Hyperliquid WebSocket
    → Terminal streams (book, trades, candles, clearinghouse)
        → Panels (HyperBook, Chart, TAPE, Positions)
        → Alert engine (tape → rules → ALERTS panel)
        → Intelligence wire (whale prints → TAPE)
        → Optional: distribution newswire, mobile desk, APIs
```

---


<div style="page-break-after: always;"></div>

## 3. Access, Login & First Session

### Alpha invite gate

Production may require invite validation.

| Default code | Use |
|--------------|-----|
| `EQ-ALPHA-2026` | General alpha |
| `EQ-HL-DESK` | Hyperliquid desk cohort |
| `EQ-EXEC` | Execution-focused users |

**URL unlock:** `https://equilibrium-terminal-three.vercel.app/?invite=EQ-ALPHA-2026`

### Operator / dev bypass (environment)

- `NEXT_PUBLIC_EQ_OPERATOR_ACCESS=true`  
- `NEXT_PUBLIC_EQ_ALPHA_INVITE_REQUIRED=false`  
- Development mode skips invite locally.

### In-app onboarding walkthrough

1. Open **PRODUCT** panel (commercial console).  
2. Tab **ONBOARD** → **RESUME WALKTHROUGH**.  
3. Steps: welcome → workspace → exchange connect → execution desk → OmniBar → expand.

---


<div style="page-break-after: always;"></div>

## 4. Header, Experience Bar & Workspace Modes

### Header controls

| Control | Function |
|---------|----------|
| **EXPAND** | Toggle full workspace vs HL execution desk |
| **Stream status** | WebSocket health to Hyperliquid |
| **Asset / coin** | Active symbol for scoped panels |
| **Wallet** | Connect / disconnect trading wallet |
| **OmniBar trigger** | Opens command palette (also Ctrl+K) |

### Terminal Experience Bar

Scores and toggles across institutional subsystems (environment, reliability, execution, etc.). Key **user-facing** controls:

| Control | Effect |
|---------|--------|
| **Density** | COMPACT / STANDARD / COMFORT row height |
| **CALM** | Suppresses aggressive price flashes |
| **MOTION** | Reduces animation; respects reduced-motion preference |

### Terminal modes (adaptive workspace)

Modes (execution, research, macro, quant, etc.) adjust **chrome and emphasis** — subtle header accent and panel priority, not a different product.

---


<div style="page-break-after: always;"></div>

## 5. Core Execution Desk (V1 Wedge)

Default layout when **desk focus** is on. Nine panels — always visible in wedge mode.

---

### 5.1 HyperBook — L2 DEPTH

**Purpose:** Real-time level-2 order book for the active coin.

**How it works:**

- Subscribes to Hyperliquid L2 via terminal WebSocket.  
- Normalizes bids/asks into price levels with cumulative size.  
- Mid price flash indicates tick direction.

**How to use:**

1. Select coin (Step 3 above).  
2. Read top-of-book spread and depth walls.  
3. Large resting liquidity may indicate support/resistance.  
4. OmniBar: `/liq BTC` focuses book context for BTC.

---

### 5.2 Chart — OHLCV

**Purpose:** Price chart with institutional operational HUD.

**How it works:**

- Candle/stream data from Hyperliquid.  
- **Chart operational HUD:** regime ribbon, stress, spread, live pulse.  
- Equilibrium chart color system; optional event overlays from intel/execution.  
- Tactical overlay on canvas (grid, volatility veil) via presence engine.

**How to use:**

1. Select timeframe from chart controls (if exposed).  
2. Use HUD chips before sizing risk.  
3. Alert click or OmniBar `/chart ETH` jumps here.  
4. Advanced: replay/overlays in expanded chart analytics (see ADVANCED_CHARTING.md).

---

### 5.3 TAPE — Tactical Intelligence Wire

**Panel ID:** `intelligence` · **Header:** TACTICAL WIRE

**Purpose:** Live stream of ranked tactical vectors — whale prints, funding, agentic fusion, alert bridges.

**How it works:**

- Large tape prints (≥ **$75,000** notional) become intelligence items → wire entries.  
- `useMarketPresence` maps intelligence into wire with severity and flash.  
- New items scroll to top; click row to select coin.

**How to use:**

1. Watch **TIME · SYM · DIR · CNF · ACC** columns.  
2. Critical severity = fastest flash.  
3. Pair with **ALERTS** for rule-based follow-up.  
4. OmniBar: `/intel` or asset search.

---

### 5.4 Trade Ticket — EXEC

**Purpose:** Submit orders to Hyperliquid.

**How it works:**

- Prefill via OmniBar `/exec buy BTC 0.5`.  
- Reads book mid/spread for context.  
- **Execution warning banner** when liquidity quality is poor.  
- Wallet + agent approval required for live submit.

**How to use:**

1. Connect wallet (header).  
2. Set side, size, price type.  
3. Check slippage radar.  
4. Submit; watch positions panel for fill truth.

---

### 5.5 Positions — RISK

**Purpose:** Open positions, margin, unrealized PnL.

**How it works:**

- Clearinghouse state normalized from Hyperliquid.  
- PnL flash on change (unless CALM mode suppresses).

**How to use:**

1. Verify size and coin match intent after every fill.  
2. Use as source of truth — not ticket alone.

---

### 5.6 DOM Ladder — DOM OFA

**Purpose:** Depth-of-market ladder / microstructure view.

**How it works:**

- Order flow and ladder visualization tied to active book.  
- Complements HyperBook for tick-level execution decisions.

**How to use:**

1. OmniBar `/depth SOL` opens ladder + selects SOL.  
2. Use when scaling in/out at specific levels.

---

### 5.7 Slippage Radar — SLIP RADAR

**Purpose:** Pre-trade execution quality — spread, estimated slippage, impact.

**How it works:**

- Composes book state + recent trade volatility.  
- Feeds execution intelligence pipeline (Phase 43).

**How to use:**

1. **Always check before market orders.**  
2. OmniBar `/monitor funding` routes to monitoring surfaces.  
3. Wide radar = reduce size or use limits.

---

### 5.8 Alert Engine — RULE ENGINE

**Purpose:** Rule-based market event triggers on live tape.

**Default rules (enabled):**

| Rule | Trigger |
|------|---------|
| OI surge | Open-interest proxy +8% (rolling window) |
| Funding flip | Funding crosses negative |
| Whale transfer | Single print ≥ **$75,000** on active coin |
| Liquidation cluster | 3+ sells ≥$40k in 60s, total ≥$250k |

**How it works:**

- `useAlertEngine` listens to latest trade on selected coin.  
- `MetricsTracker` emits events → `Evaluator` matches rules → row in panel.  
- AI explanation line attaches asynchronously (context only).  
- Click row → focus asset + workflow bridge.

**How to use:**

1. Keep panel visible in wedge (bottom area).  
2. Watch for green flash on new triggers.  
3. Do not disable rules unless you understand blind spots.

---

### 5.9 Surveillance — SURVEILLANCE

**Purpose:** Market regime, stress gauge, atmosphere monitoring.

**How it works:**

- `useMarketPresence` computes stress from book + trades.  
- Regime inference (trend/range/stress labels).  
- Complements chart HUD.

**How to use:**

1. Glance before increasing size in fast markets.  
2. Pair with TAPE for narrative + quantitative stress.

---


<div style="page-break-after: always;"></div>

## 6. OmniBar Command System

**Open:** `Ctrl+K` or `Cmd+K` · Type `/` when not in an input field.

### V1 (desk) commands

| Command | Action |
|---------|--------|
| `BTC` / `ETH-PERP` | Select asset, focus chart |
| `/chart ETH` | Chart + asset |
| `/depth SOL` | DOM ladder + asset |
| `/liq SOL` | HyperBook focus |
| `/exec buy BTC 0.5` | Prefill ticket |
| `/monitor funding` | Slippage / funding monitor |
| `/alerts BTC` | Alerts panel + asset |
| `/intel` | Intelligence / tape focus |
| `/vol` | Volatility surfaces |
| `/summarize` | AI summary (facts only) |
| `/watch` `/unwatch` | Watchlist |
| `/desk` | Reset HL execution desk layout |
| `/expand` | Full workspace |
| `/help` | Command catalog |
| `/focus` | Focus specific widget |

### Advanced commands (require EXPAND / full workspace)

`/macro` · `/graph` · `/journal` · `/research` · `/workspace` · `/briefing` · `/coverage` · `/reliability` · `/newswire` · `/incidents` · `/ingest` · `/collab` · `/team` · `/enterprise` · `/integrations` · `/routine` · and more.

### AI boundary

`/summarize` and copilot paths provide **structure and facts** — not trade recommendations.

---


<div style="page-break-after: always;"></div>

## 7. Alerts, Intelligence & Notifications

### Three layers of “notification”

| Layer | Where | What you see |
|-------|--------|--------------|
| **Tape / wire** | TAPE panel | Whale buy/sell lines, tactical vectors |
| **Alert engine** | ALERTS panel | Rule triggers with AI context line |
| **Distribution** | NEWSWIRE panel (advanced) | Critical newswire → optional **desktop notification** |

### Whale alerts (not removed)

- Threshold: **$75,000** notional on **active coin** tape.  
- Surfaces: ALERTS + TAPE (+ optional wire flash).  
- Cooldown: 60 seconds per whale rule.

### Desktop notifications

Enable in **MARKET NEWSWIRE** → **DELIVERY** tab (advanced). Requires browser permission. Fires on **critical** distribution items, not every tape print.

### Mobile companion (advanced)

**MOBILE OPS** panel aggregates alerts for continuous awareness — see MOBILE_OPERATIONAL.md.

---


<div style="page-break-after: always;"></div>

## 8. Wallet, Execution & Hyperliquid Connection

### Connection steps

1. Click **Connect wallet** in header.  
2. Approve wallet provider (e.g. MetaMask / WalletConnect per deployment).  
3. Approve **Hyperliquid agent** when prompted (one-time per agent policy).  
4. Confirm address matches intended trading account.

### Execution truth

- **Positions panel** = authoritative open risk.  
- Ticket confirmation = intent only until clearinghouse confirms.  
- Never trade on **offline** or **reconnecting** stream without acknowledgment.

### Kill switches (alpha)

Feature flags in **PRODUCT → ALPHA** can disable execution, intel, or alerts without redeploy.

---


<div style="page-break-after: always;"></div>

## 9. Expanded Workspace — All Panels

Enable via **EXPAND**. Panels append below the core desk. Grouped by function.

---

### 9.1 Market & macro

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **MACRO MATRIX** | `macro` | Cross-asset macro tickers (DXY, yields, indices) | Top ribbon context before risk-on/off |
| **GLOBAL STRAT** | `globalstrategy` | Global strategy desk — regional/session framing | `/globalstrategy` |
| **GLOBAL INTEL** | `globaldesk` | Global intelligence orchestration | Expanded ops review |

---

### 9.2 AI & decision support

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **AI LAYER** | `copilot` | Contextual Q&A — funding, OI, whale flow | Ask factual questions; no auto-trade |
| **AGENTIC** | `proactive` | Fused agent opportunities (whale, liq, funding agents) | Click row → load workspace on coin |
| **CONTEXT** | `decision` | Decision command center | Scenario context before size |
| **OPERATOR AI** | `operatordesk` | Operator-grade AI desk responses | Desk operator queries |

*AI organizes information; human decides.*

---

### 9.3 Research & knowledge

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **KNOWLEDGE GRAPH** | `knowledgegraph` | Entity graph — assets, whales, narratives | `/graph whale` |
| **JOURNAL** | `traderjournal` | Trade journal & session notes | `/journal` |
| **RESEARCH** | `research` | Research workspace | `/research` |
| **RESEARCH DESK** | `researchdesk` | Institutional research operating desk | Deep dive workflows |
| **MARKET MEMORY** | `memorydesk` | Historical pattern / memory signals | Compare to prior regimes |
| **EQ INTEL** | `propintel` | Proprietary intelligence layer | Internal signals |
| **INTEL** | `intelengine` | Market intelligence console — events per asset | Asset-level event detection |

---

### 9.4 Coverage, ingestion & newswire

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **COVERAGE** | `marketcoverage` | On-chain, macro, narrative coverage map | Universe scan |
| **INGEST** | `ingestion` | Data ingestion health & pipelines | Ops verification |
| **NEWSWIRE** | `newswire` | Operational newswire — tape, incidents, briefings | `/newswire` · Ctrl+N focus |
| **DAILY OPS** | `dailyops` | Daily operating console — prioritized alerts | Morning routine |

**Newswire tabs:** TAPE · INCIDENTS · BRIEFINGS · PERSONAL · DELIVERY · SYNDICATE

---

### 9.5 Execution & analytics

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **EXEC INTEL** | `execintel` | Order flow, liquidity heatmap, execution quality | Post-trade and pre-trade analytics |
| **LIVE EXEC** | `liveexec` | Live execution desk — multi-asset, desk presets | Scalping / MM / treasury presets |
| **DERIVATIVES DESK** | `derivdesk` | Funding, OI, vol surfaces | Perp-focused workflows |
| **PORTFOLIO DESK** | `portfoliodesk` | Portfolio risk & treasury view | Multi-asset exposure |

---

### 9.6 Systemic & ecosystem

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **SYSTEMIC INTEL** | `systemicintel` | Systemic risk, contagion, narratives | Risk-off planning |
| **ECOSYSTEM** | `ecosystem` | Crypto financial ecosystem map | Strategic context |
| **MARKET CMD** | `marketcmd` | Market command — situational vitals | Command-layer snapshot |
| **MARKET MEMORY** | `memorydesk` | Regime memory (see above) | |

---

### 9.7 Reliability, platform & ops

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **RELIABILITY** | `reliability` | Trust, latency, data integrity | Before trusting live size |
| **TOTE** | `diagnostics` | Telemetry & diagnostics | Debug stream issues |
| **QUANT** | `alphalab` | Alpha lab / quant experiments | Research only |
| **PLATFORM** | `infra` | Infrastructure diagnostics | Engineering |
| **OPS COMMAND** | `opscommand` | Unified ops command vitals | Desk lead monitoring |
| **UNIFIED OPS** | `unifiedops` | Cross-system propagation desk | Enterprise coordination |
| **DESK OPS** | `deskops` | Desk operations console | Session ops |
| **LIVE DEPLOY** | `livedeploy` | Deployment & launch readiness | Go-live checklist |
| **TERMINAL POLISH** | `maturitydesk` | Product maturity / UX polish scores | QA & polish review |

---

### 9.8 Enterprise, team & commercial

| Panel | ID | Purpose | How to use |
|-------|-----|---------|------------|
| **TEAM NET** | `teamdesk` | Team desk grid | Multi-trader coordination |
| **COLLAB** | `collab` | Collaboration console | Shared context |
| **ENTERPRISE** | `enterpriseops` | Enterprise operations | Org-level ops |
| **INTEGRATE** | `integrations` | Industry integrations | External system hooks |
| **PRODUCT** | `commercial` | Packaging, onboarding, alpha, billing tabs | Onboarding & commercial |
| **BILLING DESK** | `billingdesk` | Commercial billing vitals | Finance ops |
| **PLATFORM DESK** | `platformdesk` | API, SDK, extensibility | Institutional API consumers |
| **MOBILE OPS** | `mobiledesk` | Mobile companion & alert delivery | Away-from-desk monitoring |

---

### 9.9 Security & performance notes

- Panels compose **read-only intelligence** unless explicitly execution (ticket).  
- API routes (`/api/*/vitals`) back many desks — scores also appear on experience bar.  
- See `docs/` for phase-specific deep dives (EXECUTION_ANALYTICS.md, SECURITY_TRUST.md, etc.).

---


<div style="page-break-after: always;"></div>

## 10. Keyboard Shortcuts & Quick Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open OmniBar |
| `/` | Open OmniBar (when not typing in input) |
| `Ctrl+N` | Focus newswire (advanced) |
| Drag panel header | Move panel in grid |
| Resize panel corner | Resize in grid |

### Wedge panel map (default positions)

```
┌──────────┬────────────────────┬──────────┐
│ HyperBook│      Chart         │   TAPE   │
│          │                    ├──────────┤
│          │                    │DOM Ladder│
├──────────┼──────────┬─────────┴──────────┤
│  Ticket  │ Positions│Slip│ALERTS│Surveil │
└──────────┴──────────┴────┴──────┴────────┘
```

---


<div style="page-break-after: always;"></div>

## 11. Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Locked at login | Alpha invite required | Use invite code or URL `?invite=` |
| No whale alerts | Wrong coin / quiet tape / below $75k | Select liquid pair; check ALERTS + TAPE |
| Book/chart frozen | Stream disconnected | Check header status; refresh |
| Order won’t submit | Wallet not connected / agent | Connect wallet; approve agent |
| Panels missing | Desk focus mode | Click **EXPAND** |
| OmniBar command ignored | Advanced command in desk mode | `/expand` first |
| Flashes too aggressive | CALM off | Enable **CALM** in experience bar |

---


<div style="page-break-after: always;"></div>

## 12. Appendix: Alpha Codes & Environment

### Default alpha codes

- `EQ-ALPHA-2026`  
- `EQ-HL-DESK`  
- `EQ-EXEC`  

### Documentation index (repo `docs/`)

| Topic | File |
|-------|------|
| Wedge strategy | WEDGE_STRATEGY.md |
| Onboarding | ONBOARDING.md |
| OmniBar | OMNIBAR_COMMAND_SYSTEM.md |
| Terminal UX | TERMINAL_EXPERIENCE.md |
| Alpha launch | ALPHA_LAUNCH.md |
| Live deployment | LIVE_DEPLOYMENT.md |
| Video tutorial script | VIDEO_TUTORIAL.md |

### Support workflow for desks

1. Reproduce in desk mode (`/desk`).  
2. Capture stream status + active coin.  
3. Note panel ID from header (e.g. ALERTS = `alerts`).  
4. Check RELIABILITY + TOTE if data truth is questioned.

---

**© Equilibrium Terminal · Institutional use · Human trader remains central**

*End of guide*
