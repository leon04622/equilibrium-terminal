import type { NormalizedOrderBook } from "@/types/terminal-schema";

/**
 * LIVE BOOK COACH.
 *
 * Pure interpretation of the *current* live order book. The Lesson-to-Live
 * Bridge and the Operator Coach use this to say what the book means RIGHT NOW —
 * not generic definitions. Every function is side-effect free and tolerates a
 * null / empty book so the UI can always render something calm.
 */

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface CoachReadout {
  state: CoachState;
  /** One plain-language sentence about the current state. */
  line: string;
}

/**
 * PHASE 1 — the Operator Coach speaks like a senior trader pointing at the
 * screen, NOT like documentation. Four short, operational fields only.
 */
export interface CoachCard {
  state: CoachState;
  /** Current state — one short line. */
  liveNow: string;
  /** Where to look on the panel. */
  lookHere: string;
  /** Why it matters — one sentence. */
  whyItMatters: string;
  /** What to watch next — one sentence. */
  whatToWatch: string;
}

/** PHASE 5 — cause → effect → decision for operator learning. */
export interface CauseEffectDecision {
  happened: string;
  whyItMatters: string;
  tradersNotice: string;
  tradersDo: string;
}

export interface PreTradeItem {
  id: string;
  label: string;
  state: CoachState;
  note: string;
}

export type TradeEnvironment = "good" | "caution" | "avoid";

const TOP_N = 10;
const WALL_RATIO = 2.4;

function sumTop(levels: { size: number }[], n = TOP_N): number {
  return levels.slice(0, n).reduce((acc, l) => acc + (l.size || 0), 0);
}

