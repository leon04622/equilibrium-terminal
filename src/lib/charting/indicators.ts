import type { NormalizedCandle } from "@/types/terminal-schema";
import type { UTCTimestamp } from "lightweight-charts";

export interface IndicatorPoint {
  time: UTCTimestamp;
  value: number;
}

/** Exponential moving average over close prices. */
export function computeEma(candles: NormalizedCandle[], period: number): IndicatorPoint[] {
  if (candles.length < period || period < 1) return [];

  const k = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  const out: IndicatorPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    if (i === period - 1) {
      out.push({ time: candles[i]!.time as UTCTimestamp, value: ema });
      continue;
    }
    ema = candles[i]!.close * k + ema * (1 - k);
    out.push({ time: candles[i]!.time as UTCTimestamp, value: ema });
  }

  return out;
}

/** Session VWAP from typical price × volume. */
export function computeVwap(candles: NormalizedCandle[]): IndicatorPoint[] {
  if (!candles.length) return [];

  let cumVol = 0;
  let cumTpVol = 0;
  const out: IndicatorPoint[] = [];

  for (const c of candles) {
    const tp = (c.high + c.low + c.close) / 3;
    cumVol += c.volume;
    cumTpVol += tp * c.volume;
    if (cumVol > 0) {
      out.push({ time: c.time as UTCTimestamp, value: cumTpVol / cumVol });
    }
  }

  return out;
}
