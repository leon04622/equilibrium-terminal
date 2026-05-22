import { processWsBook } from "@/lib/orderbook";
import { WHALE_NOTIONAL_USD } from "@/lib/hyperliquid/constants";
import type { HlClearinghouseState } from "@/types/account";
import type { WsBook, WsTrade } from "@/types/hyperliquid";
import type {
  IntelligenceItem,
  NormalizedCandle,
  NormalizedMidSnapshot,
  NormalizedOrderBook,
  NormalizedPosition,
  NormalizedTrade,
  NormalizedWebData,
} from "@/types/terminal-schema";

export function normalizeL2Book(raw: WsBook): NormalizedOrderBook {
  const processed = processWsBook(raw);
  return {
    coin: processed.coin,
    time: processed.time,
    bids: processed.bids,
    asks: processed.asks,
    bestBid: processed.bestBid,
    bestAsk: processed.bestAsk,
    mid: processed.mid,
    spread: processed.spread,
    spreadBps: processed.spreadBps,
    maxBidSize: processed.maxBidSize,
    maxAskSize: processed.maxAskSize,
  };
}

export function normalizeTrade(raw: WsTrade): NormalizedTrade {
  const price = parseFloat(raw.px);
  const size = parseFloat(raw.sz);
  return {
    id: `${raw.tid}-${raw.time}`,
    coin: raw.coin,
    side: raw.side === "B" ? "buy" : "sell",
    price,
    size,
    notionalUsd: price * size,
    time: raw.time,
    tid: raw.tid,
  };
}

export function normalizeTradesBatch(raw: WsTrade[]): NormalizedTrade[] {
  return raw.map(normalizeTrade);
}

export function normalizeCandle(raw: {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}): NormalizedCandle {
  return {
    time: Math.floor(raw.t / 1000),
    open: raw.o,
    high: raw.h,
    low: raw.l,
    close: raw.c,
    volume: raw.v,
  };
}

export function normalizeCandlesBatch(
  raw: Array<{ t: number; o: number; h: number; l: number; c: number; v: number }>,
): NormalizedCandle[] {
  return raw.map(normalizeCandle);
}

export function normalizeAllMids(mids: Record<string, string>): NormalizedMidSnapshot {
  const parsed: Record<string, number> = {};
  for (const [coin, px] of Object.entries(mids)) {
    const n = parseFloat(px);
    if (Number.isFinite(n)) parsed[coin] = n;
  }
  return { mids: parsed, updatedAt: Date.now() };
}

export async function normalizeClearinghouseToWebData(
  state: HlClearinghouseState,
  user: string | null,
  mids: Record<string, number>,
  resolveAssetIndex: (coin: string) => Promise<number>,
): Promise<NormalizedWebData> {
  const positions: NormalizedPosition[] = [];
  for (const ap of state.assetPositions) {
    const p = ap.position;
    const size = parseFloat(p.szi);
    if (Math.abs(size) < 1e-12) continue;
    let assetIndex = 0;
    try {
      assetIndex = await resolveAssetIndex(p.coin);
    } catch {
      continue;
    }
    const mark = mids[p.coin] ?? parseFloat(p.positionValue) / Math.abs(size);
    positions.push({
      id: p.coin,
      coin: p.coin,
      assetIndex,
      size,
      entryPrice: parseFloat(p.entryPx),
      markPrice: mark,
      unrealizedPnl: parseFloat(p.unrealizedPnl),
      marginType: p.leverage.type === "cross" ? "Cross" : "Isolated",
      leverage: p.leverage.value,
      pnlFlash: null,
    });
  }

  return {
    user,
    margin: {
      accountValue: parseFloat(state.marginSummary.accountValue),
      withdrawable: parseFloat(state.withdrawable),
      totalMarginUsed: parseFloat(state.marginSummary.totalMarginUsed),
      totalNtlPos: parseFloat(state.marginSummary.totalNtlPos),
    },
    positions,
    updatedAt: Date.now(),
  };
}

export function tradeToIntelligence(
  trade: NormalizedTrade,
  thresholdUsd = WHALE_NOTIONAL_USD,
): IntelligenceItem | null {
  if (trade.notionalUsd < thresholdUsd) return null;
  return {
    id: `whale-${trade.id}`,
    coin: trade.coin,
    channel: "on-chain",
    title: `${trade.side === "buy" ? "Whale buy" : "Whale sell"} · $${Math.round(trade.notionalUsd).toLocaleString()}`,
    detail: `${trade.size} @ ${trade.price}`,
    severity: trade.notionalUsd >= thresholdUsd * 3 ? "critical" : "watch",
    notionalUsd: trade.notionalUsd,
    timestamp: trade.time,
  };
}
