import type { IChartApi, ISeriesApi, Logical, Time, UTCTimestamp } from "lightweight-charts";
import { ChartDataEngine } from "@/lib/charting/ChartDataEngine";
import type { ChartTimeframe } from "@/types/chart-analytics";
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

function lastCandleTime(candles: NormalizedCandle[]): number | null {
  return candles[candles.length - 1]?.time ?? null;
}

/** Bar duration in seconds — prefer chart timeframe over inferred gaps. */
export function barDurationSec(
  candles: NormalizedCandle[],
  timeframe?: ChartTimeframe,
): number {
  if (timeframe) return ChartDataEngine.timeframeSeconds(timeframe);
  if (candles.length >= 2) {
    const dt = candles[candles.length - 1]!.time - candles[candles.length - 2]!.time;
    if (dt > 0) return dt;
  }
  return 60;
}

/** @deprecated Use barDurationSec */
export function candleBarDurationSec(candles: NormalizedCandle[]): number {
  return barDurationSec(candles);
}

function barLogicalAnchor(
  chart: IChartApi,
  barTime: number,
  candles: NormalizedCandle[],
): { logical: number } | null {
  const ts = chart.timeScale();
  const x = ts.timeToCoordinate(barTime as UTCTimestamp);
  if (x != null) {
    const logical = ts.coordinateToLogical(x);
    if (logical != null) return { logical };
  }

  const range = ts.getVisibleLogicalRange();
  if (range != null && candles.length > 0) {
    const rightOffset = ts.options().rightOffset ?? 0;
    const logicalFromRange = Math.round(range.to - rightOffset);
    if (Number.isFinite(logicalFromRange)) {
      return { logical: logicalFromRange };
    }
  }

  return null;
}

function lastBarPixelX(
  chart: IChartApi,
  lastTime: number,
  candles: NormalizedCandle[],
): number | null {
  const ts = chart.timeScale();
  const fromTime = ts.timeToCoordinate(lastTime as UTCTimestamp);
  if (fromTime != null) return fromTime;

  const anchor = barLogicalAnchor(chart, lastTime, candles);
  if (!anchor) return null;
  return ts.logicalToCoordinate(anchor.logical as Logical);
}

function timeFromBarSpacing(
  x: number,
  lastTime: number,
  lastBarX: number,
  spacing: number,
  step: number,
): number {
  const deltaBars = Math.round((x - lastBarX) / spacing);
  return lastTime + deltaBars * step;
}

function xFromBarSpacing(
  time: number,
  lastTime: number,
  lastBarX: number,
  spacing: number,
  step: number,
): number {
  const deltaBars = Math.round((time - lastTime) / step);
  return lastBarX + deltaBars * spacing;
}

