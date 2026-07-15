/**
 * MARKET MEMORY ARCHIVE v1 — platform-specific academy module.
 * Teaches what happened before and why it matters today.
 * Prerequisite: Daily Briefing Engine (v1 freeze).
 */

export type MMVisual =
  | "whyMemory"
  | "archiveContents"
  | "patterns"
  | "learnHistory"
  | "contextNotPrediction"
  | "operatorWorkflow"
  | "recap";

export interface MMScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: MMVisual;
  holdMs?: number;
}

export const MARKET_MEMORY_SCENES: MMScene[] = [
  {
    id: "why-memory",
    lesson: 1,
    chapter: "PHASE 1 · WHY MARKET MEMORY EXISTS",
    title: "Trader A vs Trader B",
    voice:
      "Trader A only sees current price. Trader B sees current price plus historical context. Most traders react to now. Professional operators remember what happened recently, what happened during similar conditions, and how markets behaved before. Decision quality improves when you carry memory into the session.",
    takeaway: "The market has memory — context matters.",
    visual: "whyMemory",
    holdMs: 3000,
  },
  {
    id: "archive-contents",
    lesson: 2,
    chapter: "PHASE 2 · WHAT THE ARCHIVE STORES",
    title: "States · events · observations",
    voice:
      "The Market Memory Archive stores market states, volatility conditions, liquidity conditions, major events, and operator observations. Each layer answers a different historical question — not what is price right now, but what environment have we been in and what happened when it looked like this before.",
    takeaway: "The archive preserves context — not just price ticks.",
    visual: "archiveContents",
    holdMs: 2800,
  },
  {
    id: "patterns",
    lesson: 3,
    chapter: "PHASE 3 · RECOGNIZING PATTERNS",
    title: "Current vs historical",
    voice:
      "Compare current market conditions with similar historical conditions. When volatility, liquidity, or regime labels rhyme with a prior session, recurring patterns matter. You are not guessing — you are checking whether today's tape resembles something you have seen before and how that prior episode resolved.",
    takeaway: "Recurring patterns are signals — not noise.",
    visual: "patterns",
    holdMs: 2800,
  },
  {
    id: "learn-history",
    lesson: 4,
    chapter: "PHASE 4 · LEARNING FROM HISTORY",
    title: "Review prior environments",
    voice:
      "Operators review previous volatility expansions, stress events, and funding extremes before sizing up. History does not repeat perfectly, but it rhymes. The archive lets you walk through prior regimes, archived events, and analog matches so your plan reflects experience — not impulse.",
    takeaway: "History informs posture — it does not guarantee outcomes.",
    visual: "learnHistory",
    holdMs: 2800,
  },
  {
    id: "context-not-prediction",
    lesson: 5,
    chapter: "PHASE 5 · CONTEXT OVER PREDICTION",
    title: "Memory is not a forecast",
    voice:
      "The archive is not predicting the future. The archive is providing context. This distinction is critical. Similar conditions do not mean the same outcome — they mean you should prepare differently. Context widens your field of view; prediction narrows it prematurely.",
    takeaway: "Use memory for context — not certainty.",
    visual: "contextNotPrediction",
    holdMs: 2800,
  },
  {
    id: "operator-workflow",
    lesson: 6,
    chapter: "PHASE 6 · OPERATOR WORKFLOW",
    title: "Memory before the plan",
    voice:
      "Professional workflow: review Daily Briefing, review Market State, check Market Memory Archive, then build your trading plan. Memory answers what happened before and why it might matter today — a different question than what trade should I take.",
    takeaway: "Briefing, state, memory, plan — then execute.",
    visual: "operatorWorkflow",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "The market has memory",
    voice:
      "The Market Memory Archive exists so you stop trading only the present moment. Next: open the real Market Memory panel and walk through archive entries, regime context, analog matches, and historical observations live.",
    takeaway: "Context before clicks — memory supports decisions.",
    visual: "recap",
    holdMs: 2400,
  },
];
