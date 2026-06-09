# Equilibrium Terminal — Video Tutorial Production Guide

Use this document to record onboarding and product videos. It matches the **HL Execution Desk** wedge (default layout) and **EXPAND** full workspace.

**Production URL:** https://equilibrium-terminal-three.vercel.app  
**Suggested format:** 1920×1080, 60fps screen capture, clean browser (no bookmarks bar), dark room lighting on face-cam if used.

---

## Recommended video series

| # | Title | Length | Audience |
|---|--------|--------|----------|
| 1 | **Equilibrium Terminal in 5 Minutes** | 5–6 min | First login, desk layout, one trade workflow |
| 2 | **Execution Desk Deep Dive** | 10–12 min | Book, chart, ticket, DOM, slippage, alerts |
| 3 | **OmniBar & Power Workflow** | 8–10 min | Commands, expand workspace, intel & alerts |

Below is the **full script for Video 1** plus shared assets for Videos 2–3.

---

## Video 1 — Full script: “Equilibrium Terminal in 5 Minutes”

### Pre-recording checklist

- [ ] Browser: Chrome/Edge, zoom 100%, terminal full screen
- [ ] Invite ready: `EQ-ALPHA-2026` (or operator bypass if recording locally)
- [ ] Wallet funded on test size (e.g. $10–50 notional) if showing live submit
- [ ] Coin: **BTC** or **HYPE** (active tape for whale/alert demos)
- [ ] Close unrelated tabs; mute notifications except Equilibrium if demoing desktop alerts
- [ ] Optional lower-third: `HL EXECUTION DESK · EQUILIBRIUM TERMINAL`

---

### 0:00–0:20 — Hook

**ON CAMERA (optional)**  
> “This is Equilibrium Terminal — an institutional-grade Hyperliquid execution desk. Not a signal bot. You stay in control; the terminal gives you book, chart, tape, and execution in one surface.”

**SCREEN**  
Logo / login → invite gate → enter code → **UNLOCK TERMINAL**.

**VO**  
> “Alpha access is invite-only. Enter your code or use the link your team sent. This unlocks the desk — it is not the same as connecting your wallet.”

---

### 0:20–0:50 — First impression

**SCREEN**  
Land on default **HL EXECUTION DESK** layout. Slow pan (mouse) left → right:

| Region | Panel | Say |
|--------|--------|-----|
| Left | HyperBook | “Level-two depth for the selected market.” |
| Center | Chart | “Price action with operational HUD — regime, stress, stream status.” |
| Top right | TAPE (Tactical Wire) | “Live intelligence vectors — funding, whales, clusters.” |
| Right stack | DOM ladder | “Microstructure and ladder view.” |
| Bottom | Ticket, Positions | “Execution and risk in one row.” |
| Bottom | Alerts, Surveillance | “Rule-based alerts and regime surveillance.” |

**VO**  
> “By default you get the execution wedge — nine panels built for one job: trade Hyperliquid with full context.”

---

### 0:50–1:30 — Connect & select market

**SCREEN**  
1. Header: show connection / stream status (green = live).  
2. Asset picker or OmniBar: type `BTC` → Enter.  
3. Chart and book refresh to BTC.

**VO**  
> “Pick your market from the asset list or press **Ctrl+K** — the OmniBar. Type a symbol like BTC and hit Enter. Chart, book, and tape all follow the active coin.”

**ON SCREEN TEXT (lower third)**  
`Ctrl+K · OmniBar · BTC → chart + book + tape`

---

### 1:30–2:30 — Read the market (no trade yet)

**SCREEN**  
1. **HyperBook** — point at bid/ask stack, spread.  
2. **Chart** — zoom one timeframe; point at HUD chips (regime, stress).  
3. **TAPE** — scroll if whale lines appear; mention ≥$75k prints also hit **ALERTS**.  
4. **Surveillance** — regime / stress gauge briefly.

