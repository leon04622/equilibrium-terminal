export type LiqDeepVisual =
  | "whyDepth"
  | "bidStack"
  | "askWall"
  | "thinBook"
  | "domRead"
  | "recap";

export interface LiquidityDeepScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: LiqDeepVisual;
  holdMs?: number;
}

export const LIQUIDITY_DEEP_SCENES: LiquidityDeepScene[] = [
  {
    id: "why-depth",
    lesson: 1,
    chapter: "PHASE 1 · WHY DEPTH MATTERS",
    title: "Price is an advertisement",
    voice:
      "Displayed price is only the top of the book. Real liquidity lives in the stack below. Bloomberg operators read depth before size — your fill quality depends on what is actually there.",
    takeaway: "Depth tells you what size the market can absorb.",
    visual: "whyDepth",
    holdMs: 2800,
  },
  {
    id: "bid-stack",
    lesson: 2,
    chapter: "PHASE 2 · BID STACK",
    title: "Support in the book",
    voice:
      "The bid stack shows resting buy interest. Thick bids absorb selling pressure; thin bids let price slip quickly. Watch cumulative size — not just the best bid.",
    takeaway: "Bid depth = downside cushion for sellers hitting the book.",
    visual: "bidStack",
    holdMs: 2600,
  },
  {
    id: "ask-wall",
    lesson: 3,
    chapter: "PHASE 3 · ASK WALLS",
    title: "Resistance in the book",
    voice:
      "Large ask clusters act as walls — price must chew through size to advance. Walls can hold, absorb, or pull. A wall that vanishes is often more bullish than one that holds.",
    takeaway: "Ask walls cap upside until consumed or pulled.",
    visual: "askWall",
    holdMs: 2600,
  },
  {
    id: "thin-book",
    lesson: 4,
    chapter: "PHASE 4 · THIN LIQUIDITY",
    title: "When the book goes hollow",
    voice:
      "Thin books mean wide spreads and violent slippage on market orders. In thin conditions, reduce size, use limits, and read the DOM ladder for air pockets between levels.",
    takeaway: "Thin liquidity punishes urgency.",
    visual: "thinBook",
    holdMs: 2800,
  },
  {
    id: "dom-read",
    lesson: 5,
    chapter: "PHASE 5 · DOM LADDER",
    title: "Vertical depth view",
    voice:
      "The DOM ladder compresses depth around mid — imbalance, skew, and spread in one canvas. Use it with Hyperbook: book for precision, ladder for shape.",
    takeaway: "Book + ladder = full liquidity picture.",
    visual: "domRead",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Read depth, then size",
    voice:
      "You have the liquidity vocabulary: stacks, walls, thin books, and DOM shape. Next: open Hyperbook and the DOM ladder on your desk and walk the live bridge.",
    takeaway: "Depth before size — always.",
    visual: "recap",
    holdMs: 2400,
  },
];
