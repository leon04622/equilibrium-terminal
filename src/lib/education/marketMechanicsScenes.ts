/**
 * MARKET MECHANICS SIMULATOR — first-principles curriculum.
 *
 * This module is the *prerequisite* to the Order Book lesson. It teaches how a
 * market actually works using human language and a clean animated playground —
 * NO terminal, NO jargon — before any technical term is ever introduced.
 *
 * Design rules (one concept per screen):
 *   - one idea per scene
 *   - one visual per scene
 *   - one single-sentence voice line per scene (also shown as the caption)
 *
 * The lessons are strictly ordered so each new term is only introduced after
 * the intuition behind it already exists:
 *   1 how a trade happens   → 2 what the book is → 3 why price moves
 *   → 4 bids & asks → 5 spread → 6 liquidity → 7 imbalance
 *   → 8 slippage → 9 dangerous execution
 */

export type MMVisual =
  | "intro"
  | "negotiation"
  | "waitingRoom"
  | "priceMove"
  | "bidsAsks"
  | "spread"
  | "liquidity"
  | "imbalance"
  | "slippage"
  | "danger"
  | "recap";

export interface MMScene {
  id: string;
  /** Lesson number for the chapter tag (0 = intro/recap framing screens). */
  lesson: number;
  /** Short chapter label shown above the title. */
  chapter: string;
  /** Plain-language headline for the screen. */
  title: string;
  /** The single spoken sentence — also rendered as the caption. */
  voice: string;
  /** Optional one-line reinforcement under the title (kept tiny). */
  takeaway?: string;
  visual: MMVisual;
  /** Silent observation window after narration before auto-advance. */
  holdMs?: number;
}

export const MARKET_MECHANICS_SCENES: MMScene[] = [
  {
    id: "intro",
    lesson: 0,
    chapter: "MARKET MECHANICS",
    title: "Let's see how a market really works",
    voice:
      "Before we read a single chart, let's watch how a market actually works — in plain language.",
    takeaway: "No jargon yet. Just buyers, sellers, and price.",
    visual: "intro",
    holdMs: 900,
  },
  {
    id: "trade",
    lesson: 1,
    chapter: "LESSON 1 · HOW A TRADE HAPPENS",
    title: "A trade needs two people to agree",
    voice: "A trade only happens when a buyer and a seller agree on a price.",
    takeaway: "Buyer comes up, seller comes down — until they meet.",
    visual: "negotiation",
    holdMs: 1600,
  },
  {
    id: "book",
    lesson: 2,
    chapter: "LESSON 2 · WHAT THE ORDER BOOK IS",
    title: "It's just a waiting room",
    voice: "The order book is simply a waiting room of buyers and sellers.",
    takeaway: "Some are willing to pay less. Some want to sell for more.",
    visual: "waitingRoom",
    holdMs: 1500,
  },
  {
    id: "why-price-moves",
    lesson: 3,
    chapter: "LESSON 3 · WHY PRICE MOVES",
    title: "Price is a tug-of-war",
    voice: "Price moves because buyers and sellers constantly compete.",
    takeaway: "More eager buyers push it up. More eager sellers push it down.",
    visual: "priceMove",
    holdMs: 1600,
  },
  {
    id: "bids-asks",
    lesson: 4,
    chapter: "LESSON 4 · BIDS & ASKS",
    title: "Now we can name the two sides",
    voice:
      "Buyers waiting to buy are called bids. Sellers waiting to sell are called asks.",
    takeaway: "Bids = the waiting buyers. Asks = the waiting sellers.",
    visual: "bidsAsks",
    holdMs: 1500,
  },
  {
    id: "spread",
    lesson: 5,
    chapter: "LESSON 5 · THE SPREAD",
    title: "The gap in the middle",
    voice: "The spread is the gap between the highest bid and the lowest ask.",
    takeaway: "A small gap is cheap to cross. A big gap is expensive.",
    visual: "spread",
    holdMs: 1500,
  },
  {
    id: "liquidity",
    lesson: 6,
    chapter: "LESSON 6 · LIQUIDITY",
    title: "How crowded is the waiting room?",
    voice:
      "Liquidity is how many buyers and sellers are waiting — a lot means your trade barely moves the price.",
    takeaway: "Deep = many waiting. Thin = very few waiting.",
    visual: "liquidity",
    holdMs: 1600,
  },
  {
    id: "imbalance",
    lesson: 7,
    chapter: "LESSON 7 · IMBALANCE",
    title: "When one side outnumbers the other",
    voice:
      "Imbalance is when one side has far more waiting than the other — that pressure pushes price toward the bigger side.",
    takeaway: "Way more buyers than sellers → price tends to climb.",
    visual: "imbalance",
    holdMs: 1600,
  },
  {
    id: "slippage",
    lesson: 8,
    chapter: "LESSON 8 · SLIPPAGE",
    title: "Eating through the prices",
    voice:
      "Slippage is when a big order eats through several prices, so you fill at a worse average price than you expected.",
    takeaway: "The first price is cheap — the rest cost more.",
    visual: "slippage",
    holdMs: 1700,
  },
  {
    id: "danger",
    lesson: 9,
    chapter: "LESSON 9 · DANGEROUS EXECUTION",
    title: "Thin book + big order = danger",
    voice:
      "When liquidity is thin, a large order can blow through many prices at once — that's dangerous execution.",
    takeaway: "Few sellers waiting → your price can jump a long way.",
    visual: "danger",
    holdMs: 1800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "YOU'VE GOT THE FOUNDATIONS",
    title: "You now understand how markets work",
    voice:
      "You now know how trades happen, why buyers and sellers wait, what the order book is, and why price moves.",
    takeaway: "Next: see all of this live in the real order book.",
    visual: "recap",
    holdMs: 1200,
  },
];
