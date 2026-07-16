import type { NormalizedCandle } from "@/types/terminal-schema";
import type { UTCTimestamp } from "lightweight-charts";

export interface IndicatorPoint {
  time: UTCTimestamp;
  value: number;
}

export interface IndicatorHistogramPoint {
  time: UTCTimestamp;
  value: number;
  color?: string;
}

export interface IndicatorBandSet {
  upper: IndicatorPoint[];
  middle: IndicatorPoint[];
  lower: IndicatorPoint[];
}

export interface IndicatorLineSeries {
  key: string;
  label: string;
  data: IndicatorPoint[];
  color: string;
  lineWidth?: 1 | 2 | 3 | 4;
}

export type IndicatorSeriesSet =
  | { type: "line"; key: string; data: IndicatorPoint[]; color: string }
  | { type: "histogram"; key: string; data: IndicatorHistogramPoint[]; color: string }
  | { type: "bands"; key: string; bands: IndicatorBandSet; colors?: string[] }
  | { type: "multi"; key: string; series: IndicatorLineSeries[] }
  | { type: "dots"; key: string; data: IndicatorPoint[]; color: string }
  | {
      type: "macd";
      key: string;
      macd: IndicatorPoint[];
      signal: IndicatorPoint[];
      histogram: IndicatorHistogramPoint[];
      colors?: string[];
    };

function pushPoint(out: IndicatorPoint[], candles: NormalizedCandle[], i: number, value: number): void {
  if (Number.isFinite(value)) {
    out.push({ time: candles[i]!.time as UTCTimestamp, value });
  }
}

/** Exponential moving average over close prices. */
export function computeEma(candles: NormalizedCandle[], period: number): IndicatorPoint[] {
  if (candles.length < period || period < 1) return [];
  const k = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    if (i > period - 1) ema = candles[i]!.close * k + ema * (1 - k);
    pushPoint(out, candles, i, ema);
  }
  return out;
}

export function computeSma(candles: NormalizedCandle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  const out: IndicatorPoint[] = [];
  let sum = candles.slice(0, period).reduce((s, c) => s + c.close, 0);
  for (let i = period - 1; i < candles.length; i++) {
    if (i > period - 1) sum += candles[i]!.close - candles[i - period]!.close;
    pushPoint(out, candles, i, sum / period);
  }
  return out;
}

export function computeSmma(candles: NormalizedCandle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  let smma = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    if (i > period - 1) smma = (smma * (period - 1) + candles[i]!.close) / period;
    pushPoint(out, candles, i, smma);
  }
  return out;
}

export function computeWma(candles: NormalizedCandle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  const denom = (period * (period + 1)) / 2;
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let w = 0; w < period; w++) sum += candles[i - w]!.close * (period - w);
    pushPoint(out, candles, i, sum / denom);
  }
  return out;
}

export function computeHma(candles: NormalizedCandle[], period: number): IndicatorPoint[] {
  const half = Math.max(1, Math.floor(period / 2));
  const sqrt = Math.max(1, Math.floor(Math.sqrt(period)));
  const closes = candles.map((c) => c.close);
  const wmaHalf = wmaArray(closes, half);
  const wmaFull = wmaArray(closes, period);
  const raw: number[] = closes.map((_, i) => {
    const h = wmaHalf[i];
    const f = wmaFull[i];
    if (h == null || f == null) return NaN;
    return 2 * h - f;
  });
  const hma = wmaArray(raw, sqrt);
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (hma[i] != null) pushPoint(out, candles, i, hma[i]!);
  }
  return out;
}

function wmaArray(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  const denom = (period * (period + 1)) / 2;
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let w = 0; w < period; w++) sum += values[i - w]! * (period - w);
    out[i] = sum / denom;
  }
  return out;
}

/** Session VWAP from typical price × volume. */
export function computeVwap(candles: NormalizedCandle[]): IndicatorPoint[] {
  let cumVol = 0;
  let cumTpVol = 0;
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    const tp = (c.high + c.low + c.close) / 3;
    cumVol += c.volume;
    cumTpVol += tp * c.volume;
    if (cumVol > 0) pushPoint(out, candles, i, cumTpVol / cumVol);
  }
  return out;
}

