/**
 * CINEMATIC ORDER BOOK MICRO-LEARNING.
 *
 * The module teaches through a small, controlled, animated order-book scene
 * rather than text walls. Each "beat" is a short micro-card + a scene the book
 * animates into, with calm narration and generous pauses. Some beats are
 * "watch" beats: narrate the setup, animate the change, then sit in silence so
 * the learner can absorb what happened, then a "result" beat explains it.
 */

export type OBHighlight =
  | "none"
  | "book"
  | "bids"
  | "asks"
  | "spread"
  | "bidwall"
  | "imbalance"
  | "danger";

export type BeatPhase = "intro" | "teach" | "watch" | "result" | "check" | "outro";

/** A snapshot the mini order book renders. Arrays index 0 = nearest to mid. */
export interface OBSceneSpec {
  asks: number[];
  bids: number[];
  spreadBps: number;
}

/**
 * First-principles storytelling effects. These let the simulator teach in plain
 * human language ("buyers", "sellers", "a trade happened", "price moved up")
 * before any terminal terminology appears.
 */
export interface OBSceneFx {
  /** Center band shows a plain "PRICE" marker instead of the spread reading. */
  center?: "price" | "spread";
  /** Show plain-language "BUYERS / SELLERS waiting" labels on each side. */
  zoneLabels?: boolean;
  /** Flash a trade happening where a buyer and seller agree. */
  trade?: boolean;
  /** Animate the price marker moving up or down. */
  priceMove?: "up" | "down";
}

export interface OBBeat {
  id: string;
  /** Short concept tag, e.g. "BIDS". Empty for intro/outro. */
  concept: string;
  cardTitle: string;
  /** One short plain-English line (beginner). */
  cardLine: string;
  /** Optional single warning / mistake-to-avoid line shown under the card. */
  warn?: string;
  /** Calm spoken narration (beginner). */
  narration: string;
  /** Condensed spoken line for PRO mode. */
  narrationPro?: string;
  scene: OBSceneSpec;
  highlight: OBHighlight;
  phase: BeatPhase;
  /** First-principles storytelling effects (plain-language act). */
  fx?: OBSceneFx;
  /** Animate a market order sweeping the book (dangerous-execution beat). */
  sweep?: boolean;
  /** Extra silent observation time after narration (ms). */
  holdMs?: number;
  /** Light comprehension check — tap the named region. */
  check?: { prompt: string; target: "bids" | "asks" | "spread" };
}

// ---- Reusable scenes ------------------------------------------------------

const HEALTHY: OBSceneSpec = {
  asks: [62, 70, 80, 74, 66],
  bids: [64, 72, 82, 76, 68],
  spreadBps: 1.2,
};

// Buyers eager → nearest sellers used up, price pushes up.
const PRICE_UP: OBSceneSpec = {
  asks: [0, 0, 40, 52, 46],
  bids: [66, 74, 82, 76, 68],
  spreadBps: 1.4,
};

// Sellers rush in → nearest buyers used up, price drops.
const PRICE_DOWN: OBSceneSpec = {
  asks: [64, 72, 82, 76, 68],
  bids: [0, 0, 40, 52, 46],
  spreadBps: 1.4,
};

const HEALTHY_DEEP: OBSceneSpec = {
  asks: [70, 80, 92, 86, 78],
  bids: [72, 84, 94, 88, 80],
  spreadBps: 1.0,
};

const WEAK: OBSceneSpec = {
  asks: [16, 11, 8, 6, 5],
  bids: [15, 10, 7, 5, 4],
  spreadBps: 4.5,
};

const BID_HEAVY: OBSceneSpec = {
  asks: [22, 18, 15, 13, 11],
  bids: [82, 92, 86, 78, 70],
  spreadBps: 1.6,
};

const BIDS_VANISHING: OBSceneSpec = {
  asks: [60, 70, 80, 74, 66],
  bids: [0, 0, 14, 30, 44],
  spreadBps: 3.2,
};

const SPREAD_WIDE: OBSceneSpec = {
  asks: [0, 0, 44, 56, 50],
  bids: [0, 0, 42, 54, 48],
  spreadBps: 9.5,
};