**VO**  
> “HyperBook is your liquidity map. The chart carries regime and stress at a glance — so you are not guessing context mid-trade. TAPE is the tactical wire: large tape prints, funding flips, liquidation pressure. When a print clears seventy-five thousand dollars on your symbol, you will also see it in ALERTS with a short AI context line — human still decides.”

---

### 2:30–3:45 — Execute a trade (demo size)

**SCREEN**  
1. **Trade ticket** — side, size, limit or market (match product default).  
2. **Slippage radar** — show estimate before submit.  
3. If wallet not connected: show connect flow, stop before submit.  
4. If connected: **small** demo order OR cancel at confirmation — narrate risk.

**VO**  
> “The ticket is execution-native Hyperliquid. Check slippage radar before you send — it is pre-trade quality, not a post-mortem. Connect wallet and approve the agent once per session. Size responsibly; Equilibrium does not auto-trade for you.”

**ON SCREEN TEXT**  
`Slippage radar → Ticket → Confirm · You are the trader`

---

### 3:45–4:30 — Positions & alerts

**SCREEN**  
1. **Positions** — open row, PnL flash.  
2. **ALERTS** — point at rule count; if empty, say what triggers (OI, funding flip, whale, liq cluster).  
3. Click one alert row → chart/asset focus.

**VO**  
> “Positions stay tied to the exchange state. ALERTS runs rules on the live tape — open interest spikes, funding flips, whale prints, liquidation clusters. Click an alert to jump the chart to that symbol.”

---

### 4:30–5:15 — OmniBar essentials

**SCREEN**  
`Ctrl+K` → type each (pause on result):

| Command | What happens |
|---------|----------------|
| `/help` | Command list |
| `/depth ETH` | DOM + ETH |
| `/chart SOL` | Chart + SOL |
| `/desk` | Reset wedge layout |
| `/exec buy BTC 0.01` | Ticket prefill (do not submit unless intended) |

**VO**  
> “Power users live in the OmniBar. Slash commands jump panels and prefill the ticket. `/desk` snaps you back to the execution wedge. `/expand` — we will cover in the long form video — unlocks the full institutional workspace.”

---

### 5:15–5:45 — EXPAND teaser & close

**SCREEN**  
Click **EXPAND** in header → brief scroll of extra panels → **collapse back to desk** (keeps video focused).

**VO**  
> “EXPAND is for when you outgrow the wedge — reliability, enterprise ops, research, mobile companion alerts. Day one, stay on the desk until execution is muscle memory. Link in description for alpha access and docs.”

**ON CAMERA**  
> “Subscribe for the ten-minute execution deep dive. Questions — drop them in comments.”

**END CARD (5 sec)**  
`equilibrium-terminal-three.vercel.app` · Invite: EQ-HL-DESK · Docs: /docs/ONBOARDING.md

---

## Video 2 — Outline: Execution Desk Deep Dive (10–12 min)

| Time | Section | Shots |
|------|---------|--------|
| 0:00 | Recap wedge philosophy | Mission slide + desk layout |
| 1:00 | HyperBook + DOM together | Imbalance, large levels, ladder sync |
| 3:00 | Chart + HUD | Timeframes, overlays mention (event markers) |
| 5:00 | Ticket types | Limit/market, reduce-only, warnings banner |
| 6:30 | Slippage radar | Read spread, impact estimate |
| 8:00 | ALERTS rules | Default rules; flash on new trigger |
| 9:00 | Surveillance | Regime, stress, atmosphere |
| 10:30 | Wallet/agent | Connect, disconnect, safety copy |
| 11:30 | CTA | EXPAND preview |

**B-roll:** Alert row flashing; whale line on TAPE; position PnL flash.

---

## Video 3 — Outline: OmniBar & Power Workflow (8–10 min)

