export type FTVisual =
  | "whyPaperFirst"
  | "morningGate"
  | "preTradeChecks"
  | "paperFill"
  | "liveGraduation";

export interface FirstTradeScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: FTVisual;
  holdMs?: number;
}

export const FIRST_TRADE_SCENES: FirstTradeScene[] = [
  {
    id: "why-paper",
    lesson: 1,
    chapter: "PHASE 1 · PAPER FIRST",
    title: "Bloomberg desks drill before they deploy",
    voice:
      "Institutional operators rehearse on simulated books before live capital is at risk. Paper mode uses live Hyperliquid prices but does not submit orders. You learn the workflow without paying tuition to the market.",
    takeaway: "Paper first — live when the checklist clears.",
    visual: "whyPaperFirst",
    holdMs: 2800,
  },
  {
    id: "morning-gate",
    lesson: 2,
    chapter: "PHASE 2 · MORNING GATE",
    title: "Context before clicks",
    voice:
      "Read the briefing, check market state, scan the newswire, and write an execution plan. The first trade is never the first click — it is the last step of a morning routine.",
    takeaway: "Morning context gates every entry.",
    visual: "morningGate",
    holdMs: 2600,
  },
  {
    id: "pre-trade",
    lesson: 3,
    chapter: "PHASE 3 · PRE-TRADE CHECKS",
    title: "Spread, liquidity, regime",
    voice:
      "Before size hits the book, verify spread in basis points, depth on Hyperbook, and the market regime. Operator checks auto-complete from live data when Academy unlocks Pro workflow.",
    takeaway: "Live book sensors replace guesswork.",
    visual: "preTradeChecks",
    holdMs: 2600,
  },
  {
    id: "paper-fill",
    lesson: 4,
    chapter: "PHASE 4 · PAPER FILL",
    title: "Simulated execution",
    voice:
      "Place a small paper order on the Trade Ticket. The fill records at live prices into the Paper Blotter. Review the tape — did spread and size match your plan?",
    takeaway: "Review the blotter before going live.",
    visual: "paperFill",
    holdMs: 2400,
  },
  {
    id: "live-grad",
    lesson: 5,
    chapter: "PHASE 5 · LIVE GRADUATION",
    title: "When to switch DESK → LIVE",
    voice:
      "Go live only after desk sign-in, one-click agent approval, and a cleared checklist. Start with minimum size. LIVE mode uses real Hyperliquid mainnet — treat it like a Bloomberg execution line, not a game.",
    takeaway: "Live is a privilege earned by process.",
    visual: "liveGraduation",
    holdMs: 2800,
  },
];
