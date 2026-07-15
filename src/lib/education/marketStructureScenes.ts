export type MktStructVisual =
  | "whyStructure"
  | "uptrend"
  | "range"
  | "breakOfStructure"
  | "contextStack"
  | "recap";

export interface MarketStructureScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: MktStructVisual;
  holdMs?: number;
}

export const MARKET_STRUCTURE_SCENES: MarketStructureScene[] = [
  {
    id: "why-structure",
    lesson: 1,
    chapter: "PHASE 1 · WHY STRUCTURE MATTERS",
    title: "Price tells a story",
    voice:
      "Market structure is how price organizes over time — trends, ranges, and breaks. Bloomberg operators read structure before they read indicators. Structure tells you whether to press, fade, or wait.",
    takeaway: "Structure is context — not a signal by itself.",
    visual: "whyStructure",
    holdMs: 2800,
  },
  {
    id: "uptrend",
    lesson: 2,
    chapter: "PHASE 2 · UPTREND",
    title: "Higher highs, higher lows",
    voice:
      "An uptrend prints higher swing highs and higher swing lows. Pullbacks are buy-the-dip zones only while structure holds. When lows stop rising, the trend is aging — reduce aggression.",
    takeaway: "HH + HL = uptrend until proven otherwise.",
    visual: "uptrend",
    holdMs: 2600,
  },
  {
    id: "range",
    lesson: 3,
    chapter: "PHASE 3 · RANGE",
    title: "Compression between levels",
    voice:
      "In a range, price rotates between support and resistance. Mean-reversion works until it does not. Size down, favor limits, and watch for liquidity thinning at the edges.",
    takeaway: "Ranges reward patience — not chase.",
    visual: "range",
    holdMs: 2600,
  },
  {
    id: "bos",
    lesson: 4,
    chapter: "PHASE 4 · BREAK OF STRUCTURE",
    title: "When the story changes",
    voice:
      "A break of structure is a close beyond the last meaningful swing — trend to range, or range to breakout. After a break, old levels flip roles. Re-read surveillance and DOM before committing size.",
    takeaway: "Breaks invalidate the prior playbook.",
    visual: "breakOfStructure",
    holdMs: 2800,
  },
  {
    id: "context-stack",
    lesson: 5,
    chapter: "PHASE 5 · DESK STACK",
    title: "Chart + surveillance + DOM",
    voice:
      "Professional workflow: chart for structure, surveillance for cross-asset regime and movers, DOM ladder for liquidity at the level. Three panels — one narrative.",
    takeaway: "Stack context before entries.",
    visual: "contextStack",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Read structure, then act",
    voice:
      "You have the vocabulary: trend, range, break, and the desk stack. Next: open the live chart, surveillance strip, and DOM ladder on your execution desk and walk the bridge.",
    takeaway: "Structure first — execution second.",
    visual: "recap",
    holdMs: 2400,
  },
];
