/**
 * DAILY OPERATIONS — platform-specific academy module.
 * Teaches Equilibrium Terminal's daily operating system.
 */

export type DOVisual =
  | "whyExists"
  | "whatItDoes"
  | "marketEnvironment"
  | "operatorRoutine"
  | "decisionQuality"
  | "recap";

export interface DOScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: DOVisual;
  holdMs?: number;
}

export const DAILY_OPERATIONS_SCENES: DOScene[] = [
  {
    id: "why-exists",
    lesson: 1,
    chapter: "PHASE 1 · WHY DAILY OPERATIONS EXISTS",
    title: "Trader A vs Trader B",
    voice:
      "Trader A wakes up and immediately hunts for trades. Trader B opens Daily Operations first. Trader A reacts to every move. Trader B knows what kind of day it is before placing a single order. Preparation creates better decisions.",
    takeaway: "Review conditions before you trade.",
    visual: "whyExists",
    holdMs: 2800,
  },
  {
    id: "what-it-does",
    lesson: 2,
    chapter: "PHASE 2 · WHAT DAILY OPERATIONS DOES",
    title: "One operational view",
    voice:
      "Daily Operations combines market state, volatility, liquidity, risk, and session conditions into one panel. Instead of jumping between widgets, you get a single answer: what kind of day is today? It connects the terminal together before execution.",
    takeaway: "Market state · vol · liquidity · risk · session — one view.",
    visual: "whatItDoes",
    holdMs: 2600,
  },
  {
    id: "market-environment",
    lesson: 3,
    chapter: "PHASE 3 · MARKET ENVIRONMENT",
    title: "Calm to dangerous",
    voice:
      "Different environments need different behavior. A calm day favors planned entries. An active day needs faster reads. A volatile day demands smaller size. A dangerous day means stand aside or reduce risk. Daily Operations labels the environment so you can match your behavior.",
    takeaway: "Calm · active · volatile · dangerous — behavior changes.",
    visual: "marketEnvironment",
    holdMs: 2600,
  },
  {
    id: "operator-routine",
    lesson: 4,
    chapter: "PHASE 4 · OPERATOR ROUTINE",
    title: "Professional workflow",
    voice:
      "Step one: open Daily Operations. Step two: review market state. Step three: review volatility. Step four: review risk conditions. Step five: prepare your execution plan. Professionals run this routine every session — trades come after context.",
    takeaway: "Brief → state → risk → plan → then trade.",
    visual: "operatorRoutine",
    holdMs: 2800,
  },
  {
    id: "decision-quality",
    lesson: 5,
    chapter: "PHASE 5 · DECISION QUALITY",
    title: "Reactive vs prepared",
    voice:
      "Daily Operations improves discipline, consistency, and preparation. The reactive trader chases noise. The prepared trader already knows if conditions favor aggression, patience, or standing aside. This is your daily operating system for trading on Equilibrium Terminal.",
    takeaway: "Prepared operators trade with context — not impulse.",
    visual: "decisionQuality",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Your daily operating system",
    voice:
      "Daily Operations answers what kind of day is today before a trade is placed. Next: open the real Daily Operations panel on your terminal and walk through each section live.",
    takeaway: "This is my daily operating system for trading.",
    visual: "recap",
    holdMs: 2400,
  },
];