export function computeRsi(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  if (candles.length <= period) return [];
  const out: IndicatorPoint[] = [];
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = candles[i]!.close - candles[i - 1]!.close;
    if (diff >= 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period; i < candles.length; i++) {
    const diff = candles[i]!.close - candles[i - 1]!.close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    pushPoint(out, candles, i, 100 - 100 / (1 + rs));
  }
  return out;
}

export function computeMacd(
  candles: NormalizedCandle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): {
  macd: IndicatorPoint[];
  signal: IndicatorPoint[];
  histogram: IndicatorHistogramPoint[];
  colors?: string[];
} {
  const closes = candles.map((c) => c.close);
  const emaFast = emaArray(closes, fast);
  const emaSlow = emaArray(closes, slow);
  const macdRaw: (number | null)[] = closes.map((_, i) => {
    if (emaFast[i] == null || emaSlow[i] == null) return null;
    return emaFast[i]! - emaSlow[i]!;
  });
  const signalRaw = emaArrayNullable(macdRaw, signalPeriod);
  const macd: IndicatorPoint[] = [];
  const signal: IndicatorPoint[] = [];
  const histogram: IndicatorHistogramPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (macdRaw[i] == null) continue;
    const m = macdRaw[i]!;
    pushPoint(macd, candles, i, m);
    if (signalRaw[i] != null) {
      pushPoint(signal, candles, i, signalRaw[i]!);
      const h = m - signalRaw[i]!;
      histogram.push({
        time: candles[i]!.time as UTCTimestamp,
        value: h,
        color: h >= 0 ? "#26a69a" : "#ef5350",
      });
    }
  }
  return { macd, signal, histogram, colors: ["#2962ff", "#f59e0b"] };
}

function emaArray(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (values.length < period) return out;
  let ema = values.slice(0, period).reduce((s, v) => s + v, 0) / period;
  out[period - 1] = ema;
  const k = 2 / (period + 1);
  for (let i = period; i < values.length; i++) {
    ema = values[i]! * k + ema * (1 - k);
    out[i] = ema;
  }
  return out;
}

function emaArrayNullable(values: (number | null)[], period: number): (number | null)[] {
  const nums = values.map((v) => v ?? 0);
  const mask = values.map((v) => v != null);
  const raw = emaArray(nums, period);
  return raw.map((v, i) => (mask[i] ? v : null));
}

export function computeStochastic(candles: NormalizedCandle[], period = 14): IndicatorLineSeries[] {
  const kOut: IndicatorPoint[] = [];
  const dOut: IndicatorPoint[] = [];
  const kVals: number[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const low = Math.min(...slice.map((c) => c.low));
    const high = Math.max(...slice.map((c) => c.high));
    const k = high === low ? 50 : ((candles[i]!.close - low) / (high - low)) * 100;
    kVals.push(k);
    pushPoint(kOut, candles, i, k);
  }
  for (let i = 2; i < kVals.length; i++) {
    const d = (kVals[i - 2]! + kVals[i - 1]! + kVals[i]!) / 3;
    pushPoint(dOut, candles, period - 1 + i, d);
  }
  return [
    { key: "k", label: "%K", data: kOut, color: "#5b9cf6" },
    { key: "d", label: "%D", data: dOut, color: "#f59e0b" },
  ];
}

export function computeStochRsi(candles: NormalizedCandle[], period = 14): IndicatorLineSeries[] {
  const rsi = computeRsi(candles, period);
  const rsiVals = rsi.map((p) => p.value);
  const stoch: IndicatorPoint[] = [];
  for (let i = period - 1; i < rsiVals.length; i++) {
    const slice = rsiVals.slice(i - period + 1, i + 1);
    const low = Math.min(...slice);
    const high = Math.max(...slice);
    const v = high === low ? 50 : ((rsiVals[i]! - low) / (high - low)) * 100;
    stoch.push({ time: rsi[i]!.time, value: v });
  }
  return [{ key: "stoch_rsi", label: "Stoch RSI", data: stoch, color: "#818cf8" }];
}

export function computeCci(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const tp = slice.map((c) => (c.high + c.low + c.close) / 3);
    const sma = tp.reduce((s, v) => s + v, 0) / period;
    const md = tp.reduce((s, v) => s + Math.abs(v - sma), 0) / period;
    const cur = tp[tp.length - 1]!;
    pushPoint(out, candles, i, md === 0 ? 0 : (cur - sma) / (0.015 * md));
  }
  return out;
}

