export type CrossMarketVisual =
  | "whyCrossMarket"
  | "venues"
  | "basis"
  | "relativeValue"
  | "macroLink"
  | "deskStack"
  | "recap";

export interface CrossMarketScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: CrossMarketVisual;
  holdMs?: number;
}

export const CROSS_MARKET_SCENES: CrossMarketScene[] = [
  {
    id: "why-cross",
    lesson: 1,
    chapter: "PHASE 1 · WHY CROSS-MARKET",
    title: "One asset, many venues",
    voice:
      "Crypto trades on multiple venues with different liquidity, fees, and latency. Bloomberg operators never read one tape in isolation — they compare venues, basis, and macro context before committing size.",
    takeaway: "Relative value starts with venue awareness.",
    visual: "whyCrossMarket",
    holdMs: 2800,
  },
  {
    id: "venues",
    lesson: 2,
    chapter: "PHASE 2 · VENUE COVERAGE",
    title: "Who is live, who is staged",
    voice:
      "Market Coverage maps operational status: live feeds, staged infrastructure, and proprietary metrics. Know which venue is authoritative for your symbol before you route flow.",
    takeaway: "Coverage panel = operational map of the tape.",
    visual: "venues",
    holdMs: 2600,
  },
  {
    id: "basis",
    lesson: 3,
    chapter: "PHASE 3 · BASIS & SPREADS",
    title: "Spot vs perp vs index",
    voice:
      "Basis is the gap between related markets — spot versus perp, perp versus index. Widening basis signals stress or arbitrage pressure; compression signals alignment. Size and route accordingly.",
    takeaway: "Basis tells you if markets agree on price.",
    visual: "basis",
    holdMs: 2800,
  },
  {
    id: "relative",
    lesson: 4,
    chapter: "PHASE 4 · RELATIVE VALUE",
    title: "Leaders and laggards",
    voice:
      "Cross-market analysis ranks leaders and laggards across venues and sectors. Rotation often starts in leaders; mean reversion shows up in laggards. Trade the spread, not just direction.",
    takeaway: "Relative value beats single-venue guessing.",
    visual: "relativeValue",
    holdMs: 2600,
  },
  {
    id: "macro-link",
    lesson: 5,
    chapter: "PHASE 5 · MACRO LINK",
    title: "Rates, stress, and crypto",
    voice:
      "Macro Matrix ties institutional feeds — rates, stress gauge, calendar — to crypto risk appetite. When macro stress rises, cross-venue fragmentation and basis volatility usually follow.",
    takeaway: "Macro context filters cross-market reads.",
    visual: "macroLink",
    holdMs: 2800,
  },
  {
    id: "desk-stack",
    lesson: 6,
    chapter: "PHASE 6 · DESK STACK",
    title: "Coverage + macro + wire",
    voice:
      "Professional workflow: Market Coverage for venues, Macro Matrix for regime and institutional desk, Tactical Wire for fast-moving vectors. Three panels — one cross-market narrative.",
    takeaway: "Stack coverage, macro, and wire before routing.",
    visual: "deskStack",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Read the map, then route",
    voice:
      "You have the vocabulary: venues, basis, relative value, macro link, and the desk stack. Next: open Market Coverage, Macro Matrix, and Tactical Wire on your analysis desk and walk the live bridge.",
    takeaway: "Cross-market first — execution second.",
    visual: "recap",
    holdMs: 2400,
  },
];