export const LiveBookCoach = {
  hasBook(book: NormalizedOrderBook | null): book is NormalizedOrderBook {
    return Boolean(book && book.bids.length > 0 && book.asks.length > 0);
  },

  /** PHASE 5 — current spread state, not just "this is the spread". */
  spread(book: NormalizedOrderBook | null): CoachReadout {
    const bps = book?.spreadBps;
    if (bps == null) return { state: "neutral", line: "The spread isn't available right now." };
    if (bps < 2)
      return {
        state: "good",
        line: `The spread is currently very small (${bps.toFixed(1)} bps). Trading conditions are efficient — cheap to cross.`,
      };
    if (bps < 6)
      return {
        state: "neutral",
        line: `The spread is normal (${bps.toFixed(1)} bps). These are typical trading conditions.`,
      };
    if (bps < 12)
      return {
        state: "warn",
        line: `The spread has widened (${bps.toFixed(1)} bps). Trading may cost more than usual right now.`,
      };
    return {
      state: "danger",
      line: `The spread is wide (${bps.toFixed(1)} bps). Execution is expensive and slippery — be careful.`,
    };
  },

  /** PHASE 3 — which side is heavier, and what that pressure implies. */
  imbalance(book: NormalizedOrderBook | null): CoachReadout {
    if (!LiveBookCoach.hasBook(book))
      return { state: "neutral", line: "Not enough resting orders to read the balance yet." };
    const bid = sumTop(book.bids);
    const ask = sumTop(book.asks);
    const total = bid + ask;
    if (total <= 0)
      return { state: "neutral", line: "Not enough resting orders to read the balance yet." };
    const skew = (bid - ask) / total;
    const pct = Math.round(Math.abs(skew) * 100);
    if (skew > 0.18)
      return {
        state: "good",
        line: `Buyers outweigh sellers by about ${pct}% near the top of the book — pressure is leaning up.`,
      };
    if (skew < -0.18)
      return {
        state: "warn",
        line: `Sellers outweigh buyers by about ${pct}% near the top of the book — pressure is leaning down.`,
      };
    return {
      state: "neutral",
      line: "Buyers and sellers are roughly balanced near the top of the book.",
    };
  },

  /** PHASE 6 — how much is resting, and where it's strongest. */
  liquidity(book: NormalizedOrderBook | null): CoachReadout {
    if (!LiveBookCoach.hasBook(book))
      return { state: "warn", line: "The book looks empty — wait for orders to load before trading." };
    const bid = sumTop(book.bids);
    const ask = sumTop(book.asks);
    const thin = book.bids.length < 6 || book.asks.length < 6;
    if (thin)
      return {
        state: "warn",
        line: "Liquidity looks thin — few orders are waiting, so a larger trade can move price quickly.",
      };
    const side = bid > ask ? "bid (buy) side" : "ask (sell) side";
    return {
      state: "neutral",
      line: `There's healthy depth on both sides; right now it's a little stronger on the ${side}.`,
    };
  },

  /** PHASE 1 — the compact "senior trader" read of the whole book right now. */
  operatorCoach(book: NormalizedOrderBook | null): CoachCard {
    if (!LiveBookCoach.hasBook(book)) {
      return {
        state: "neutral",
        liveNow: "Order book is still loading.",
        lookHere: "The two stacks of prices — green bids and red asks — and the spread strip between them.",
        whyItMatters: "These show who wants to trade and at what price.",
        whatToWatch: "Wait for prices to populate before trading.",
      };
    }
    const spread = LiveBookCoach.spread(book);
    const imb = LiveBookCoach.imbalance(book);
    const liq = LiveBookCoach.liquidity(book);
    const bps = book.spreadBps ?? 0;
    const spreadWord = bps < 2 ? "very tight" : bps < 6 ? "normal" : bps < 12 ? "widening" : "wide";
    const pressure =
      imb.state === "good" ? "buyers leaning in" : imb.state === "warn" ? "sellers leaning in" : "balanced";
    const state: CoachState =
      spread.state === "danger" || liq.state === "warn"
        ? "warn"
        : spread.state === "good" && imb.state !== "warn"
          ? "good"
          : "neutral";
    return {
      state,
      liveNow: `Spread ${spreadWord}${bps ? ` (${bps.toFixed(1)} bps)` : ""} · ${pressure}.`,
      lookHere: "Green bids on one side, red asks on the other, and the spread strip in the middle.",
      whyItMatters:
        spread.state === "good"
          ? "Check this before buying — cheap to get in and out right now."
          : spread.state === "warn" || spread.state === "danger"
            ? "Check this before any trade — crossing costs more than usual."
            : "Run a quick spread check before every entry.",
      whatToWatch:
        liq.state === "warn"
          ? "Thin liquidity — size down or use limits before entering."
          : LiveBookCoach.nearbyAskWall(book)
            ? "Sell wall above — buying into it may stall."
            : imb.state === "warn"
              ? "Sellers leaning in — be cautious on longs."
              : "Glance at depth bars before you click buy or sell.",
    };
  },

  /** PHASE 2 — why check this before buying or selling? */
  whyCareBeforeBuy(book: NormalizedOrderBook | null): string {
    const spread = LiveBookCoach.spread(book);
    const liq = LiveBookCoach.liquidity(book);
    const walls = LiveBookCoach.nearbyAskWall(book);
    return `Before buying: check spread (${spread.state === "good" ? "OK" : "watch"}), liquidity (${liq.state === "warn" ? "thin" : "OK"}), and sell walls nearby (${walls ? "yes — resistance above" : "none obvious"}).`;
  },

  whyCareBeforeSell(book: NormalizedOrderBook | null): string {
    const spread = LiveBookCoach.spread(book);
    const liq = LiveBookCoach.liquidity(book);
    const support = LiveBookCoach.nearbyBidWall(book);
    return `Before selling: check bid support (${support ? "wall below holding price" : "normal"}), liquidity depth (${liq.state === "warn" ? "thin" : "OK"}), and spread (${spread.state === "good" ? "acceptable" : "wide — costly"}).`;
  },

  /** Detect a large resting ask within top levels (sell wall). */
  nearbyAskWall(book: NormalizedOrderBook | null): boolean {
    if (!LiveBookCoach.hasBook(book)) return false;
    const top = book.asks.slice(0, 8);
    const max = Math.max(...top.map((l) => l.size), 0);
    const median = top.map((l) => l.size).sort((a, b) => a - b)[Math.floor(top.length / 2)] ?? 0;
    return max >= median * WALL_RATIO && max > 0;
  },

  /** Detect a large resting bid within top levels (buy wall / support). */
  nearbyBidWall(book: NormalizedOrderBook | null): boolean {
    if (!LiveBookCoach.hasBook(book)) return false;
    const top = book.bids.slice(0, 8);
    const max = Math.max(...top.map((l) => l.size), 0);
    const median = top.map((l) => l.size).sort((a, b) => a - b)[Math.floor(top.length / 2)] ?? 0;
    return max >= median * WALL_RATIO && max > 0;
  },

  /** PHASE 3/6 — classify today's book for trading decisions. */
  tradeEnvironment(book: NormalizedOrderBook | null): TradeEnvironment {
    if (!LiveBookCoach.hasBook(book)) return "caution";
    const spread = LiveBookCoach.spread(book);
    const liq = LiveBookCoach.liquidity(book);
    const thin = liq.state === "warn";
    if (spread.state === "danger" || thin) return "avoid";
    if (spread.state === "good" && !thin) return "good";
    return "caution";
  },

  /** PHASE 8 — read today's book as an operator would. */
  todayReadout(book: NormalizedOrderBook | null): string {
    if (!LiveBookCoach.hasBook(book)) return "Book still loading — wait before using it to decide.";
    const env = LiveBookCoach.tradeEnvironment(book);
    const spread = LiveBookCoach.spread(book);
    const imb = LiveBookCoach.imbalance(book);
    const wallNote = LiveBookCoach.nearbyAskWall(book)
      ? " There's a sell wall above — buying into it may stall."
      : LiveBookCoach.nearbyBidWall(book)
        ? " Bid support below is holding."
        : "";
    const envWord = env === "good" ? "favorable" : env === "avoid" ? "unstable" : "mixed";
    return `Today's book looks ${envWord}. ${spread.line} ${imb.line}${wallNote}`;
  },

  /** PHASE 5 — structured cause → effect → decision. */
  buyersLeftScenario(): CauseEffectDecision {
    return {
      happened: "Buy liquidity disappeared near the top of the book.",
      whyItMatters: "Support weakens — fewer buyers are willing to hold price.",
      tradersNotice: "Bid sizes shrinking and depth pulling away.",
      tradersDo: "Be cautious entering long; wait for buyers to return or use smaller size.",
    };
  },

  spreadWidenedScenario(): CauseEffectDecision {
    return {
      happened: "The spread widened.",
      whyItMatters: "Crossing the book costs more — entries and exits are pricier.",
      tradersNotice: "The gap between best bid and best ask grew.",
      tradersDo: "Avoid market orders; use limits or wait for spread to tighten.",
    };
  },

  /** PHASE 7 — buy-side pre-trade check judged on live state. */
  preTradeBuyCheck(book: NormalizedOrderBook | null): PreTradeItem[] {
    const spread = LiveBookCoach.spread(book);
    const liq = LiveBookCoach.liquidity(book);
    const askWall = LiveBookCoach.nearbyAskWall(book);
    return [
      {
        id: "spread-buy",
        label: "Spread reasonable",
        state: spread.state === "danger" ? "warn" : spread.state,
        note: spread.line,
      },
      {
        id: "liquidity-buy",
        label: "Liquidity healthy",
        state: liq.state,
        note: liq.line,
      },
      {
        id: "sell-wall",
        label: "No major sell wall nearby",
        state: askWall ? "warn" : "good",
        note: askWall
          ? "A large ask is resting above — price may struggle to push through."
          : "No obvious sell wall in the top levels.",
      },
    ];
  },

  /** PHASE 7 — sell-side pre-trade check judged on live state. */
  preTradeSellCheck(book: NormalizedOrderBook | null): PreTradeItem[] {
    const spread = LiveBookCoach.spread(book);
    const liq = LiveBookCoach.liquidity(book);
    const bidWall = LiveBookCoach.nearbyBidWall(book);
    return [
      {
        id: "bid-support",
        label: "Bid support visible",
        state: bidWall ? "good" : liq.state === "warn" ? "warn" : "neutral",
        note: bidWall
          ? "Resting bids below are providing support."
          : "Support looks normal — no standout bid wall.",
      },
      {
        id: "spread-sell",
        label: "Spread acceptable",
        state: spread.state === "danger" ? "warn" : spread.state,
        note: spread.line,
      },
      {
        id: "liquidity-sell",
        label: "Liquidity sufficient",
        state: liq.state,
        note: liq.line,
      },
    ];
  },

  /** PHASE 9 — what to check before placing a trade, judged on live state. */
  preTradeChecklist(book: NormalizedOrderBook | null): PreTradeItem[] {
    return [
      ...LiveBookCoach.preTradeBuyCheck(book).slice(0, 2),
      ...LiveBookCoach.preTradeSellCheck(book).slice(1, 2),
      {
        id: "environment",
        label: "Overall environment",
        state:
          LiveBookCoach.tradeEnvironment(book) === "good"
            ? "good"
            : LiveBookCoach.tradeEnvironment(book) === "avoid"
              ? "danger"
              : "warn",
        note: LiveBookCoach.todayReadout(book),
      },
    ];
  },
};
