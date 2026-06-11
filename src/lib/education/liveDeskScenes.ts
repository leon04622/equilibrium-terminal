/**
 * LIVE DESK — platform-specific academy module.
 * Teaches Equilibrium Terminal's real-time desk awareness strip.
 */

export type LDVisual =
  | "whyLiveDesk"
  | "components"
  | "fundingCountdown"
  | "sessionCountdown"
  | "deskTone"
  | "liveAwareness"
  | "operatorWorkflow"
  | "recap";

export interface LDScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: LDVisual;
  holdMs?: number;
}

export const LIVE_DESK_SCENES: LDScene[] = [
  {
    id: "why-live-desk",
    lesson: 1,
    chapter: "PHASE 1 · WHY LIVE DESK EXISTS",
    title: "Trader A vs Trader B",
    voice:
      "Trader A only looks at charts. Trader B checks Live Desk first. Trader A reacts to every tick without context. Trader B knows the session, funding window, and desk tone before placing a single order. Charts show price. Live Desk shows context. Awareness beats reaction.",
    takeaway: "Charts show price — Live Desk shows context.",
    visual: "whyLiveDesk",
    holdMs: 3000,
  },
  {
    id: "components",
    lesson: 2,
    chapter: "PHASE 2 · LIVE DESK COMPONENTS",
    title: "Mission control readout",
    voice:
      "Live Desk combines six signals in one strip. Funding countdown — time to the next hourly carry window. Session countdown — time to the next session transition. Desk tone — CALM, ACTIVE, THIN, FUNDING WINDOW, or STRESS. Market state — volatility, liquidity, and risk-on-off. Alerts and operational signals surface when conditions shift.",
    takeaway: "Funding · session · tone · vol · liq · risk — one heartbeat.",
    visual: "components",
    holdMs: 3200,
  },
  {
    id: "funding-countdown",
    lesson: 3,
    chapter: "PHASE 3 · FUNDING COUNTDOWN",
    title: "Hourly carry windows",
    voice:
      "On Hyperliquid, funding accrues every hour on the UTC hour. The FND countdown shows time until the next window. Five minutes out, desk tone shifts to FUNDING WINDOW. Professionals slow new entries, review carry exposure, and watch for positioning squeezes around the print.",
    takeaway: "Watch funding within five minutes of the hour.",
    visual: "fundingCountdown",
    holdMs: 2800,
  },
  {
    id: "session-countdown",
    lesson: 4,
    chapter: "PHASE 4 · SESSION COUNTDOWN",
    title: "Asian · Europe · US",
    voice:
      "Markets behave differently by session. Asian hours often mean thinner liquidity and slower moves. European open brings flow and volatility. US session drives the heaviest volume. Session transitions change participation — the countdown tells you when behavior is about to shift.",
    takeaway: "Session transitions change liquidity and volatility.",
    visual: "sessionCountdown",
    holdMs: 2800,
  },
  {
    id: "desk-tone",
    lesson: 5,
    chapter: "PHASE 5 · DESK TONE",
    title: "CALM to STRESS",
    voice:
      "CALM means normal conditions — standard execution discipline. ACTIVE means volatility expanding — tighten risk and read faster. THIN means liquidity deteriorating — favor limits and smaller size. FUNDING WINDOW means carry is near — watch positioning. STRESS means defensive posture — reduce exposure or stand aside.",
    takeaway: "Desk tone tells you how to behave right now.",
    visual: "deskTone",
    holdMs: 3000,
  },
  {
    id: "live-awareness",
    lesson: 6,
    chapter: "PHASE 6 · LIVE AWARENESS",
    title: "Mission control center",
    voice:
      "Live Desk acts like mission control for your trading day. Conditions change hour by hour — session shifts, funding prints, volatility spikes, liquidity thins. The strip updates in real time so you maintain awareness without jumping between widgets. Professional operators glance here throughout the day.",
    takeaway: "Maintain awareness — don't stare only at charts.",
    visual: "liveAwareness",
    holdMs: 2600,
  },
  {
    id: "operator-workflow",
    lesson: 7,
    chapter: "PHASE 7 · OPERATOR WORKFLOW",
    title: "Professional routine",
    voice:
      "Step one: open the terminal. Step two: check Live Desk — session, tone, funding, market state. Step three: review whether conditions favor aggression, patience, or standing aside. Step four: plan execution. Step five: then trade. Context before clicks — every session.",
    takeaway: "Open terminal → check Live Desk → plan → trade.",
    visual: "operatorWorkflow",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Heartbeat of the trading day",
    voice:
      "Live Desk is the heartbeat of the trading day on Equilibrium Terminal. Next: find the real Live Desk strip in your terminal header and walk through each component live.",
    takeaway: "Live Desk is the heartbeat of the trading day.",
    visual: "recap",
    holdMs: 2400,
  },
];
