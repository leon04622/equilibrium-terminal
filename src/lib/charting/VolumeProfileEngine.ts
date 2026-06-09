import type { NormalizedCandle, NormalizedTrade } from "@/types/terminal-schema";
import type { FlowAnalytics, VolumeProfileRow } from "@/types/chart-analytics";

export class VolumeProfileEngine {
  static profileFromCandles(candles: NormalizedCandle[], rows = 24): VolumeProfileRow[] {
    if (candles.length === 0) return [];
    let min = Infinity;
    let max = -Infinity;
    for (const c of candles) {
      min = Math.min(min, c.low);
      max = Math.max(max, c.high);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [];

    const step = (max - min) / rows;
    const buckets: VolumeProfileRow[] = Array.from({ length: rows }, (_, i) => ({
      price: min + step * (i + 0.5),
      bidVolume: 0,
      askVolume: 0,
      totalVolume: 0,
    }));

    for (const c of candles) {
      const idx = Math.min(rows - 1, Math.max(0, Math.floor((c.close - min) / step)));
      buckets[idx].totalVolume += c.volume;
      if (c.close >= c.open) buckets[idx].bidVolume += c.volume;
      else buckets[idx].askVolume += c.volume;
    }

    return buckets;
  }

  static flowFromTrades(trades: NormalizedTrade[]): FlowAnalytics {
    let buyVolume = 0;
    let sellVolume = 0;
    for (const t of trades.slice(0, 200)) {
      if (t.side === "buy") buyVolume += t.size;
      else sellVolume += t.size;
    }
    const total = buyVolume + sellVolume;
    const cumulativeDelta = buyVolume - sellVolume;
    const aggressorImbalancePct =
      total > 0 ? ((buyVolume - sellVolume) / total) * 100 : 0;
    const absorptionScore = Math.min(100, Math.round(total * 10));

    return {
      cumulativeDelta,
      buyVolume,
      sellVolume,
      aggressorImbalancePct,
      absorptionScore,
      updatedAt: Date.now(),
    };
  }
}