export function computeCmo(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period; i < candles.length; i++) {
    let up = 0;
    let down = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = candles[j]!.close - candles[j - 1]!.close;
      if (diff > 0) up += diff;
      else down -= diff;
    }
    pushPoint(out, candles, i, up + down === 0 ? 0 : ((up - down) / (up + down)) * 100);
  }
  return out;
}

export function computeMfi(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  const tp = candles.map((c) => (c.high + c.low + c.close) / 3);
  const rmf = tp.map((t, i) => t * candles[i]!.volume);
  for (let i = period; i < candles.length; i++) {
    let pos = 0;
    let neg = 0;
    for (let j = i - period + 1; j <= i; j++) {
      if (tp[j]! > tp[j - 1]!) pos += rmf[j]!;
      else if (tp[j]! < tp[j - 1]!) neg += rmf[j]!;
    }
    const mr = neg === 0 ? 100 : pos / neg;
    pushPoint(out, candles, i, 100 - 100 / (1 + mr));
  }
  return out;
}

export function computeMomentum(candles: NormalizedCandle[], period = 10): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period; i < candles.length; i++) {
    pushPoint(out, candles, i, candles[i]!.close - candles[i - period]!.close);
  }
  return out;
}

export function computeRoc(candles: NormalizedCandle[], period = 12): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period; i < candles.length; i++) {
    const prev = candles[i - period]!.close;
    pushPoint(out, candles, i, prev === 0 ? 0 : ((candles[i]!.close - prev) / prev) * 100);
  }
  return out;
}

export function computeWilliamsR(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map((c) => c.high));
    const low = Math.min(...slice.map((c) => c.low));
    const v = high === low ? -50 : ((high - candles[i]!.close) / (high - low)) * -100;
    pushPoint(out, candles, i, v);
  }
  return out;
}

export function computeDpo(candles: NormalizedCandle[], period = 21): IndicatorPoint[] {
  const shift = Math.floor(period / 2) + 1;
  const sma = computeSma(candles, period);
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < sma.length; i++) {
    const candleIdx = i + period - 1;
    const shiftedIdx = candleIdx - shift;
    if (shiftedIdx >= 0) {
      pushPoint(out, candles, shiftedIdx, candles[shiftedIdx]!.close - sma[i]!.value);
    }
  }
  return out;
}

export function computeTrix(candles: NormalizedCandle[], period = 15): IndicatorPoint[] {
  const closes = candles.map((c) => c.close);
  const e1 = emaArray(closes, period);
  const e2 = emaArrayNullable(e1, period);
  const e3 = emaArrayNullable(e2, period);
  const out: IndicatorPoint[] = [];
  for (let i = 1; i < candles.length; i++) {
    if (e3[i] == null || e3[i - 1] == null || e3[i - 1] === 0) continue;
    pushPoint(out, candles, i, ((e3[i]! - e3[i - 1]!) / e3[i - 1]!) * 100);
  }
  return out;
}

export function computeUltimateOscillator(candles: NormalizedCandle[]): IndicatorPoint[] {
  const bp: number[] = [];
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const low = Math.min(candles[i]!.low, candles[i - 1]!.close);
    bp.push(candles[i]!.close - low);
    tr.push(Math.max(candles[i]!.high, candles[i - 1]!.close) - low);
  }
  const out: IndicatorPoint[] = [];
  const periods = [7, 14, 28];
  for (let i = 28; i < candles.length; i++) {
    let sum = 0;
    for (const p of periods) {
      const start = i - p;
      const bSum = bp.slice(start, i).reduce((s, v) => s + v, 0);
      const tSum = tr.slice(start, i).reduce((s, v) => s + v, 0);
      sum += tSum === 0 ? 0 : bSum / tSum;
    }
    pushPoint(out, candles, i, (sum / periods.length) * 100);
  }
  return out;
}

export function computeAtr(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    trs.push(
      Math.max(
        candles[i]!.high - candles[i]!.low,
        Math.abs(candles[i]!.high - candles[i - 1]!.close),
        Math.abs(candles[i]!.low - candles[i - 1]!.close),
      ),
    );
  }
  const out: IndicatorPoint[] = [];
  let atr = trs.slice(0, period).reduce((s, v) => s + v, 0) / period;
  pushPoint(out, candles, period, atr);
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]!) / period;
    pushPoint(out, candles, i + 1, atr);
  }
  return out;
}