/** Map a DOM pointer to chart-pane x/y (same space as timeScale().timeToCoordinate). */
export function chartPlotPointer(
  chart: IChartApi,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = chart.chartElement().getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

/**
 * Map x pixel → unix time using logical bar indices.
 * Works in the future whitespace past the last candle (Hyperliquid / TradingView style).
 */
export function xToChartTime(
  chart: IChartApi,
  x: number,
  candles: NormalizedCandle[],
  timeframe?: ChartTimeframe,
): number | null {
  if (!candles.length) {
    const direct = chart.timeScale().coordinateToTime(x);
    if (direct == null) return null;
    return timeToUnix(direct);
  }

  const lastTime = lastCandleTime(candles);
  if (lastTime == null) return null;

  const ts = chart.timeScale();
  const step = barDurationSec(candles, timeframe);
  const spacing = ts.options().barSpacing ?? 7;
  const anchor = barLogicalAnchor(chart, lastTime, candles);
  if (!anchor) return null;

  const lastBarX = lastBarPixelX(chart, lastTime, candles);

  // Future whitespace — bar-spacing geometry (LWC logical APIs fail or clamp here).
  if (lastBarX != null && x >= lastBarX + spacing * 0.5) {
    return timeFromBarSpacing(x, lastTime, lastBarX, spacing, step);
  }

  const logical = ts.coordinateToLogical(x);
  if (logical != null) {
    const deltaBars = Math.round(logical - anchor.logical);
    const time = lastTime + deltaBars * step;
    // LWC may snap future-zone clicks to the last bar — trust pixel geometry when mismatched.
    if (lastBarX != null && x > lastBarX + spacing * 0.5 && time <= lastTime + step * 0.001) {
      return timeFromBarSpacing(x, lastTime, lastBarX, spacing, step);
    }
    return time;
  }

  if (lastBarX == null) return null;
  return timeFromBarSpacing(x, lastTime, lastBarX, spacing, step);
}

/**
 * Map unix time → x pixel using logical bar indices.
 * Renders future trend-line endpoints in the empty area right of price action.
 */
export function chartTimeToX(
  chart: IChartApi,
  time: number,
  candles: NormalizedCandle[],
  timeframe?: ChartTimeframe,
): number | null {
  if (!candles.length) {
    return chart.timeScale().timeToCoordinate(time as UTCTimestamp);
  }

  const lastTime = lastCandleTime(candles);
  if (lastTime == null) return null;

  const ts = chart.timeScale();
  const step = barDurationSec(candles, timeframe);
  const spacing = ts.options().barSpacing ?? 7;
  const lastBarX = lastBarPixelX(chart, lastTime, candles);

  // Future times have no LWC data point — always use bar-spacing geometry.
  if (time > lastTime + step * 0.001) {
    if (lastBarX != null) {
      return xFromBarSpacing(time, lastTime, lastBarX, spacing, step);
    }
  }

  const deltaBars = Math.round((time - lastTime) / step);
  if (deltaBars === 0 && lastBarX != null) return lastBarX;

  const anchor = barLogicalAnchor(chart, lastTime, candles);
  if (!anchor) return null;

  const logical = Math.round(anchor.logical + deltaBars) as Logical;
  const xOut = ts.logicalToCoordinate(logical);
  if (xOut != null) return xOut;

  if (lastBarX != null) {
    return xFromBarSpacing(time, lastTime, lastBarX, spacing, step);
  }
  return null;
}

/** Convert a pixel on the chart surface to time + price. */
export function pointFromChart(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  x: number,
  y: number,
  candles: NormalizedCandle[] = [],
  timeframe?: ChartTimeframe,
): ChartPoint | null {
  const price = series.coordinateToPrice(y);
  if (price == null || !Number.isFinite(price)) return null;

  const time = xToChartTime(chart, x, candles, timeframe);
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
  timeframe?: ChartTimeframe,
): ChartPoint | null {
  const pt = pointFromChart(chart, series, x, y, candles, timeframe);
  if (!pt) return null;
  if (magnetMode === "off") return pt;

  const lastTime = lastCandleTime(candles);
  const inFuture = lastTime != null && pt.time > lastTime + 0.001;
  if (inFuture) return pt;

  const snappedPrice = snapPriceToCandle(candles, pt.time, pt.price);
  const snappedTime = snapTimeToCandle(candles, pt.time);
  if (magnetMode === "strong") return { time: snappedTime, price: snappedPrice };

  const rawY = series.priceToCoordinate(pt.price);
  const snapY = series.priceToCoordinate(snappedPrice);
  const rawX = chartTimeToX(chart, pt.time, candles, timeframe);
  const snapX = chartTimeToX(chart, snappedTime, candles, timeframe);

  let time = pt.time;
  let price = pt.price;
  if (rawY != null && snapY != null && Math.abs(rawY - snapY) <= 10) price = snappedPrice;
  if (rawX != null && snapX != null && Math.abs(rawX - snapX) <= 12) time = snappedTime;
  return { time, price };
}

/** Snap unix time to the nearest candle open time. */
export function snapTimeToCandle(candles: NormalizedCandle[], time: number): number {
  if (!candles.length) return time;
  const last = candles[candles.length - 1]!.time;
  if (time > last) return time;
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
  const last = candles[candles.length - 1]!.time;
  if (time > last) return price;
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
  timeframe?: ChartTimeframe,
): PixelPoint | null {
  const x = chartTimeToX(chart, time, candles, timeframe);
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
