/**
 * DAILY BRIEFING ENGINE v1 — platform-specific academy module.
 * Teaches what matters today before the session starts.
 * Prerequisite: Market State Layer (v1 freeze).
 */

export type DBVisual =
  | "whyBriefings"
  | "briefingContents"
  | "marketOutlook"
  | "riskOutlook"
  | "opportunityOutlook"
  | "operatorWorkflow"
  | "recap";

export interface DBScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: DBVisual;
  holdMs?: number;
}

export const DAILY_BRIEFING_SCENES: DBScene[] = [
  {
    id: "why-briefings",
    lesson: 1,
    chapter: "PHASE 1 · WHY DAILY BRIEFINGS EXIST",
    title: "Trader A vs Trader B",
    voice:
      "Trader A starts trading immediately. Trader B opens the Daily Briefing first. Preparation improves decision quality. Professional operators start by understanding today's conditions, risks, and opportunities — not by hunting for trades.",
    takeaway: "Context before action — the briefing creates preparation.",
    visual: "whyBriefings",
    holdMs: 3000,
  },
  {
    id: "contents",
    lesson: 2,
    chapter: "PHASE 2 · WHAT THE BRIEFING CONTAINS",
    title: "Summary · outlook · guidance",
    voice:
      "The Daily Briefing Engine breaks down market state, volatility outlook, liquidity outlook, session expectations, and operational guidance. Each section answers a different question about what should receive your attention today.",
    takeaway: "The briefing is structured — not a random news feed.",
    visual: "briefingContents",
    holdMs: 2800,
  },
  {
    id: "market-outlook",
    lesson: 3,
    chapter: "PHASE 3 · MARKET OUTLOOK",
    title: "Calm · active · stressed",
    voice:
      "Market outlook summarizes current conditions. Calm means stable tape and workable execution. Active means volatility expanding — read faster. Stressed means defensive posture — protect capital first.",
    takeaway: "Market outlook tells you what kind of tape to expect.",
    visual: "marketOutlook",
    holdMs: 2800,
  },
  {
    id: "risk-outlook",
    lesson: 4,
    chapter: "PHASE 4 · RISK OUTLOOK",
    title: "What risks are elevated",
    voice:
      "Risk outlook highlights macro events, alert pressure, and regime stress. When risk is elevated, confirmation must widen and size must shrink. Not every day carries the same downside profile.",
    takeaway: "Risk outlook tells you what could hurt you today.",
    visual: "riskOutlook",
    holdMs: 2800,
  },
  {
    id: "opportunity-outlook",
    lesson: 5,
    chapter: "PHASE 5 · OPPORTUNITY OUTLOOK",
    title: "Favorable vs limited days",
    voice:
      "Opportunity outlook shows when conditions favor planned setups versus when patience wins. Not every day offers the same edge. The briefing prevents you from forcing trades on limited-opportunity sessions.",
    takeaway: "Opportunity outlook tells you when to press and when to wait.",
    visual: "opportunityOutlook",
    holdMs: 2800,
  },
  {
    id: "operator-workflow",
    lesson: 6,
    chapter: "PHASE 6 · OPERATOR WORKFLOW",
    title: "Read briefing before trading",
    voice:
      "Professional workflow: open terminal, read Daily Briefing, review market state, build plan, then execute. The briefing answers what should I pay attention to today — a different question than what trade should I take.",
    takeaway: "Briefing → state → plan → execute.",
    visual: "operatorWorkflow",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "What matters today",
    voice:
      "The Daily Briefing Engine exists so you stop asking what trade should I take and start asking what kind of day is today. Next: open the real Daily Briefing panel and walk through summary, outlooks, and guidance live.",
    takeaway: "The Daily Briefing tells me what matters today.",
    visual: "recap",
    holdMs: 2400,
  },
];