export function computeAdx(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  const plusDm: number[] = [];
  const minusDm: number[] = [];
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const up = candles[i]!.high - candles[i - 1]!.high;
    const down = candles[i - 1]!.low - candles[i]!.low;
    plusDm.push(up > down && up > 0 ? up : 0);
    minusDm.push(down > up && down > 0 ? down : 0);
    tr.push(
      Math.max(
        candles[i]!.high - candles[i]!.low,
        Math.abs(candles[i]!.high - candles[i - 1]!.close),
        Math.abs(candles[i]!.low - candles[i - 1]!.close),
      ),
    );
  }
  const out: IndicatorPoint[] = [];
  let atr = tr.slice(0, period).reduce((s, v) => s + v, 0);
  let plus = plusDm.slice(0, period).reduce((s, v) => s + v, 0);
  let minus = minusDm.slice(0, period).reduce((s, v) => s + v, 0);
  let dxSum = 0;
  for (let i = period; i < tr.length; i++) {
    atr = atr - atr / period + tr[i]!;
    plus = plus - plus / period + plusDm[i]!;
    minus = minus - minus / period + minusDm[i]!;
    const pdi = atr === 0 ? 0 : (100 * plus) / atr;
    const mdi = atr === 0 ? 0 : (100 * minus) / atr;
    const dx = pdi + mdi === 0 ? 0 : (100 * Math.abs(pdi - mdi)) / (pdi + mdi);
    dxSum += dx;
    if (i >= period * 2 - 1) {
      const adx = dxSum / period;
      pushPoint(out, candles, i + 1, adx);
      dxSum -= dxSum / period;
    }
  }
  return out;
}

export function computeAroon(candles: NormalizedCandle[], period = 25): IndicatorLineSeries[] {
  const up: IndicatorPoint[] = [];
  const down: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    let highIdx = 0;
    let lowIdx = 0;
    for (let j = 1; j < slice.length; j++) {
      if (slice[j]!.high >= slice[highIdx]!.high) highIdx = j;
      if (slice[j]!.low <= slice[lowIdx]!.low) lowIdx = j;
    }
    pushPoint(up, candles, i, ((period - 1 - highIdx) / (period - 1)) * 100);
    pushPoint(down, candles, i, ((period - 1 - lowIdx) / (period - 1)) * 100);
  }
  return [
    { key: "aroon_up", label: "Aroon Up", data: up, color: "#3b82f6" },
    { key: "aroon_down", label: "Aroon Down", data: down, color: "#f43f5e" },
  ];
}

export function computeObv(candles: NormalizedCandle[]): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  let obv = 0;
  pushPoint(out, candles, 0, 0);
  for (let i = 1; i < candles.length; i++) {
    if (candles[i]!.close > candles[i - 1]!.close) obv += candles[i]!.volume;
    else if (candles[i]!.close < candles[i - 1]!.close) obv -= candles[i]!.volume;
    pushPoint(out, candles, i, obv);
  }
  return out;
}

export function computeAd(candles: NormalizedCandle[]): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  let ad = 0;
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    const mfm = c.high === c.low ? 0 : ((c.close - c.low) - (c.high - c.close)) / (c.high - c.low);
    ad += mfm * c.volume;
    pushPoint(out, candles, i, ad);
  }
  return out;
}

export function computeVolumeOscillator(candles: NormalizedCandle[]): IndicatorPoint[] {
  const vols = candles.map((c) => c.volume);
  const fast = emaArray(vols, 5);
  const slow = emaArray(vols, 10);
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (fast[i] == null || slow[i] == null || slow[i] === 0) continue;
    pushPoint(out, candles, i, ((fast[i]! - slow[i]!) / slow[i]!) * 100);
  }
  return out;
}

export function computeBollinger(candles: NormalizedCandle[], period = 20, stdDev = 2): IndicatorBandSet {
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, c) => s + c.close, 0) / period;
    const variance = slice.reduce((s, c) => s + (c.close - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    pushPoint(middle, candles, i, mean);
    pushPoint(upper, candles, i, mean + stdDev * std);
    pushPoint(lower, candles, i, mean - stdDev * std);
  }
  return { upper, middle, lower };
}

