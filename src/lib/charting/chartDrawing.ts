import type { IChartApi, ISeriesApi, Logical, Time, UTCTimestamp } from "lightweight-charts";
import type { MagnetMode } from "@/types/chart-tools";
import type { NormalizedCandle } from "@/types/terminal-schema";

export interface ChartPoint {
  time: number;
  price: number;
}

export interface PixelPoint {
  x: number;
  y: number;
}

function timeToUnix(time: Time): number | null {
  if (typeof time === "number") return time;
  if (typeof time === "string") return Math.floor(Date.parse(time) / 1000);
  if (time && typeof time === "object" && "year" in time) {
    return Math.floor(Date.UTC(time.year, time.month - 1, time.day) / 1000);
  }
  return null;
}

/** Average bar duration from recent candles (seconds). */
export function candleBarDurationSec(candles: NormalizedCandle[]): number {
  if (candles.length >= 2) {
    const dt = candles[candles.length - 1]!.time - candles[candles.length - 2]!.time;
    if (dt > 0) return dt;
  }
  return 60;
}

function barLogicalAnchor(chart: IChartApi, barTime: number): { logical: number } | null {
  const x = chart.timeScale().timeToCoordinate(barTime as UTCTimestamp);
  if (x == null) return null;
  const logical = chart.timeScale().coordinateToLogical(x);
  if (logical == null) return null;
  return { logical };
}

function lastCandleTime(candles: NormalizedCandle[]): number | null {
  return candles[candles.length - 1]?.time ?? null;
}

function chartBarSpacing(chart: IChartApi): number {
  return chart.timeScale().options().barSpacing ?? 6;
}

/** True when x is in the empty chart area to the right of the last candle. */
function isFutureChartX(
  chart: IChartApi,
  x: number,
  candles: NormalizedCandle[],
): boolean {
  const lastTime = lastCandleTime(candles);
  if (lastTime == null) return false;
  const lastX = chart.timeScale().timeToCoordinate(lastTime as UTCTimestamp);
  if (lastX == null) return false;
  return x > lastX + chartBarSpacing(chart) * 0.5;
}

function futureTimeFromX(
  chart: IChartApi,
  x: number,
  candles: NormalizedCandle[],
): number | null {
  const lastTime = lastCandleTime(candles);
  if (lastTime == null) return null;
  const lastX = chart.timeScale().timeToCoordinate(lastTime as UTCTimestamp);
  if (lastX == null) return null;
  const barSpacing = chartBarSpacing(chart);
  const deltaBars = (x - lastX) / barSpacing;
  return lastTime + deltaBars * candleBarDurationSec(candles);
}

function futureXFromTime(
  chart: IChartApi,
  time: number,
  candles: NormalizedCandle[],
): number | null {
  const lastTime = lastCandleTime(candles);
  if (lastTime == null || time <= lastTime) return null;
  const lastX = chart.timeScale().timeToCoordinate(lastTime as UTCTimestamp);
  if (lastX == null) return null;
  const barSec = candleBarDurationSec(candles);
  if (barSec <= 0) return null;
  const deltaBars = (time - lastTime) / barSec;
  return lastX + deltaBars * chartBarSpacing(chart);
}

/** Map x pixel to unix time, including the empty future area past the last candle. */
export function xToChartTime(
  chart: IChartApi,
  x: number,
  candles: NormalizedCandle[],
): number | null {
  if (isFutureChartX(chart, x, candles)) {
    return futureTimeFromX(chart, x, candles);
  }

  const direct = chart.timeScale().coordinateToTime(x);
  if (direct != null) {
    const unix = timeToUnix(direct);
    if (unix != null) return unix;
  }

  if (!candles.length) return null;

  const logical = chart.timeScale().coordinateToLogical(x);
  const lastTime = lastCandleTime(candles);
  if (logical == null || lastTime == null) return null;

  const anchor = barLogicalAnchor(chart, lastTime);
  if (!anchor) return null;

  const barSec = candleBarDurationSec(candles);
  const deltaBars = logical - anchor.logical;
  return lastTime + deltaBars * barSec;
}

