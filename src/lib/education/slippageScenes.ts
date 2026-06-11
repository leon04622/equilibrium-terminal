/**
 * SLIPPAGE SIMULATOR — institutional curriculum.
 *
 * Cloned from LEARNING TEMPLATE V1.
 * Teaches expected vs realized fills, liquidity, volatility, and execution quality.
 */

export type SlipVisual =
  | "whatIsSlippage"
  | "orderSize"
  | "liquidityDepth"
  | "marketOrderSweep"
  | "volatilityImpact"
  | "goodVsBad"
  | "proReduction"
  | "recap";

export interface SlipScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: SlipVisual;
  holdMs?: number;
}

export const SLIPPAGE_SCENES: SlipScene[] = [
  {
    id: "what-is-slippage",
    lesson: 1,
    chapter: "PHASE 1 · WHAT IS SLIPPAGE?",
    title: "Expected vs actual fill",
    voice:
      "Slippage is the difference between the price you expected and the price you received. You expected one hundred. You got one hundred one. That gap is slippage — the hidden cost of execution.",
    takeaway: "Slippage = expected price minus actual fill.",
    visual: "whatIsSlippage",
    holdMs: 2600,
  },
  {
    id: "order-size",
    lesson: 2,
    chapter: "PHASE 2 · ORDER SIZE",
    title: "Small vs large order",
    voice:
      "Trader A places a small order. Trader B places a large order. Same market. Trader A fills near the displayed price. Trader B walks through several levels. Larger orders consume more liquidity — and pay more slippage.",
    takeaway: "Bigger size → more liquidity consumed → worse fill.",
    visual: "orderSize",
    holdMs: 2400,
  },
  {
    id: "liquidity",
    lesson: 3,
    chapter: "PHASE 3 · LIQUIDITY",
    title: "Depth changes everything",
    voice:
      "A deep order book absorbs orders with minimal price movement. A thin book cannot. The same market order in a deep book fills cleanly. In a thin book, price jumps level after level. Liquidity is your cushion against slippage.",
    takeaway: "Thin liquidity → orders eat through levels.",
    visual: "liquidityDepth",
    holdMs: 2600,
  },
  {
    id: "market-order",
    lesson: 4,
    chapter: "PHASE 4 · MARKET ORDERS",
    title: "Speed costs price",
    voice:
      "A market buy takes whatever liquidity is available right now. Watch price jump through several ask levels. Fast execution often sacrifices price. You get certainty of fill — not certainty of price.",
    takeaway: "Market orders trade speed for fill quality.",
    visual: "marketOrderSweep",
    holdMs: 2600,
  },
  {
    id: "volatility",
    lesson: 5,
    chapter: "PHASE 5 · VOLATILITY",
    title: "Calm vs chaotic markets",
    voice:
      "In a calm market, prices move slowly and spreads stay tight. In a volatile market, prices jump and spreads widen. The same order in volatile conditions gets a worse fill. Volatility increases uncertainty — and slippage risk.",
    takeaway: "High volatility → wider spreads → worse fills.",
    visual: "volatilityImpact",
    holdMs: 2400,
  },
  {
    id: "good-vs-bad",
    lesson: 6,
    chapter: "PHASE 6 · EXECUTION QUALITY",
    title: "Good vs bad conditions",
    voice:
      "Good execution: strong liquidity, tight spread, stable market. Bad execution: thin liquidity, wide spread, volatile conditions. Professionals read these signals before they click buy.",
    takeaway: "Read conditions before you execute.",
    visual: "goodVsBad",
    holdMs: 2400,
  },
  {
    id: "pro-reduction",
    lesson: 7,
    chapter: "PHASE 8 · REDUCE SLIPPAGE",
    title: "How professionals execute",
    voice:
      "Professionals reduce slippage with limit orders, smaller size, patience, and by avoiding thin or extremely volatile conditions. They do not assume the screen price is guaranteed.",
    takeaway: "Limits · smaller size · patience · avoid thin books.",
    visual: "proReduction",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Why was my fill different?",
    voice:
      "Slippage happens because liquidity, volatility, order size, and order type all affect your fill. Before every trade, check spread, depth, and execution quality. Next: find these signals on your live terminal.",
    takeaway: "Clicking buy does not guarantee the displayed price.",
    visual: "recap",
    holdMs: 2200,
  },
];