export function computeDonchian(candles: NormalizedCandle[], period = 20): IndicatorBandSet {
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map((c) => c.high));
    const low = Math.min(...slice.map((c) => c.low));
    pushPoint(upper, candles, i, high);
    pushPoint(lower, candles, i, low);
    pushPoint(middle, candles, i, (high + low) / 2);
  }
  return { upper, middle, lower };
}

export function computeKeltner(candles: NormalizedCandle[], period = 20): IndicatorBandSet {
  const ema = computeEma(candles, period);
  const atr = computeAtr(candles, period);
  const atrByTime = new Map(atr.map((p) => [p.time, p.value]));
  const upper: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];
  for (const m of ema) {
    const a = atrByTime.get(m.time) ?? 0;
    middle.push(m);
    upper.push({ time: m.time, value: m.value + 2 * a });
    lower.push({ time: m.time, value: m.value - 2 * a });
  }
  return { upper, middle, lower };
}

export function computeIchimoku(candles: NormalizedCandle[]): IndicatorLineSeries[] {
  const tenkan: IndicatorPoint[] = [];
  const kijun: IndicatorPoint[] = [];
  const spanA: IndicatorPoint[] = [];
  const spanB: IndicatorPoint[] = [];
  const chikou: IndicatorPoint[] = [];
  const mid = (slice: NormalizedCandle[]) => (Math.max(...slice.map((c) => c.high)) + Math.min(...slice.map((c) => c.low))) / 2;
  for (let i = 8; i < candles.length; i++) tenkan.push({ time: candles[i]!.time as UTCTimestamp, value: mid(candles.slice(i - 8, i + 1)) });
  for (let i = 25; i < candles.length; i++) kijun.push({ time: candles[i]!.time as UTCTimestamp, value: mid(candles.slice(i - 25, i + 1)) });
  const kijunByTime = new Map(kijun.map((p) => [p.time, p.value]));
  const tenkanByTime = new Map(tenkan.map((p) => [p.time, p.value]));
  for (let i = 0; i < candles.length; i++) {
    const t = candles[i]!.time as UTCTimestamp;
    const ten = tenkanByTime.get(t);
    const kij = kijunByTime.get(t);
    if (ten != null && kij != null) spanA.push({ time: t, value: (ten + kij) / 2 });
    if (i >= 51) spanB.push({ time: t, value: mid(candles.slice(i - 51, i + 1)) });
    if (i + 26 < candles.length) chikou.push({ time: candles[i + 26]!.time as UTCTimestamp, value: candles[i]!.close });
  }
  return [
    { key: "tenkan", label: "Tenkan", data: tenkan, color: "#ef4444" },
    { key: "kijun", label: "Kijun", data: kijun, color: "#22c55e" },
    { key: "span_a", label: "Span A", data: spanA, color: "#3b82f6" },
    { key: "span_b", label: "Span B", data: spanB, color: "#f59e0b" },
    { key: "chikou", label: "Chikou", data: chikou, color: "#a855f7" },
  ];
}

export function computePsar(candles: NormalizedCandle[]): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  if (candles.length < 2) return out;
  let af = 0.02;
  const maxAf = 0.2;
  let uptrend = candles[1]!.close >= candles[0]!.close;
  let ep = uptrend ? candles[0]!.high : candles[0]!.low;
  let sar = uptrend ? candles[0]!.low : candles[0]!.high;
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]!;
    const prev = candles[i - 1]!;
    sar = sar + af * (ep - sar);
    if (uptrend) {
      if (c.low < sar) {
        uptrend = false;
        sar = ep;
        ep = c.low;
        af = 0.02;
      } else {
        if (c.high > ep) {
          ep = c.high;
          af = Math.min(maxAf, af + 0.02);
        }
      }
    } else if (c.high > sar) {
      uptrend = true;
      sar = ep;
      ep = c.high;
      af = 0.02;
    } else if (c.low < ep) {
      ep = c.low;
      af = Math.min(maxAf, af + 0.02);
    }
    sar = Math.min(sar, prev.low, i > 1 ? candles[i - 2]!.low : prev.low);
    if (!uptrend) sar = Math.max(sar, prev.high, i > 1 ? candles[i - 2]!.high : prev.high);
    pushPoint(out, candles, i, sar);
  }
  return out;
}