| Time | Section | Shots |
|------|---------|--------|
| 0:00 | Why command-first | Compare click path vs `/chart ETH` |
| 1:30 | Full command table | `/liq` `/vol` `/intel` `/monitor` `/alerts` `/workspace` |
| 4:00 | EXPAND workflow | Toggle advanced; open 2–3 museum panels max |
| 6:00 | Experience bar | Density, calm mode (TERMINAL_EXPERIENCE.md) |
| 7:00 | PRODUCT → ONBOARD | Resume walkthrough |
| 8:00 | Desktop alerts (optional) | Information distribution prefs |
| 9:00 | Invite codes & URL unlock | `?invite=EQ-ALPHA-2026` |

---

## Short-form clips (Reels / Shorts / X)

30–45 second cuts from the same recording:

1. **“Three panels before every trade”** — Book → Slippage → Ticket  
2. **“Whale hit the tape”** — TAPE scroll + ALERTS flash (need active market)  
3. **“Ctrl+K is your control plane”** — 4 OmniBar commands in 20 seconds  
4. **“Desk vs EXPAND in 15 seconds”** — Toggle expand, one pan, back to desk  

**Hook lines (text on screen)**  
- “Bloomberg energy. Hyperliquid execution.”  
- “AI explains context. You pull the trigger.”  
- “One desk. Book · Chart · Tape · Execute.”

---

## YouTube metadata (copy-paste)

**Title options**  
- Equilibrium Terminal — Hyperliquid Execution Desk (Full Tutorial)  
- How to Use Equilibrium Terminal in 5 Minutes | HL Trading Desk  

**Description template**  
```
Equilibrium Terminal is an institutional-grade Hyperliquid execution desk — unified L2 book, chart, tactical wire, alerts, and order path.

In this video:
• Alpha invite & first login
• Default HL Execution Desk layout
• Select markets (OmniBar Ctrl+K)
• Read book, chart, TAPE, surveillance
• Execute with slippage awareness
• Alerts (whale, funding, liquidation clusters)
• OmniBar commands & EXPAND workspace

Alpha: https://equilibrium-terminal-three.vercel.app
Invite codes (alpha): EQ-ALPHA-2026 · EQ-HL-DESK · EQ-EXEC
URL unlock: ?invite=EQ-ALPHA-2026

Docs: ONBOARDING.md · WEDGE_STRATEGY.md · OMNIBAR_COMMAND_SYSTEM.md

Not financial advice. Human trader remains in control. No autonomous trading.
```

**Tags**  
`hyperliquid, crypto trading, trading terminal, execution desk, order flow, bitcoin perp, defi trading, institutional crypto`

**Chapters (Video 1)**  
```
0:00 Intro
0:20 First look at the desk
0:50 Select a market
1:30 Read book, chart & tape
2:30 Execute a trade
3:45 Positions & alerts
4:30 OmniBar commands
5:15 EXPAND & outro
```

---

## Recording tips

1. **Mouse movement** — Slow, deliberate; pause 2s on each panel title.  
2. **Cursor highlight** — Use OBS highlight or ScreenStudio for visibility.  
3. **Audio** — Record VO in post if live narration slips; script above is timed.  
4. **Failsafe** — If tape is quiet, cut to `/help` and ALERTS rule list instead of waiting for whale.  
5. **Legal** — End with “Not financial advice” on end card for public platforms.

---

## Tools (suggested, not required)

| Tool | Use |
|------|-----|
| OBS Studio | Screen + mic capture |
| DaVinci Resolve | Cut, chapters, color |
| CapCut / Descript | Auto-captions from script |
| Canva | Thumbnail: dark terminal screenshot + “HL EXECUTION DESK” |

**Thumbnail text**  
`HOW TO USE` (small) · `EQUILIBRIUM TERMINAL` (large) · `Hyperliquid Desk` (subtitle)

---

## Internal walkthrough (in-app)

For users already inside the terminal: **PRODUCT** panel → **ONBOARD** → **RESUME WALKTHROUGH** (see `docs/ONBOARDING.md`).

---

## Changelog

| Date | Note |
|------|------|
| 2026-05-22 | Initial production guide — wedge V1 + OmniBar + alpha invite |