/** Map unix time to x pixel, including future times beyond the last candle. */
export function chartTimeToX(
  chart: IChartApi,
  time: number,
  candles: NormalizedCandle[],
): number | null {
  const lastTime = lastCandleTime(candles);
  if (lastTime != null && time > lastTime) {
    const futureX = futureXFromTime(chart, time, candles);
    if (futureX != null) return futureX;
  }

  const direct = chart.timeScale().timeToCoordinate(time as UTCTimestamp);
  if (direct != null) return direct;

  if (!candles.length || lastTime == null) return null;

  const anchor = barLogicalAnchor(chart, lastTime);
  if (!anchor) return null;

  const barSec = candleBarDurationSec(candles);
  const deltaBars = (time - lastTime) / barSec;
  const logical = (anchor.logical + deltaBars) as Logical;
  return chart.timeScale().logicalToCoordinate(logical);
}

/** Convert a pixel on the chart surface to time + price. */
export function pointFromChart(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  x: number,
  y: number,
  candles: NormalizedCandle[] = [],
): ChartPoint | null {
  const price = series.coordinateToPrice(y);
  if (price == null || !Number.isFinite(price)) return null;

  const time = xToChartTime(chart, x, candles);
  if (time == null) return null;

  return { time, price: price as number };
}

export function resolveDrawPoint(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  x: number,
  y: number,
  candles: NormalizedCandle[],
  magnetMode: MagnetMode,
): ChartPoint | null {
  const pt = pointFromChart(chart, series, x, y, candles);
  if (!pt) return null;
  if (magnetMode === "off") return pt;

  const lastTime = lastCandleTime(candles);
  const inFuture =
    isFutureChartX(chart, x, candles) ||
    (lastTime != null && pt.time > lastTime);
  if (inFuture) return pt;

  const snappedPrice = snapPriceToCandle(candles, pt.time, pt.price);
  const snappedTime = snapTimeToCandle(candles, pt.time);
  if (magnetMode === "strong") return { time: snappedTime, price: snappedPrice };

  const rawY = series.priceToCoordinate(pt.price);
  const snapY = series.priceToCoordinate(snappedPrice);
  const rawX = chartTimeToX(chart, pt.time, candles);
  const snapX = chartTimeToX(chart, snappedTime, candles);

  let time = pt.time;
  let price = pt.price;
  if (rawY != null && snapY != null && Math.abs(rawY - snapY) <= 10) price = snappedPrice;
  if (rawX != null && snapX != null && Math.abs(rawX - snapX) <= 12) time = snappedTime;
  return { time, price };
}

/** Snap unix time to the nearest candle open time. */
export function snapTimeToCandle(candles: NormalizedCandle[], time: number): number {
  if (!candles.length) return time;
  let best = candles[0]!;
  let bestDist = Math.abs(best.time - time);
  for (const c of candles) {
    const d = Math.abs(c.time - time);
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best.time;
}

/** Snap price to nearest OHLC on the candle at the given unix time. */
export function snapPriceToCandle(
  candles: NormalizedCandle[],
  time: number,
  price: number,
): number {
  if (!candles.length) return price;
  let candle = candles.find((c) => c.time === time);
  if (!candle) {
    let best = candles[0]!;
    let bestDist = Math.abs(best.time - time);
    for (const c of candles) {
      const d = Math.abs(c.time - time);
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }
    candle = best;
  }
  const candidates = [candle.open, candle.high, candle.low, candle.close];
  let nearest = candidates[0]!;
  let minDist = Math.abs(price - nearest);
  for (const p of candidates.slice(1)) {
    const d = Math.abs(price - p);
    if (d < minDist) {
      minDist = d;
      nearest = p;
    }
  }
  return nearest;
}

/** Extend a line through two pixel points to the edges of a chart box. */
export function extendLineThroughBox(
  p1: PixelPoint,
  p2: PixelPoint,
  width: number,
  height: number,
): [PixelPoint, PixelPoint] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return [p1, p2];
  }

  const points: PixelPoint[] = [];
  const tValues: number[] = [];

  const addIntersection = (t: number, x: number, y: number) => {
    if (t >= -0.001 && t <= 1.001) {
      points.push({ x, y });
      tValues.push(t);
    }
  };

  if (Math.abs(dx) > 0.001) {
    const tLeft = (0 - p1.x) / dx;
    addIntersection(tLeft, 0, p1.y + tLeft * dy);
    const tRight = (width - p1.x) / dx;
    addIntersection(tRight, width, p1.y + tRight * dy);
  }
  if (Math.abs(dy) > 0.001) {
    const tTop = (0 - p1.y) / dy;
    addIntersection(tTop, p1.x + tTop * dx, 0);
    const tBottom = (height - p1.y) / dy;
    addIntersection(tBottom, p1.x + tBottom * dx, height);
  }

  if (points.length < 2) return [p1, p2];

  let minT = tValues[0]!;
  let maxT = tValues[0]!;
  let minP = points[0]!;
  let maxP = points[0]!;
  for (let i = 1; i < points.length; i++) {
    const t = tValues[i]!;
    if (t < minT) {
      minT = t;
      minP = points[i]!;
    }
    if (t > maxT) {
      maxT = t;
      maxP = points[i]!;
    }
  }
  return [minP, maxP];
}

