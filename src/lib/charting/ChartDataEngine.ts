import type { NormalizedCandle, NormalizedTrade } from "@/types/terminal-schema";
import type { ChartTimeframe } from "@/types/chart-analytics";
import { chartTimeframeToHlInterval, hlIntervalSeconds } from "@/lib/hyperliquid/candles";

const MAX_BARS = 800;
const TF_SECONDS: Partial<Record<ChartTimeframe, number>> = {
  "1s": 1,
};

export class ChartDataEngine {
  static timeframeSeconds(tf: ChartTimeframe): number {
    const interval = chartTimeframeToHlInterval(tf);
    if (interval) {
      const sec = hlIntervalSeconds(interval);
      if (sec != null) return sec;
    }
    return TF_SECONDS[tf] ?? 60;
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
    const bucketSec = ChartDataEngine.timeframeSeconds(tf);
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

  /** True when candle open times sit on Hyperliquid bucket boundaries for the TF. */
  static candlesAlignToTimeframe(
    candles: NormalizedCandle[],
    tf: ChartTimeframe,
  ): boolean {
    if (candles.length === 0) return true;
    if (tf === "1M" || tf === "1w" || tf === "3d") return true;
    const step = ChartDataEngine.timeframeSeconds(tf);
    return candles.every((c) => c.time % step === 0);
  }

  static filterForTimeframe(
    candles: NormalizedCandle[],
    tf: ChartTimeframe,
  ): NormalizedCandle[] {
    if (tf === "1M" || tf === "1w" || tf === "3d") return candles;
    const step = ChartDataEngine.timeframeSeconds(tf);
    return candles.filter((c) => c.time % step === 0);
  }

  /** Merge only the live tail — never overwrite sealed HL history with a WS snapshot. */
  static mergeLiveTail(
    history: NormalizedCandle[],
    live: NormalizedCandle[],
    tf: ChartTimeframe,
  ): NormalizedCandle[] {
    if (live.length === 0 || history.length === 0) return history;
    const step = ChartDataEngine.timeframeSeconds(tf);
    const lastHistTime = history[history.length - 1]!.time;
    const tailStart = lastHistTime - step;
    const tailUpdates = live.filter((c) => c.time >= tailStart);
    if (tailUpdates.length === 0) return history;
    return ChartDataEngine.mergeCandles(history, tailUpdates);
  }
}
