import type {
  OrderBookLevel,
  ProcessedBook,
  WsBook,
  WsLevel,
} from "@/types/hyperliquid";

const DEFAULT_DEPTH = 25;

function parseLevels(
  levels: WsLevel[],
  ascending: boolean,
  depth: number,
): OrderBookLevel[] {
  const parsed = levels
    .map((l) => ({
      price: parseFloat(l.px),
      size: parseFloat(l.sz),
      orders: l.n,
    }))
    .filter((l) => l.price > 0 && l.size > 0);

  parsed.sort((a, b) => (ascending ? a.price - b.price : b.price - a.price));

  let cumulative = 0;
  const sliced = parsed.slice(0, depth);
  return sliced.map((l) => {
    cumulative += l.size;
    return { ...l, cumulative };
  });
}

export function processWsBook(
  book: WsBook,
  depth = DEFAULT_DEPTH,
): ProcessedBook {
  const [rawBids, rawAsks] = book.levels;
  const bids = parseLevels(rawBids ?? [], false, depth);
  const asks = parseLevels(rawAsks ?? [], true, depth);

  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const mid =
    bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : null;
  const spread =
    bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;
  const spreadBps =
    mid !== null && spread !== null && mid > 0
      ? (spread / mid) * 10_000
      : null;

  const maxBidSize = Math.max(...bids.map((b) => b.size), 0);
  const maxAskSize = Math.max(...asks.map((a) => a.size), 0);

  return {
    coin: book.coin,
    time: book.time,
    bids,
    asks,
    bestBid,
    bestAsk,
    mid,
    spread,
    spreadBps,
    maxBidSize,
    maxAskSize,
  };
}