export function computeSupertrend(candles: NormalizedCandle[], period = 10): IndicatorPoint[] {
  const atr = computeAtr(candles, period);
  const atrMap = new Map(atr.map((p) => [p.time, p.value]));
  const out: IndicatorPoint[] = [];
  let trend = 1;
  let st = candles[0]!.close;
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    const a = atrMap.get(c.time as UTCTimestamp) ?? 0;
    const hl2 = (c.high + c.low) / 2;
    const upper = hl2 + 3 * a;
    const lower = hl2 - 3 * a;
    if (c.close > st) trend = 1;
    else if (c.close < st) trend = -1;
    st = trend === 1 ? lower : upper;
    pushPoint(out, candles, i, st);
  }
  return out;
}

export function computeW52HighLow(candles: NormalizedCandle[], bars = 252): IndicatorLineSeries[] {
  const lookback = Math.min(Math.max(10, bars), candles.length);
  const high: IndicatorPoint[] = [];
  const low: IndicatorPoint[] = [];
  for (let i = lookback - 1; i < candles.length; i++) {
    const slice = candles.slice(i - lookback + 1, i + 1);
    high.push({ time: candles[i]!.time as UTCTimestamp, value: Math.max(...slice.map((c) => c.high)) });
    low.push({ time: candles[i]!.time as UTCTimestamp, value: Math.min(...slice.map((c) => c.low)) });
  }
  return [
    { key: "w52_high", label: "52W High", data: high, color: "#22c55e" },
    { key: "w52_low", label: "52W Low", data: low, color: "#ef4444" },
  ];
}

export function computeAcceleratorOscillator(candles: NormalizedCandle[]): IndicatorHistogramPoint[] {
  const median = candles.map((c) => (c.high + c.low) / 2);
  const ao = median.map((_, i) => {
    if (i < 33) return null;
    const fast = median.slice(i - 4, i + 1).reduce((s, v) => s + v, 0) / 5;
    const slow = median.slice(i - 33, i + 1).reduce((s, v) => s + v, 0) / 34;
    return fast - slow;
  });
  const out: IndicatorHistogramPoint[] = [];
  let prev: number | null = null;
  for (let i = 0; i < candles.length; i++) {
    if (ao[i] == null) continue;
    const v = ao[i]!;
    const signal = prev == null ? v : (v + prev) / 2;
    const hist = v - signal;
    out.push({
      time: candles[i]!.time as UTCTimestamp,
      value: hist,
      color: hist >= 0 ? "#26a69a" : "#ef5350",
    });
    prev = v;
  }
  return out;
}

export function computeAccumulativeSwingIndex(candles: NormalizedCandle[]): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  let asi = 0;
  const t = 50;
  const limit = 100;
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]!;
    const p = candles[i - 1]!;
    const tr = Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
    if (tr === 0) {
      pushPoint(out, candles, i, asi);
      continue;
    }
    const k = Math.max(Math.abs(c.high - p.close), Math.abs(c.low - p.close));
    const r = tr - 0.5 * k + 0.25 * (p.close - p.open);
    const si = 50 * ((c.close - p.close + 0.5 * (c.close - c.open) + 0.25 * (p.close - p.open)) / r) * (k / t);
    const clamped = Math.max(-limit, Math.min(limit, si));
    asi += Number.isFinite(clamped) ? clamped : 0;
    pushPoint(out, candles, i, asi);
  }
  return out;
}

export function computeChaikinMoneyFlow(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const mfv: number[] = [];
  for (const c of candles) {
    const range = c.high - c.low;
    const mfm = range === 0 ? 0 : ((c.close - c.low) - (c.high - c.close)) / range;
    mfv.push(mfm * c.volume);
  }
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const volSum = candles.slice(i - period + 1, i + 1).reduce((s, c) => s + c.volume, 0);
    const mfvSum = mfv.slice(i - period + 1, i + 1).reduce((s, v) => s + v, 0);
    pushPoint(out, candles, i, volSum === 0 ? 0 : mfvSum / volSum);
  }
  return out;
}

export function computeBalanceOfPower(candles: NormalizedCandle[]): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]!;
    const range = c.high - c.low;
    pushPoint(out, candles, i, range === 0 ? 0 : (c.close - c.open) / range);
  }
  return out;
}

