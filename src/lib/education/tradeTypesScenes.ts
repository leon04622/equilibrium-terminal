/**
 * TRADE TYPES SIMULATOR — market, limit, and stop orders for beginners.
 *
 * Cloned from FUNDING / ORDER BOOK LEARNING TEMPLATE V1.
 * Answers: "How do I place a trade without making expensive mistakes?"
 */

export type TTVisual =
  | "intro"
  | "marketOrder"
  | "limitOrder"
  | "stopOrder"
  | "comparison"
  | "mistakes"
  | "preTrade"
  | "recap";

export interface TTScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: TTVisual;
  holdMs?: number;
}

export const TRADE_TYPES_SCENES: TTScene[] = [
  {
    id: "intro",
    lesson: 0,
    chapter: "TRADE TYPES",
    title: "Why order types exist",
    voice:
      "Different order types exist because traders have different goals. Should you buy instantly, wait for a better price, or enter only if price reaches a level?",
    takeaway: "You want to buy Bitcoin — how should you enter?",
    visual: "intro",
    holdMs: 1000,
  },
  {
    id: "market",
    lesson: 1,
    chapter: "LESSON 1 · MARKET ORDER",
    title: "Buy or sell immediately",
    voice:
      "A market order buys or sells right now. It consumes available liquidity and executes instantly. Good when you need speed. Risky when liquidity is thin — you can pay slippage and a wide spread.",
    takeaway: "Fast execution · less price control",
    visual: "marketOrder",
    holdMs: 2200,
  },
  {
    id: "limit",
    lesson: 2,
    chapter: "LESSON 2 · LIMIT ORDER",
    title: "Only at your price or better",
    voice:
      "A limit order waits until price reaches your level. You get price control and often better execution. The trade-off: it may never fill if price doesn't come to you.",
    takeaway: "Price control · may miss the trade",
    visual: "limitOrder",
    holdMs: 2000,
  },
  {
    id: "stop",
    lesson: 3,
    chapter: "LESSON 3 · STOP ORDER",
    title: "Activate at a trigger price",
    voice:
      "A stop order activates only when price hits your trigger. Use it for stop losses to cap downside, or breakout entries when price confirms a level. Stops automate risk management.",
    takeaway: "Conditional · protects or confirms",
    visual: "stopOrder",
    holdMs: 2000,
  },
  {
    id: "compare",
    lesson: 4,
    chapter: "LESSON 4 · COMPARISON",
    title: "Execution quality trade-offs",
    voice:
      "Market orders are fast with less control. Limit orders give control but may not fill. Stop orders are conditional — built for protection and confirmed entries.",
    takeaway: "Match the order type to your goal.",
    visual: "comparison",
    holdMs: 1800,
  },
  {
    id: "mistakes",
    lesson: 5,
    chapter: "LESSON 5 · BEGINNER MISTAKES",
    title: "What goes wrong",
    voice:
      "Common mistakes: market buying into thin liquidity, placing limits too far away, trading with no stop loss, and confusing stops with limits. Each mistake costs real money.",
    takeaway: "Wrong order type = expensive lesson.",
    visual: "mistakes",
    holdMs: 2200,
  },
  {
    id: "pretrade",
    lesson: 6,
    chapter: "LESSON 6 · PRE-TRADE",
    title: "Three questions before you click",
    voice:
      "Before every trade ask: Do I need instant execution? Do I need price control? Do I need protection? Your answers point to market, limit, or stop.",
    takeaway: "Market · Limit · or Stop — choose on purpose.",
    visual: "preTrade",
    holdMs: 1800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "READY",
    title: "You know the order types",
    voice:
      "Market for speed. Limit for price. Stop for protection or confirmation. Next: find these controls on the live trade ticket.",
    takeaway: "TRADE TYPES CERTIFIED — after live bridge.",
    visual: "recap",
    holdMs: 1400,
  },
];
