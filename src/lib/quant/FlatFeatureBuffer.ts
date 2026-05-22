import type { FeatureKind, MarketFeature, MarketRegime } from "@/types/quant-research";

/** Memory-aligned feature vector — 7 slots per coin row. */
export const FEATURE_SLOT_COUNT = 7;

export const FEATURE_SLOT_INDEX: Record<FeatureKind, number> = {
  book_imbalance: 0,
  funding_velocity: 1,
  liquidation_velocity: 2,
  trade_flow_imbalance: 3,
  spread_pressure: 4,
  oi_proxy_delta: 5,
  volatility_surface: 6,
};

export const SLOT_TO_KIND: FeatureKind[] = [
  "book_imbalance",
  "funding_velocity",
  "liquidation_velocity",
  "trade_flow_imbalance",
  "spread_pressure",
  "oi_proxy_delta",
  "volatility_surface",
];

export class FlatFeatureBuffer {
  private readonly capacity: number;
  private readonly data: Float64Array;
  private readonly coinIndex = new Map<string, number>();
  private readonly regimes: MarketRegime[] = [];
  private readonly timestampsNs: Float64Array;
  private rowCount = 0;

  constructor(maxCoins = 64) {
    this.capacity = maxCoins;
    this.data = new Float64Array(maxCoins * FEATURE_SLOT_COUNT);
    this.timestampsNs = new Float64Array(maxCoins);
  }

  getRowCount(): number {
    return this.rowCount;
  }

  getOrAllocateRow(coin: string): number {
    const existing = this.coinIndex.get(coin);
    if (existing !== undefined) return existing;
    if (this.rowCount >= this.capacity) {
      return this.capacity - 1;
    }
    const idx = this.rowCount;
    this.coinIndex.set(coin, idx);
    this.rowCount += 1;
    return idx;
  }

  writeRow(
    coin: string,
    values: Float64Array,
    computedAtNs: number,
    regime: MarketRegime,
  ): void {
    const row = this.getOrAllocateRow(coin);
    const offset = row * FEATURE_SLOT_COUNT;
    for (let i = 0; i < FEATURE_SLOT_COUNT; i += 1) {
      this.data[offset + i] = values[i] ?? 0;
    }
    this.timestampsNs[row] = computedAtNs;
    this.regimes[row] = regime;
  }

  readRow(coin: string): Float64Array | null {
    const row = this.coinIndex.get(coin);
    if (row === undefined) return null;
    const offset = row * FEATURE_SLOT_COUNT;
    return this.data.subarray(offset, offset + FEATURE_SLOT_COUNT);
  }

  toMarketFeatures(coin: string, computedAtNs: number, regime: MarketRegime): MarketFeature[] {
    const row = this.coinIndex.get(coin);
    if (row === undefined) return [];
    const offset = row * FEATURE_SLOT_COUNT;
    const features: MarketFeature[] = [];
    for (let i = 0; i < FEATURE_SLOT_COUNT; i += 1) {
      const value = this.data[offset + i];
      const kind = SLOT_TO_KIND[i];
      const zScore = zScoreFromValue(value, kind);
      features.push({
        id: `feat-${coin}-${kind}-${computedAtNs}`,
        coin,
        kind,
        computedAtNs,
        value,
        zScore,
        regime,
        matrixIndex: i,
        meta: { slot: i },
      });
    }
    return features;
  }
}

function zScoreFromValue(value: number, kind: FeatureKind): number {
  const scale =
    kind === "spread_pressure"
      ? 4
      : kind === "volatility_surface"
        ? 3
        : kind === "funding_velocity"
          ? 5000
          : 1.5;
  return Math.max(-4, Math.min(4, value * scale));
}

export function nowNs(): number {
  if (typeof performance !== "undefined" && performance.now) {
    return Math.round(performance.timeOrigin * 1e6 + performance.now() * 1e6);
  }
  return Date.now() * 1_000_000;
}