export function computeChoppinessIndex(candles: NormalizedCandle[], period = 14): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period; i < candles.length; i++) {
    const slice = candles.slice(i - period, i);
    let trSum = 0;
    for (let j = 1; j < slice.length; j++) {
      const c = slice[j]!;
      const p = slice[j - 1]!;
      trSum += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close));
    }
    const hi = Math.max(...slice.map((c) => c.high));
    const lo = Math.min(...slice.map((c) => c.low));
    const range = hi - lo;
    if (range <= 0 || trSum <= 0) {
      pushPoint(out, candles, i, 0);
      continue;
    }
    const chop = (100 * Math.log10(trSum / range)) / Math.log10(period);
    pushPoint(out, candles, i, chop);
  }
  return out;
}

export function computeHistoricalVolatility(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  const logReturns: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const r = Math.log(candles[i]!.close / candles[i - 1]!.close);
    logReturns.push(Number.isFinite(r) ? r : 0);
  }
  for (let i = period; i < logReturns.length; i++) {
    const slice = logReturns.slice(i - period, i);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const hv = Math.sqrt(variance) * Math.sqrt(252) * 100;
    pushPoint(out, candles, i + 1, hv);
  }
  return out;
}

export function computeLinearRegression(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    for (let j = 0; j < slice.length; j++) {
      sumX += j;
      sumY += slice[j]!.close;
      sumXY += j * slice[j]!.close;
      sumX2 += j * j;
    }
    const denom = period * sumX2 - sumX * sumX;
    const slope = denom === 0 ? 0 : (period * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / period;
    pushPoint(out, candles, i, intercept + slope * (period - 1));
  }
  return out;
}

export function computeVwma(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const out: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    let pv = 0;
    let vol = 0;
    for (const c of slice) {
      pv += c.close * c.volume;
      vol += c.volume;
    }
    pushPoint(out, candles, i, vol === 0 ? slice[slice.length - 1]!.close : pv / vol);
  }
  return out;
}

export function computeTema(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const ema1 = computeEma(candles, period);
  if (ema1.length < period) return [];
  const ema1Candles: NormalizedCandle[] = ema1.map((p) => ({
    time: p.time as number,
    open: p.value,
    high: p.value,
    low: p.value,
    close: p.value,
    volume: 0,
  }));
  const ema2 = computeEma(ema1Candles, period);
  const ema2Candles: NormalizedCandle[] = ema2.map((p) => ({
    time: p.time as number,
    open: p.value,
    high: p.value,
    low: p.value,
    close: p.value,
    volume: 0,
  }));
  const ema3 = computeEma(ema2Candles, period);
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < ema3.length; i++) {
    const t = ema3[i]!.time;
    const e1 = ema1.find((p) => p.time === t)?.value;
    const e2 = ema2.find((p) => p.time === t)?.value;
    const e3 = ema3[i]!.value;
    if (e1 != null && e2 != null) {
      out.push({ time: t, value: 3 * e1 - 3 * e2 + e3 });
    }
  }
  return out;
}

export function computeDema(candles: NormalizedCandle[], period = 20): IndicatorPoint[] {
  const ema1 = computeEma(candles, period);
  const ema1Candles: NormalizedCandle[] = ema1.map((p) => ({
    time: p.time as number,
    open: p.value,
    high: p.value,
    low: p.value,
    close: p.value,
    volume: 0,
  }));
  const ema2 = computeEma(ema1Candles, period);
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < ema2.length; i++) {
    const t = ema2[i]!.time;
    const e1 = ema1.find((p) => p.time === t)?.value;
    if (e1 != null) out.push({ time: t, value: 2 * e1 - ema2[i]!.value });
  }
  return out;
}

export function computeTrueStrengthIndex(candles: NormalizedCandle[], long = 25, short = 13): IndicatorPoint[] {
  const pc: NormalizedCandle[] = [];
  for (let i = 1; i < candles.length; i++) {
    const diff = candles[i]!.close - candles[i - 1]!.close;
    pc.push({
      time: candles[i]!.time,
      open: diff,
      high: Math.abs(diff),
      low: 0,
      close: diff,
      volume: Math.abs(diff),
    });
  }
  const absPc = pc.map((c) => ({ ...c, close: Math.abs(c.close), open: Math.abs(c.open) }));
  const pcd = computeEma(pc, short);
  const apcd = computeEma(absPc, short);
  const pcd2 = pcd.map((p) => ({ time: p.time as number, open: p.value, high: p.value, low: p.value, close: p.value, volume: 0 }));
  const apcd2 = apcd.map((p) => ({ time: p.time as number, open: p.value, high: p.value, low: p.value, close: p.value, volume: 0 }));
  const pcdEma = computeEma(pcd2, long);
  const apcdEma = computeEma(apcd2, long);
  const out: IndicatorPoint[] = [];
  for (let i = 0; i < pcdEma.length; i++) {
    const t = pcdEma[i]!.time;
    const ap = apcdEma.find((p) => p.time === t)?.value ?? 0;
    const pv = pcdEma[i]!.value;
    if (ap !== 0) out.push({ time: t, value: (pv / ap) * 100 });
  }
  return out;
}

