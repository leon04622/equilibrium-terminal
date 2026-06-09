import type { NormalizedOrderBook } from "@/types/terminal-schema";
import { LiveBookCoach, type CauseEffectDecision } from "@/lib/education/liveBookCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

/**
 * ORDER BOOK LEARNING TEMPLATE V1 — FROZEN. No major changes; incremental only.
 * Cloned for Funding & Market Crowding (fundingBridgeSteps.ts).
 *
 * LESSON-TO-LIVE BRIDGE — Operator Decision Mode.
 *
 * PHASE 10 — frozen architecture for replication. Modes:
 *   explain    — using TODAY's book, not "what is a bid"
 *   demo       — visual cause/effect animation
 *   observe    — pause → "what changed?" → reveal (Phase 4/5)
 *   compare    — good vs bad side-by-side (Phase 6)
 *   decide     — pick trading environment (Phase 3)
 *   recognize  — verify operational recognition (Phase 9)
 */

export type BookRegion = "book" | "bids" | "asks" | "spread" | null;
export type BridgeMode = "explain" | "demo" | "observe" | "compare" | "decide" | "recognize";
export type DemoKind = "consume" | "wall";

export interface RecognitionSpec {
  prompt: string;
  accept: Exclude<BookRegion, null>[];
  nudge: string;
}

export interface BridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: BridgeMode;
  region: BookRegion;
  /** PHASE 2 — why should I care before trading? */
  whyCare?: (book: NormalizedOrderBook | null) => string;
  coach: (book: NormalizedOrderBook | null) => string;
  demo?: DemoKind;
  recognize?: RecognitionSpec;
  conceptId?: string;
  /** PHASE 4 — observational learning */
  observe?: { question: string; reveal: string; ced?: CauseEffectDecision };
  /** PHASE 6 — good vs bad */
  compare?: { good: CompareSide; bad: CompareSide };
  /** PHASE 3 — scenario decision */
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const ORDER_BOOK_BRIDGE_PANEL = "hyperbook";

/** PHASE 9 — success = knows what to check before a trade. */
export const ORDER_BOOK_REQUIRED_CONCEPTS = [
  "check-spread",
  "check-liquidity",
  "check-conditions",
  "pretrade-ready",
];

const GOOD_ENV: CompareSide = {
  id: "good",
  title: "GOOD",
  good: true,
  traits: ["Tight spread", "Strong liquidity", "Stable depth"],
};

const BAD_ENV: CompareSide = {
  id: "bad",
  title: "BAD",
  good: false,
  traits: ["Wide spread", "Thin liquidity", "Bids disappearing"],
};