const THIN_FOR_SWEEP: OBSceneSpec = {
  asks: [10, 7, 28, 40, 36],
  bids: [12, 9, 30, 42, 38],
  spreadBps: 7.5,
};

// ---- The beat sequence ----------------------------------------------------

export const ORDER_BOOK_BEATS: OBBeat[] = [
  // ── ACT ONE — FIRST PRINCIPLES (plain human language, no jargon yet) ──
  {
    id: "what",
    concept: "",
    cardTitle: "What is the order book?",
    cardLine: "A live list of people waiting to buy and sell.",
    narration:
      "Before anything else, let's answer one simple question: what is the order book? It is just a live list of people who want to buy or sell. Some are waiting to buy. Some are waiting to sell. That's all it is.",
    narrationPro: "Order book: the live list of resting buyers and sellers.",
    scene: HEALTHY,
    highlight: "book",
    phase: "intro",
    fx: { center: "price", zoneLabels: true },
    holdMs: 2200,
  },
  {
    id: "buyers",
    concept: "BUYERS",
    cardTitle: "Who are the buyers?",
    cardLine: "People who want to buy — waiting below for a cheaper price.",
    narration:
      "The green side, down here, is the buyers. They want to buy, but they're hoping to get a cheaper price, so they wait below where the market is now. Think of people standing in a market saying: I'll buy, but only if the price comes down to mine.",
    narrationPro: "Green = buyers resting below, bidding for cheaper fills.",
    scene: HEALTHY,
    highlight: "bids",
    phase: "teach",
    fx: { center: "price", zoneLabels: true },
    holdMs: 2400,
  },
  {
    id: "sellers",
    concept: "SELLERS",
    cardTitle: "Who are the sellers?",
    cardLine: "People who want to sell — waiting above for a higher price.",
    narration:
      "The red side, up here, is the sellers. They want to sell, but they're hoping for a higher price, so they wait above. Same market, but these people are saying: I'll sell, but only if the price comes up to mine.",
    narrationPro: "Red = sellers resting above, offering at higher prices.",
    scene: HEALTHY,
    highlight: "asks",
    phase: "teach",
    fx: { center: "price", zoneLabels: true },
    holdMs: 2400,
  },
  {
    id: "marketplace",
    concept: "THE IDEA",
    cardTitle: "It's a waiting marketplace",
    cardLine: "Buyers wait below, sellers wait above, price sits in the middle.",
    narration:
      "So picture a marketplace. Buyers stand below, hoping for a cheaper deal. Sellers stand above, hoping to sell for more. And the current price sits right in the middle, where the two sides are closest to agreeing.",
    narrationPro: "Buyers below, sellers above, price between the two.",
    scene: HEALTHY,
    highlight: "book",
    phase: "teach",
    fx: { center: "price", zoneLabels: true },
    holdMs: 2400,
  },
  {
    id: "trade",
    concept: "A TRADE",
    cardTitle: "How does a trade happen?",
    cardLine: "When one side agrees to the other side's price.",
    narration:
      "So how does an actual trade happen? It happens the moment someone agrees to the other side's price. A buyer accepts a seller's price, or a seller accepts a buyer's. They meet in the middle, and a trade is made. Watch.",
    narrationPro: "A trade prints when one side accepts the other's price.",
    scene: HEALTHY,
    highlight: "spread",
    phase: "watch",
    fx: { center: "price", trade: true },
    holdMs: 2800,
  },
  {
    id: "price-up",
    concept: "PRICE MOVES",
    cardTitle: "Why does price go up?",
    cardLine: "Eager buyers use up the nearby sellers.",
    narration:
      "Now, why does the price actually move? When buyers are eager, they keep accepting the sellers' prices. The nearest sellers get used up one by one, so the next trade happens a little higher. That is the price moving up. Watch the sellers near the middle disappear and the price climb.",
    narrationPro: "Buyers lift offers → near asks consumed → price ticks up.",
    scene: PRICE_UP,
    highlight: "asks",
    phase: "watch",
    fx: { center: "price", priceMove: "up" },
    holdMs: 3000,
  },
  {
    id: "price-down",
    concept: "PRICE MOVES",
    cardTitle: "And why does it fall?",
    cardLine: "Eager sellers use up the nearby buyers.",
    narration:
      "It works the same way going down. When sellers are eager, they keep accepting the buyers' prices. The nearest buyers get used up, so the next trade happens a little lower, and the price falls. Buying pushes price up, selling pushes price down. That is the whole engine.",
    narrationPro: "Sellers hit bids → near bids consumed → price ticks down.",
    scene: PRICE_DOWN,
    highlight: "bids",
    phase: "watch",
    fx: { center: "price", priceMove: "down" },
    holdMs: 3000,
  },
  // ── ACT TWO — NOW THE TERMINAL WORDS (built on the ideas above) ──
  {
    id: "spread",
    concept: "SPREAD",
    cardTitle: "What is the spread?",
    cardLine: "The gap between the closest buyer and seller.",
    narration:
      "Now that you understand buyers and sellers, here's your first real word: the spread. It is simply the gap in the middle, between the highest buyer and the lowest seller. A small gap means it's cheap to trade right now. A wide gap means it costs you more.",
    narrationPro: "Spread: best bid to best ask — the cost to trade now.",
    scene: HEALTHY,
    highlight: "spread",
    phase: "teach",
    holdMs: 2400,
  },
  {
    id: "check-spread",
    concept: "CHECK",
    cardTitle: "Quick check",
    cardLine: "Tap the spread — the gap in the middle.",
    narration:
      "Let's make sure that landed. Using your mouse, tap the spread. That is the gap in the middle, between the green buyers and the red sellers.",
    narrationPro: "Tap the spread.",
    scene: HEALTHY,
    highlight: "none",
    phase: "check",
    check: { prompt: "Tap the SPREAD — the gap in the middle", target: "spread" },
  },
  {
    id: "liquidity",
    concept: "LIQUIDITY",
    cardTitle: "What is liquidity?",
    cardLine: "How many people are waiting to trade.",
    narration:
      "Here's your next word: liquidity. It just means how many people are waiting to trade. When lots of people are waiting, like now, you can buy or sell a large amount and barely move the price.",
    narrationPro: "Liquidity: how much resting size is waiting on each side.",
    scene: HEALTHY_DEEP,
    highlight: "book",
    phase: "teach",
    holdMs: 2200,
  },
  {
    id: "watch-weak",
    concept: "LIQUIDITY",
    cardTitle: "Watch the liquidity thin out",
    cardLine: "Watch the bars shrink…",
    narration:
      "Now keep your eyes on the bars and watch them get smaller. This is what weak liquidity looks like.",
    narrationPro: "Watch: depth thins.",
    scene: WEAK,
    highlight: "book",
    phase: "watch",
    holdMs: 3000,
  },
  {
    id: "result-weak",
    concept: "LIQUIDITY",
    cardTitle: "Thin book",
    cardLine: "Little waiting = price moves easily.",
    warn: "Trading large size into a thin book can move the price against you.",
    narration:
      "See how little is left waiting? When the book is thin like this, even a small order can move the price a lot. A thin book means a faster, more unpredictable market.",
    narrationPro: "Thin depth → high market impact; small orders move price.",
    scene: WEAK,
    highlight: "book",
    phase: "result",
    holdMs: 1800,
  },
  {
    id: "imbalance",
    concept: "IMBALANCE",
    cardTitle: "Imbalance",
    cardLine: "One side stronger than the other.",
    narration:
      "When one side clearly has more waiting than the other, that is called an imbalance. Right now there are far more buyers than sellers. That extra buying interest often pushes the price up for a little while.",
    narrationPro: "Imbalance: bid/ask size skew signals near-term directional pressure.",
    scene: BID_HEAVY,
    highlight: "imbalance",
    phase: "teach",
    holdMs: 2200,
  },
  {
    id: "watch-vanish",
    concept: "SUPPORT",
    cardTitle: "Watch the buyers disappear",
    cardLine: "Watch the green vanish near the price…",
    narration:
      "Now watch the green buyers nearest the price. Watch what happens when they suddenly disappear.",
    narrationPro: "Watch: near-touch bids pull.",
    scene: BIDS_VANISHING,
    highlight: "bids",
    phase: "watch",
    holdMs: 3000,
  },
  {
    id: "result-vanish",
    concept: "SUPPORT",
    cardTitle: "Support weakens",
    cardLine: "Fewer buyers = price can fall faster.",
    warn: "Buyers vanishing under the price is an early warning a drop may speed up.",
    narration:
      "The buyers right under the price are gone. With fewer of them left to catch it, the price can fall faster. When buyers disappear like this, it is an early warning that a move down could speed up.",
    narrationPro: "Bid withdrawal removes support; impulsive downside risk rises.",
    scene: BIDS_VANISHING,
    highlight: "bids",
    phase: "result",
    holdMs: 1800,
  },
  {
    id: "watch-widen",
    concept: "SPREAD",
    cardTitle: "Watch the spread widen",
    cardLine: "Watch the gap grow…",
    narration: "Now look back at the middle. Watch the gap, the spread, grow wider and wider.",
    narrationPro: "Watch: spread expands.",
    scene: SPREAD_WIDE,
    highlight: "spread",
    phase: "watch",
    holdMs: 3000,
  },
  {
    id: "result-widen",
    concept: "SPREAD",
    cardTitle: "Wide spread",
    cardLine: "Bigger gap = trades cost more.",
    warn: "A widening spread is a signal to slow down, not to rush in.",
    narration:
      "The gap is much wider now. That means trading at this moment is expensive. To buy, you would have to pay more, and to sell, you would have to accept less, just to make the trade happen. A widening gap is a sign to slow down.",
    narrationPro: "Wide spread → higher cost to cross; reduce urgency.",
    scene: SPREAD_WIDE,
    highlight: "spread",
    phase: "result",
    holdMs: 1800,
  },
  {
    id: "watch-danger",
    concept: "DANGER",
    cardTitle: "Watch a rushed buy order",
    cardLine: "Watch it climb through the few sellers…",
    narration:
      "Here is why all of that matters. A market order is an order that buys right now, at whatever price it can get. Watch one push up through this thin book of sellers.",
    narrationPro: "Watch: market buy walks a thin ask stack.",
    scene: THIN_FOR_SWEEP,
    highlight: "danger",
    phase: "watch",
    sweep: true,
    holdMs: 2400,
  },
  {
    id: "result-danger",
    concept: "DANGER",
    cardTitle: "Slippage",
    cardLine: "You paid far more than the start price.",
    warn: "Use a limit order, trade smaller, or wait for calm to avoid slippage.",
    narration:
      "Because there were so few sellers, the order had to climb through them one level at a time, and it ended up buying much higher than where it started. That difference, between the price you expected and the price you actually paid, is called slippage. To avoid it, you can use a limit order, trade a smaller amount, or simply wait until the market is calmer.",
    narrationPro: "Walked the book → slippage. Use limits, cut size, or wait for depth.",
    scene: THIN_FOR_SWEEP,
    highlight: "danger",
    phase: "result",
    holdMs: 2000,
  },
  {
    id: "outro",
    concept: "",
    cardTitle: "You can read the book now",
    cardLine: "Bids · Asks · Spread · Liquidity · Danger.",
    narration:
      "That is the order book. Green bids are buyers below, red asks are sellers above, the spread is the gap in the middle, and all the waiting size together is the liquidity. When the book gets thin and the spread gets wide, trading becomes dangerous. Press Watch It Happen to see this play out on a real market.",
    narrationPro:
      "Bids below, asks above, spread = cost, depth = liquidity. Thin + wide = dangerous. Replay to confirm live.",
    scene: HEALTHY,
    highlight: "book",
    phase: "outro",
    holdMs: 1200,
  },
];

/** Replay scenario launched by the final "Watch It Happen" CTA. */
export const ORDER_BOOK_REPLAY_SCENARIO = "sc-liq-cascade-btc";
