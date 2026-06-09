import type { GlossaryTerm } from "@/types/education";

/**
 * PHASE 1 — Glossary Engine.
 * Central, plain-English source of truth for every market term the terminal
 * exposes. Every entry expands shorthand into: what it means, the professional
 * definition, why it matters, what to check next, and the beginner mistake.
 */
function t(
  id: string,
  term: string,
  aliases: string[],
  simple: string,
  professional: string,
  whyItMatters: string,
  checkNext: string,
  beginnerMistake: string,
  relatedPanels: string[],
): GlossaryTerm {
  return {
    id,
    term,
    aliases: [term.toLowerCase(), ...aliases.map((a) => a.toLowerCase())],
    simple,
    professional,
    whyItMatters,
    checkNext,
    beginnerMistake,
    relatedPanels,
  };
}

const TERMS: GlossaryTerm[] = [
  t(
    "spread",
    "Spread",
    ["bid-ask spread", "spread widening", "spread compression", "wide spread", "tight spread"],
    "The gap between the highest price buyers will pay and the lowest price sellers will accept.",
    "The bid-ask difference, usually quoted in basis points; the instantaneous cost of crossing the book.",
    "A wider gap means it costs more to enter or exit right away. A tight gap means trading is cheap and the market is healthy.",
    "Look at the order book to see if the gap is growing and whether resting size is thinning.",
    "Sending a market order into a wide spread and paying far more than expected.",
    ["hyperbook", "domladder", "slippageradar"],
  ),
  t(
    "bid",
    "Bid",
    ["bids", "best bid", "bid side"],
    "An offer to buy at a specific price. Bids sit below the current price waiting to be filled.",
    "Resting buy-side limit orders; the demand side of the book.",
    "Stacked bids show buyers willing to defend lower prices, which can slow a fall.",
    "Watch whether bids stay put or disappear when sellers hit them.",
    "Assuming price is safe just because bids are showing — they can be pulled instantly.",
    ["hyperbook", "domladder"],
  ),
  t(
    "ask",
    "Ask",
    ["asks", "offer", "best ask", "ask side", "offers"],
    "An offer to sell at a specific price. Asks sit above the current price waiting to be filled.",
    "Resting sell-side limit orders; the supply side of the book.",
    "Thick asks act as a ceiling; price often struggles to push through heavy selling.",
    "See whether asks get absorbed by buyers or keep reloading above price.",
    "Chasing price up into a wall of asks and getting filled at the worst level.",
    ["hyperbook", "domladder"],
  ),
  t(
    "liquidity",
    "Liquidity",
    ["liquid", "illiquid", "liquidity pull", "liquidity pulled", "thin liquidity", "liquidity vacuum"],
    "How much size is resting in the market ready to trade. More liquidity means you can trade larger without moving price much.",
    "Available resting depth across price levels; determines market impact and fillability.",
    "When liquidity disappears, price can move much faster and fills get worse.",
    "Check book depth on both sides and whether large orders are staying or vanishing.",
    "Trading large size into thin liquidity and causing your own bad fill.",
    ["hyperbook", "domladder", "slippageradar"],
  ),
  t(
    "orderbook",
    "Order Book",
    ["order book", "book", "the book", "depth of market", "dom"],
    "A live list of all buy and sell orders waiting at each price. It shows where people want to trade.",
    "The aggregated limit order ladder showing resting demand and supply by price.",
    "It reveals where support and resistance actually sit, before price gets there.",
    "Read both sides: where size is stacked, and where it is thin or missing.",
    "Only watching price and ignoring the book that drives it.",
    ["hyperbook", "domladder"],
  ),
  t(
    "marketorder",
    "Market Order",
    ["market order", "market buy", "market sell", "taker order"],
    "An order to buy or sell immediately at whatever price is available right now.",
    "A taker order that crosses the spread and consumes resting liquidity until filled.",
    "It guarantees you trade, but not the price — in thin markets you can pay a lot more.",
    "Before sending one, check the spread and depth so you know the likely cost.",
    "Using market orders in fast or thin conditions and getting badly slipped.",
    ["ticket", "hyperbook", "slippageradar"],
  ),
  t(
    "limitorder",
    "Limit Order",
    ["limit order", "limit buy", "limit sell", "maker order", "resting limit"],
    "An order to buy or sell only at a price you choose or better. It waits until the market reaches it.",
    "A maker order that rests in the book and provides liquidity; fills at the limit or better.",
    "It controls your price and avoids slippage, but it might not fill at all.",
    "Decide whether getting filled matters more than getting your exact price.",
    "Placing a limit far from price and assuming the trade is done when it never fills.",
    ["ticket", "hyperbook"],
  ),
  t(
    "slippage",
    "Slippage",
    ["slip", "slipped", "slippage bias", "price slippage"],
    "The difference between the price you expected and the price you actually got.",
    "Realized execution cost versus reference price, driven by spread and depth consumption.",
    "High slippage quietly eats profits, especially on larger or rushed orders.",
    "Check the slippage radar and book depth before sending size.",
    "Ignoring slippage on small trades until it compounds into real losses.",
    ["slippageradar", "hyperbook", "ticket"],
  ),
  t(
    "funding",
    "Funding",
    ["funding rate", "funding flip", "funding turning positive", "funding turning negative", "positive funding", "negative funding"],
    "A regular payment between long and short traders on perpetual futures. It keeps the contract price near the real price.",
    "The periodic perp funding rate; positive means longs pay shorts, negative means shorts pay longs.",
    "Extreme funding shows one side is crowded and paying to stay in — fuel for a sharp reversal.",
    "Compare funding direction with open interest to judge how crowded the trade is.",
    "Treating high funding as a trend signal instead of a crowding warning.",
    ["derivdesk", "alerts"],
  ),
  t(
    "openinterest",
    "Open Interest",
    ["open interest", "oi", "rising oi", "falling oi"],
    "The total number of futures contracts currently open. It shows how much money is committed.",
    "Total outstanding derivative contracts; rising OI = new positioning, falling OI = unwinding.",
    "Rising open interest into extreme funding means crowded, fragile positioning.",
    "Watch whether OI is building into a move or unwinding out of one.",
    "Confusing more open interest with bullishness — it just means more positions exist.",
    ["derivdesk"],
  ),
  t(
    "volatility",
    "Volatility",
    ["vol", "volatility expansion", "volatility compression", "vol expansion", "expanding volatility"],
    "How fast and how far price is moving. High volatility means big, quick swings.",
    "The magnitude of price variation over time; expansion = energy release, compression = coiling.",
    "Faster moves hit stops more easily and make execution riskier.",
    "Check whether volatility is rising with healthy or unstable book conditions.",
    "Adding size right as volatility expands and getting shaken out.",
    ["chart", "surveillance", "memorydesk"],
  ),
  t(
    "liquidation",
    "Liquidation",
    ["liquidations", "liquidated", "liquidation cascade", "forced selling"],
    "When a leveraged trader runs out of margin, the exchange force-closes their position.",
    "Forced position closure when margin is exhausted; cascades amplify directional moves.",
    "Cascades can push price violently as forced orders hit the book all at once.",
    "Map nearby liquidation levels and watch for clusters before they trigger.",
    "Standing in front of a cascade expecting a bounce too early.",
    ["derivdesk", "alerts", "surveillance"],
  ),
  t(
    "leverage",
    "Leverage",
    ["leveraged", "high leverage", "margin", "10x", "20x"],
    "Borrowing to trade a position larger than your cash. It magnifies both gains and losses.",
    "The ratio of position size to posted margin; raises liquidation sensitivity.",
    "More leverage means a smaller move can wipe out the position.",
    "Check how close your liquidation price is before adding leverage.",
    "Using high leverage in volatile conditions and getting liquidated on noise.",
    ["positions", "portfoliodesk", "derivdesk"],
  ),
  t(
    "depth",
    "Depth",
    ["book depth", "market depth", "deep book", "shallow book"],
    "How much size is stacked across all the price levels in the order book.",
    "Cumulative resting volume by distance from mid; governs how much you can trade before moving price.",
    "Deep books absorb large orders; shallow books move fast on small flow.",
    "Look at how far you'd have to walk the book to fill your intended size.",
    "Sizing a trade as if the book is deep when only the top level has size.",
    ["hyperbook", "domladder"],
  ),
  t(
    "imbalance",
    "Imbalance",
    ["order imbalance", "bid imbalance", "ask imbalance", "flow imbalance"],
    "When there is clearly more buying interest than selling, or the reverse.",
    "A skew between resting/aggressive bid and ask volume signaling near-term pressure.",
    "Strong imbalance often precedes a short-term push in that direction.",
    "Confirm the imbalance with the tape — is it resting orders or real aggression?",
    "Trading every imbalance without checking if it actually leads to movement.",
    ["hyperbook", "domladder", "intelligence"],
  ),
  t(
    "absorption",
    "Absorption",
    ["absorbed", "absorbing", "absorption event"],
    "When lots of selling hits the market but price barely drops because buyers quietly soak it up.",
    "Large aggressive flow met by passive size without price give — a sign of initiative on the passive side.",
    "Absorption can mark a turning point: sellers are exhausting into a strong buyer.",
    "Watch whether price holds after the heavy flow, then look for a reaction.",
    "Mistaking absorption for weakness and selling into strong hidden buyers.",
    ["hyperbook", "intelligence"],
  ),
  t(
    "sweep",
    "Sweep",
    ["liquidity sweep", "swept", "stop hunt", "stop run"],
    "A fast move that grabs the orders sitting just beyond an obvious level, then often reverses.",
    "An aggressive run through clustered stops/liquidity, frequently followed by mean reversion.",
    "Sweeps trap traders who entered at the obvious level right before the reversal.",
    "After a sweep, check if price reclaims the level — that often confirms the trap.",
    "Entering exactly at obvious highs/lows where stops get hunted.",
    ["chart", "hyperbook", "intelligence"],
  ),
  t(
    "support",
    "Support",
    ["support level", "support zone", "buyers stepping in"],
    "A price area where buyers have repeatedly stepped in and stopped price from falling further.",
    "A demand zone where resting/responsive buying has historically halted declines.",
    "Support shows where price might bounce — and where a break signals weakness.",
    "Check if bids are actually defending the level or just hoping.",
    "Assuming support always holds; once broken it often flips to resistance.",
    ["chart", "hyperbook"],
  ),
  t(
    "resistance",
    "Resistance",
    ["resistance level", "resistance zone", "sellers stepping in", "ceiling"],
    "A price area where sellers have repeatedly stepped in and stopped price from rising further.",
    "A supply zone where responsive selling has historically capped advances.",
    "Resistance shows where rallies may stall — and where a clean break signals strength.",
    "See whether asks are reloading at the level or getting absorbed.",
    "Buying right into heavy resistance and getting stuck.",
    ["chart", "hyperbook"],
  ),
  t(
    "whaleorder",
    "Whale Order",
    ["whale", "whale order", "large order", "large resting order", "iceberg"],
    "A very large order from a big player that can move the market or act as a wall.",
    "Outsized resting or aggressive size, sometimes iceberged, that shapes near-term structure.",
    "Whales can defend levels or break them; their orders signal where big money sits.",
    "Watch whether the large order stays, reloads, or disappears (it may be a spoof).",
    "Following a big order blindly — it can be pulled to mislead.",
    ["hyperbook", "intelligence", "surveillance"],
  ),
  t(
    "restingorder",
    "Resting Order",
    ["resting order", "resting liquidity", "passive order", "large resting ask", "large resting bid"],
    "An order waiting in the book at a set price, providing liquidity until someone trades against it.",
    "A passive limit order supplying liquidity; its removal changes available depth.",
    "When a large resting order is removed, that layer of support or pressure is gone.",
    "Notice when big resting orders vanish — it can open the path for a faster move.",
    "Assuming a resting wall is permanent when it can be cancelled instantly.",
    ["hyperbook", "domladder"],
  ),
  t(
    "executionquality",
    "Execution Quality",
    ["execution quality", "execution deteriorating", "poor execution", "good execution", "fill quality"],
    "How cleanly and cheaply your order gets filled — close to the price you wanted, with low cost.",
    "A composite of spread paid, slippage, and timing relative to available liquidity.",
    "Poor execution silently erodes results even when your idea is right.",
    "Check spread and depth on the slippage radar before sending the order.",
    "Focusing only on direction and ignoring how much the entry actually cost.",
    ["slippageradar", "hyperbook", "ticket"],
  ),
];