export const DRAWING_HANDLE_HIT_PX = 12;
export const DRAWING_LINE_HIT_PX = 8;

export function distanceToInfiniteLine(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
}

export function chartPointToPixel(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  time: number,
  price: number,
  candles: NormalizedCandle[] = [],
): PixelPoint | null {
  const x = chartTimeToX(chart, time, candles);
  const y = series.priceToCoordinate(price);
  if (x == null || y == null) return null;
  return { x, y };
}

export type DrawingHit =
  | { type: "trend-endpoint"; lineId: string; endpoint: 1 | 2 }
  | { type: "trend-body"; lineId: string }
  | { type: "hline"; lineId: string };

/** Find topmost drawing under a chart pixel (HL-style hit priority). */
export function findDrawingHit(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  x: number,
  y: number,
  trendLines: { id: string; time1: number; price1: number; time2: number; price2: number }[],
  hlines: { id: string; price: number }[],
): DrawingHit | null {
  for (let i = trendLines.length - 1; i >= 0; i--) {
    const line = trendLines[i]!;
    const c1 = chartPointToPixel(chart, series, line.time1, line.price1);
    const c2 = chartPointToPixel(chart, series, line.time2, line.price2);
    if (c1 && Math.hypot(x - c1.x, y - c1.y) <= DRAWING_HANDLE_HIT_PX) {
      return { type: "trend-endpoint", lineId: line.id, endpoint: 1 };
    }
    if (c2 && Math.hypot(x - c2.x, y - c2.y) <= DRAWING_HANDLE_HIT_PX) {
      return { type: "trend-endpoint", lineId: line.id, endpoint: 2 };
    }
  }

  for (let i = trendLines.length - 1; i >= 0; i--) {
    const line = trendLines[i]!;
    const c1 = chartPointToPixel(chart, series, line.time1, line.price1);
    const c2 = chartPointToPixel(chart, series, line.time2, line.price2);
    if (!c1 || !c2) continue;
    if (
      Math.hypot(x - c1.x, y - c1.y) <= DRAWING_HANDLE_HIT_PX ||
      Math.hypot(x - c2.x, y - c2.y) <= DRAWING_HANDLE_HIT_PX
    ) {
      continue;
    }
    if (distanceToInfiniteLine(x, y, c1.x, c1.y, c2.x, c2.y) <= DRAWING_LINE_HIT_PX) {
      return { type: "trend-body", lineId: line.id };
    }
  }

  for (let i = hlines.length - 1; i >= 0; i--) {
    const line = hlines[i]!;
    const hy = series.priceToCoordinate(line.price);
    if (hy != null && Math.abs(y - hy) <= DRAWING_LINE_HIT_PX) {
      return { type: "hline", lineId: line.id };
    }
  }

  return null;
}