export const ORDER_BOOK_BRIDGE_STEPS: BridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "OPERATOR MODE",
    title: "Using today's order book",
    region: "book",
    coach: (book) => LiveBookCoach.todayReadout(book),
    whyCare: () => "You don't trade the lesson — you trade the live book. Let's read what's here right now.",
  },
  {
    id: "live-spread",
    mode: "explain",
    chapter: "SPREAD · NOW",
    title: "Check spread before every trade",
    region: "spread",
    coach: (book) => LiveBookCoach.spread(book).line,
    whyCare: (book) => LiveBookCoach.whyCareBeforeBuy(book),
  },
  {
    id: "live-liquidity",
    mode: "explain",
    chapter: "LIQUIDITY · NOW",
    title: "Check depth before sizing up",
    region: "book",
    coach: (book) => LiveBookCoach.liquidity(book).line,
    whyCare: (book) =>
      `Thin book = your order moves price. ${LiveBookCoach.liquidity(book).line}`,
  },
  {
    id: "live-walls",
    mode: "explain",
    chapter: "WALLS · NOW",
    title: "Watch for walls before entering",
    region: "asks",
    coach: (book) => {
      const ask = LiveBookCoach.nearbyAskWall(book);
      const bid = LiveBookCoach.nearbyBidWall(book);
      if (ask && bid) return "Both a sell wall above and bid support below — price may pin between them.";
      if (ask) return "Sell wall above — buying into it may stall or slip.";
      if (bid) return "Bid wall below — support is holding price up.";
      return "No standout walls in the top levels right now.";
    },
    whyCare: () => "A wall can absorb your order or block price — check before you enter.",
  },
  {
    id: "demo-consume",
    mode: "demo",
    demo: "consume",
    chapter: "CAUSE → EFFECT",
    title: "A market buy eats liquidity",
    region: "asks",
    coach: () => "Watch: liquidity consumed → bars vanish → price steps up. This is why depth matters before sizing.",
  },
  {
    id: "observe-buyers",
    mode: "observe",
    chapter: "OBSERVE",
    title: "What changed?",
    region: "bids",
    observe: {
      question: "Look at the bids. What changed?",
      reveal: "Buyers disappeared — bid sizes shrank and support weakened.",
      ced: LiveBookCoach.buyersLeftScenario(),
    },
    coach: () => "Don't rush to explain — look first. What do you see?",
  },
  {
    id: "compare-env",
    mode: "compare",
    chapter: "GOOD VS BAD",
    title: "Which book would you trade?",
    region: "book",
    compare: { good: GOOD_ENV, bad: BAD_ENV },
    coach: () => "Traders prefer tight spread, healthy depth, and stable resting orders.",
  },
  {
    id: "decide-env",
    mode: "decide",
    chapter: "YOUR CALL",
    title: "Pick the better trading environment",
    region: "book",
    decide: {
      prompt: "Which environment would you rather trade in?",
      options: [
        {
          id: "a",
          label: "Scenario A",
          traits: ["Tight spread", "Healthy liquidity", "Balanced book"],
          correct: true,
        },
        {
          id: "b",
          label: "Scenario B",
          traits: ["Wide spread", "Thin liquidity", "Unstable conditions"],
          correct: false,
        },
      ],
      explanation:
        "Scenario A — tight spread and healthy depth mean cheaper, safer execution. Scenario B costs more on every fill and slips easily.",
    },
    coach: () => "Think like a trader: which book makes your job easier?",
  },
  {
    id: "live-conditions",
    mode: "explain",
    chapter: "TODAY'S READ",
    title: "What matters right now",
    region: "book",
    coach: (book) => LiveBookCoach.todayReadout(book),
    whyCare: (book) => {
      const env = LiveBookCoach.tradeEnvironment(book);
      return env === "good"
        ? "Conditions look favorable — still check spread and size before clicking buy."
        : env === "avoid"
          ? "Conditions look unstable — consider waiting or using limits."
          : "Mixed conditions — size down and check spread before entering.";
    },
  },
  {
    id: "pretrade",
    mode: "explain",
    chapter: "PRE-TRADE CHECK",
    title: "Order book pre-trade check",
    region: "spread",
    coach: () => "Before any trade, run this quick check against the live book.",
  },
  // ---- PHASE 9 — operational recognition (what to check, not what is a bid) -
  {
    id: "recognize-spread",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Where do you check spread before buying?",
    region: null,
    conceptId: "check-spread",
    coach: () => "Click where you'd check the spread before placing a buy.",
    recognize: {
      prompt: "Click the spread — where you'd check cost before buying.",
      accept: ["spread"],
      nudge: "The spread is the strip in the middle — check it before every entry.",
    },
  },
  {
    id: "recognize-liquidity",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Where do you check liquidity depth?",
    region: null,
    conceptId: "check-liquidity",
    coach: () => "Click where you'd judge if there's enough depth for your size.",
    recognize: {
      prompt: "Click the bid or ask depth bars.",
      accept: ["bids", "asks"],
      nudge: "Liquidity is the size resting at each price — the depth bars.",
    },
  },
  {
    id: "recognize-conditions",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Read today's overall conditions",
    region: null,
    conceptId: "check-conditions",
    coach: () => "Click the whole book — where you'd read today's trading environment.",
    recognize: {
      prompt: "Click anywhere on the order book panel.",
      accept: ["bids", "asks", "spread"],
      nudge: "Scan the full book — spread, depth, and walls together tell you if it's safe to trade.",
    },
  },
  {
    id: "done",
    mode: "explain",
    chapter: "VALIDATED",
    title: "You know what to check before trading",
    region: null,
    conceptId: "pretrade-ready",
    coach: () =>
      "You can read today's spread, liquidity, walls, and overall conditions — and you know what to check before entering a trade.",
  },
];
