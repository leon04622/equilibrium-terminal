import type { NormalizedCandle } from "@/types/terminal-schema";

export interface ChartPoint {
  time: number;
  price: number;
}

export interface PixelPoint {
  x: number;
  y: number;
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
