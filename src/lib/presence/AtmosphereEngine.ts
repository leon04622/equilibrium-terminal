import type { NormalizedCandle, NormalizedOrderBook, NormalizedTrade } from "@/types/terminal-schema";
import type {
  ExecutionMarker,
  LiquidationZone,
  LiquidityBand,
  MarketRegime,
  MarketStressGauge,
  TacticalOverlayFrame,
} from "@/types/market-atmosphere";

export interface AtmosphereInputs {
  coin: string;
  book: NormalizedOrderBook | null;
  trades: NormalizedTrade[];
  candles: NormalizedCandle[];
  overlayVersion: number;
}

function derivePriceBounds(
  mid: number | null,
  candles: NormalizedCandle[],
  book: NormalizedOrderBook | null,
): { min: number; max: number } {
  let min = mid ?? 0;
  let max = mid ?? 1;

  for (const c of candles.slice(-80)) {
    if (c.low < min || min === 0) min = c.low;
    if (c.high > max) max = c.high;
  }

  if (book) {
    const bidPrices = book.bids.map((l) => l.price);
    const askPrices = book.asks.map((l) => l.price);
    if (bidPrices.length) min = Math.min(min, ...bidPrices.slice(0, 12));
    if (askPrices.length) max = Math.max(max, ...askPrices.slice(0, 12));
  }

  if (mid !== null) {
    const pad = mid * 0.018;
    min = Math.min(min, mid - pad);
    max = Math.max(max, mid + pad);
  }

  if (max <= min) max = min + 1;
  return { min, max };
}

function buildLiquidityBands(book: NormalizedOrderBook | null): LiquidityBand[] {
  if (!book) return [];
  const bands: LiquidityBand[] = [];
  const levels = 14;
  for (let i = 0; i < levels; i++) {
    const bid = book.bids[i];
    const ask = book.asks[i];
    if (!bid && !ask) continue;
    const price = bid?.price ?? ask?.price ?? 0;
    const bidDepth = bid?.size ?? 0;
    const askDepth = ask?.size ?? 0;
    const maxSide = Math.max(book.maxBidSize, book.maxAskSize, 1e-9);
    const intensity = Math.min(
      1,
      (bidDepth + askDepth) / maxSide,
    );
    bands.push({ price, bidDepth, askDepth, intensity });
  }
  return bands;
}

function buildLiquidationZones(
  mid: number | null,
  trades: NormalizedTrade[],
  candles: NormalizedCandle[],
): LiquidationZone[] {
  if (mid === null) return [];
  const zones: LiquidationZone[] = [];
  const sellCluster = trades
    .filter((t) => t.side === "sell" && t.notionalUsd >= 25_000)
    .slice(0, 8);
  const buyCluster = trades
    .filter((t) => t.side === "buy" && t.notionalUsd >= 25_000)
    .slice(0, 8);

  if (sellCluster.length >= 2) {
    const px = sellCluster.reduce((s, t) => s + t.price, 0) / sellCluster.length;
    const notional = sellCluster.reduce((s, t) => s + t.notionalUsd, 0);
    zones.push({
      priceLow: px * 0.998,
      priceHigh: px * 1.002,
      notionalUsd: notional,
      side: "long",
    });
  }

  if (buyCluster.length >= 2) {
    const px = buyCluster.reduce((s, t) => s + t.price, 0) / buyCluster.length;
    const notional = buyCluster.reduce((s, t) => s + t.notionalUsd, 0);
    zones.push({
      priceLow: px * 0.998,
      priceHigh: px * 1.002,
      notionalUsd: notional,
      side: "short",
    });
  }

  const last = candles[candles.length - 1];
  if (last) {
    const wickDown = last.low;
    const wickUp = last.high;
    zones.push({
      priceLow: wickDown,
      priceHigh: wickDown + mid * 0.0015,
      notionalUsd: last.volume * last.close * 0.15,
      side: "long",
    });
    zones.push({
      priceLow: wickUp - mid * 0.0015,
      priceHigh: wickUp,
      notionalUsd: last.volume * last.close * 0.12,
      side: "short",
    });
  }

  return zones.slice(0, 6);
}

function buildExecutionMarkers(trades: NormalizedTrade[]): ExecutionMarker[] {
  return trades.slice(0, 24).map((t) => ({
    price: t.price,
    size: t.size,
    side: t.side,
    notionalUsd: t.notionalUsd,
    timestamp: t.time,
  }));
}

export function computeStressGauge(
  book: NormalizedOrderBook | null,
  trades: NormalizedTrade[],
): MarketStressGauge {
  const now = Date.now();
  let bookImbalance = 0;
  let spreadBps = 0;

  if (book && book.bids.length && book.asks.length) {
    const bidVol = book.bids.slice(0, 8).reduce((s, l) => s + l.size, 0);
    const askVol = book.asks.slice(0, 8).reduce((s, l) => s + l.size, 0);
    const total = bidVol + askVol || 1;
    bookImbalance = (bidVol - askVol) / total;
    spreadBps = book.spreadBps ?? 0;
  }

  const recent = trades.filter((t) => now - t.time < 30_000);
  const notional = recent.reduce((s, t) => s + t.notionalUsd, 0);
  const velocityRatio = Math.min(3.5, 0.6 + notional / 250_000);

  const score = Math.min(
    100,
    Math.round(
      Math.abs(bookImbalance) * 28 +
        Math.min(spreadBps * 2.2, 35) +
        velocityRatio * 18,
    ),
  );

  return {
    score,
    bookImbalance,
    velocityRatio,
    spreadBps,
    updatedAt: now,
  };
}

export function inferRegime(
  stress: MarketStressGauge,
  bookImbalance: number,
): MarketRegime {
  if (stress.score >= 78 && stress.velocityRatio >= 2) return "liquidation";
  if (stress.spreadBps < 1.5 && stress.velocityRatio < 1.1) return "compression";
  if (bookImbalance > 0.22) return "risk-on";
  if (bookImbalance < -0.22) return "risk-off";
  return "neutral";
}

export function buildOverlayFrame(input: AtmosphereInputs): TacticalOverlayFrame {
  const mid = input.book?.mid ?? null;
  const { min, max } = derivePriceBounds(mid, input.candles, input.book);

  return {
    coin: input.coin,
    mid,
    priceMin: min,
    priceMax: max,
    liquidityBands: buildLiquidityBands(input.book),
    liquidationZones: buildLiquidationZones(mid, input.trades, input.candles),
    executionMarkers: buildExecutionMarkers(input.trades),
    version: input.overlayVersion + 1,
    updatedAt: Date.now(),
  };
}
