import type { NormalizedCandle, NormalizedTrade } from "@/types/terminal-schema";
import type { ChartTimeframe } from "@/types/chart-analytics";

const MAX_BARS = 800;
const TF_SECONDS: Record<ChartTimeframe, number> = {
  "1s": 1,
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14_400,
  "1d": 86_400,
};

export class ChartDataEngine {
  static timeframeSeconds(tf: ChartTimeframe): number {
    return TF_SECONDS[tf];
  }

  /** Viewport window for memory-efficient rendering. */
  static viewport(candles: NormalizedCandle[], maxBars = MAX_BARS): NormalizedCandle[] {
    if (candles.length <= maxBars) return candles;
    return candles.slice(-maxBars);
  }

  /** Merge incremental candle update (HL stream). */
  static mergeCandles(
    existing: NormalizedCandle[],
    incoming: NormalizedCandle[],
  ): NormalizedCandle[] {
    if (incoming.length === 0) return existing;
    const map = new Map<number, NormalizedCandle>();
    for (const c of existing) map.set(c.time, c);
    for (const c of incoming) map.set(c.time, c);
    const merged = Array.from(map.values()).sort((a, b) => a.time - b.time);
    return merged.slice(-MAX_BARS);
  }

  /** Build OHLCV bars from tape when candle WS unavailable. */
  static candlesFromTrades(
    trades: NormalizedTrade[],
    tf: ChartTimeframe,
  ): NormalizedCandle[] {
    const bucketSec = TF_SECONDS[tf];
    const buckets = new Map<number, NormalizedCandle>();

    for (const t of trades) {
      const time = Math.floor(t.time / 1000 / bucketSec) * bucketSec;
      const cur = buckets.get(time);
      if (!cur) {
        buckets.set(time, {
          time,
          open: t.price,
          high: t.price,
          low: t.price,
          close: t.price,
          volume: t.size,
        });
      } else {
        cur.high = Math.max(cur.high, t.price);
        cur.low = Math.min(cur.low, t.price);
        cur.close = t.price;
        cur.volume += t.size;
      }
    }

    return Array.from(buckets.values()).sort((a, b) => a.time - b.time).slice(-MAX_BARS);
  }

  static resolveCandles(
    hlCandles: NormalizedCandle[],
    trades: NormalizedTrade[],
    tf: ChartTimeframe,
  ): NormalizedCandle[] {
    if (hlCandles.length > 0) return ChartDataEngine.viewport(hlCandles);
    return ChartDataEngine.candlesFromTrades(trades, tf);
  }
}