export function computeWilliamsAlligator(candles: NormalizedCandle[]): IndicatorLineSeries[] {
  const median = candles.map((c) => ({ ...c, close: (c.high + c.low) / 2, open: (c.high + c.low) / 2 }));
  return [
    { key: "jaw", label: "Jaw", data: computeSmma(median, 13), color: "#3b82f6", lineWidth: 2 },
    { key: "teeth", label: "Teeth", data: computeSmma(median, 8), color: "#ef4444", lineWidth: 2 },
    { key: "lips", label: "Lips", data: computeSmma(median, 5), color: "#22c55e", lineWidth: 2 },
  ];
}

export function computeChaikinOscillator(candles: NormalizedCandle[]): IndicatorPoint[] {
  const ad = computeAd(candles);
  const adCandles: NormalizedCandle[] = ad.map((p) => ({
    time: p.time as number,
    open: p.value,
    high: p.value,
    low: p.value,
    close: p.value,
    volume: 0,
  }));
  const fast = computeEma(adCandles, 3);
  const slow = computeEma(adCandles, 10);
  const out: IndicatorPoint[] = [];
  for (const f of fast) {
    const s = slow.find((p) => p.time === f.time)?.value;
    if (s != null) out.push({ time: f.time, value: f.value - s });
  }
  return out;
}

export function computeForceIndex(candles: NormalizedCandle[], period = 13): IndicatorPoint[] {
  const raw: NormalizedCandle[] = [];
  for (let i = 1; i < candles.length; i++) {
    const fi = (candles[i]!.close - candles[i - 1]!.close) * candles[i]!.volume;
    raw.push({
      time: candles[i]!.time,
      open: fi,
      high: fi,
      low: fi,
      close: fi,
      volume: 0,
    });
  }
  return computeEma(raw, period);
}

export function computeElderRay(candles: NormalizedCandle[], period = 13): IndicatorLineSeries[] {
  const ema = computeEma(candles, period);
  const bull: IndicatorPoint[] = [];
  const bear: IndicatorPoint[] = [];
  for (const e of ema) {
    const c = candles.find((x) => x.time === e.time);
    if (!c) continue;
    bull.push({ time: e.time, value: c.high - e.value });
    bear.push({ time: e.time, value: c.low - e.value });
  }
  return [
    { key: "bull", label: "Bull Power", data: bull, color: "#22c55e" },
    { key: "bear", label: "Bear Power", data: bear, color: "#ef4444" },
  ];
}

export function computeEnvelope(candles: NormalizedCandle[], period = 20, pct = 2.5): IndicatorBandSet {
  const sma = computeSma(candles, period);
  const upper: IndicatorPoint[] = [];
  const lower: IndicatorPoint[] = [];
  const middle: IndicatorPoint[] = sma;
  const ratio = pct / 100;
  for (const m of sma) {
    upper.push({ time: m.time, value: m.value * (1 + ratio) });
    lower.push({ time: m.time, value: m.value * (1 - ratio) });
  }
  return { upper, middle, lower };
}

export function computeAwesomeOscillator(candles: NormalizedCandle[]): IndicatorHistogramPoint[] {
  const median = candles.map((c) => (c.high + c.low) / 2);
  const out: IndicatorHistogramPoint[] = [];
  for (let i = 33; i < candles.length; i++) {
    const fast = median.slice(i - 4, i + 1).reduce((s, v) => s + v, 0) / 5;
    const slow = median.slice(i - 33, i + 1).reduce((s, v) => s + v, 0) / 34;
    const v = fast - slow;
    out.push({
      time: candles[i]!.time as UTCTimestamp,
      value: v,
      color: v >= 0 ? "#26a69a" : "#ef5350",
    });
  }
  return out;
}