const BY_ID = new Map(TERMS.map((x) => [x.id, x]));

/** alias → term, longest alias first so multi-word phrases win over single words. */
const ALIAS_INDEX: { alias: string; term: GlossaryTerm }[] = TERMS.flatMap((term) =>
  term.aliases.map((alias) => ({ alias, term })),
).sort((a, b) => b.alias.length - a.alias.length);

export class Glossary {
  static all(): GlossaryTerm[] {
    return TERMS;
  }

  static get(id: string): GlossaryTerm | null {
    return BY_ID.get(id) ?? null;
  }

  /** Free-text search across term names and aliases. */
  static search(query: string): GlossaryTerm[] {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter(
      (term) =>
        term.term.toLowerCase().includes(q) ||
        term.aliases.some((a) => a.includes(q)) ||
        term.simple.toLowerCase().includes(q),
    );
  }

  /** First glossary term whose alias appears in the given text. */
  static firstMatch(text: string): GlossaryTerm | null {
    const lower = text.toLowerCase();
    for (const { alias, term } of ALIAS_INDEX) {
      if (lower.includes(alias)) return term;
    }
    return null;
  }

  /** All glossary terms referenced anywhere in the text (deduped, in order). */
  static matchesIn(text: string): GlossaryTerm[] {
    const lower = text.toLowerCase();
    const seen = new Set<string>();
    const out: GlossaryTerm[] = [];
    for (const { alias, term } of ALIAS_INDEX) {
      if (!seen.has(term.id) && lower.includes(alias)) {
        seen.add(term.id);
        out.push(term);
      }
    }
    return out;
  }
}
