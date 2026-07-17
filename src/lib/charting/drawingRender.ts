import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import {
  DRAWING_HANDLE_HIT_PX,
  DRAWING_LINE_HIT_PX,
  distanceToInfiniteLine,
  extendLineThroughBox,
  type ChartPoint,
  type PixelPoint,
} from "@/lib/charting/chartDrawing";
import type { ChartDrawing, LineExtend } from "@/types/chart-tools";

export const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export function toPixel(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  pt: ChartPoint,
): PixelPoint | null {
  const x = chart.timeScale().timeToCoordinate(pt.time as UTCTimestamp);
  const y = series.priceToCoordinate(pt.price);
  if (x == null || y == null) return null;
  return { x, y };
}

export function linePixels(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  p1: ChartPoint,
  p2: ChartPoint,
  width: number,
  height: number,
  extend: LineExtend,
): [PixelPoint, PixelPoint] | null {
  const c1 = toPixel(chart, series, p1);
  const c2 = toPixel(chart, series, p2);
  if (!c1 || !c2) return null;
  if (extend === "segment") return [c1, c2];
  if (extend === "right") {
    const [a, b] = extendLineThroughBox(c1, c2, width, height);
    return [c1, b.x >= c1.x ? b : a];
  }
  if (extend === "left") {
    const [a, b] = extendLineThroughBox(c1, c2, width, height);
    return [a.x <= c1.x ? a : b, c1];
  }
  return extendLineThroughBox(c1, c2, width, height);
}

export function parallelOffset(p1: ChartPoint, p2: ChartPoint, p3: ChartPoint): number {
  const dx = p2.time - p1.time;
  const dy = p2.price - p1.price;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return (p3.time - p1.time) * nx + (p3.price - p1.price) * ny;
}

export function offsetPoint(p: ChartPoint, p1: ChartPoint, p2: ChartPoint, offset: number): ChartPoint {
  const dx = p2.time - p1.time;
  const dy = p2.price - p1.price;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return { time: p.time + nx * offset, price: p.price + ny * offset };
}

export type DrawingHit =
  | { drawingId: string; part: "body" }
  | { drawingId: string; part: "endpoint"; index: number };

export function hitTestDrawing(
  drawing: ChartDrawing,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  x: number,
  y: number,
  width: number,
  height: number,
): DrawingHit | null {
  if (drawing.kind === "line") {
    const c1 = toPixel(chart, series, drawing.p1);
    const c2 = toPixel(chart, series, drawing.p2);
    if (!c1 || !c2) return null;
    if (Math.hypot(x - c1.x, y - c1.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: 0 };
    if (Math.hypot(x - c2.x, y - c2.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: 1 };
    const seg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, drawing.extend);
    if (!seg) return null;
    if (distanceToInfiniteLine(x, y, seg[0].x, seg[0].y, seg[1].x, seg[1].y) <= DRAWING_LINE_HIT_PX) {
      return { drawingId: drawing.id, part: "body" };
    }
  }

  if (drawing.kind === "hline") {
    const hy = series.priceToCoordinate(drawing.price);
    if (hy != null && Math.abs(y - hy) <= DRAWING_LINE_HIT_PX) return { drawingId: drawing.id, part: "body" };
  }

  if (drawing.kind === "vline") {
    const vx = chart.timeScale().timeToCoordinate(drawing.time as UTCTimestamp);
    if (vx != null && Math.abs(x - vx) <= DRAWING_LINE_HIT_PX) return { drawingId: drawing.id, part: "body" };
  }

  if (drawing.kind === "cross") {
    const px = toPixel(chart, series, { time: drawing.time, price: drawing.price });
    if (px && Math.hypot(x - px.x, y - px.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "body" };
  }

  if (drawing.kind === "channel") {
    const [a, b, c, d] = channelLines(drawing);
    for (let i = 0; i < 4; i++) {
      const pt = [a, b, c, d][i]!;
      const p = toPixel(chart, series, pt);
      if (p && Math.hypot(x - p.x, y - p.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: i };
    }
    for (const pair of [
      [a, b],
      [c, d],
    ] as const) {
      const seg = linePixels(chart, series, pair[0], pair[1], width, height, "both");
      if (seg && distanceToInfiniteLine(x, y, seg[0].x, seg[0].y, seg[1].x, seg[1].y) <= DRAWING_LINE_HIT_PX) {
        return { drawingId: drawing.id, part: "body" };
      }
    }
  }

  if (drawing.kind === "rect" || drawing.kind === "position") {
    const a = toPixel(chart, series, drawing.p1);
    const b = toPixel(chart, series, drawing.p2);
    if (a && Math.hypot(x - a.x, y - a.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: 0 };
    if (b && Math.hypot(x - b.x, y - b.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: 1 };
    if (a && b && x >= Math.min(a.x, b.x) && x <= Math.max(a.x, b.x) && y >= Math.min(a.y, b.y) && y <= Math.max(a.y, b.y)) {
      return { drawingId: drawing.id, part: "body" };
    }
  }

  if (drawing.kind === "fib" || drawing.kind === "gann") {
    for (let i = 0; i < 2; i++) {
      const pt = [drawing.p1, drawing.p2][i]!;
      const p = toPixel(chart, series, pt);
      if (p && Math.hypot(x - p.x, y - p.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: i };
    }
    const seg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, "segment");
    if (seg && distanceToInfiniteLine(x, y, seg[0].x, seg[0].y, seg[1].x, seg[1].y) <= DRAWING_LINE_HIT_PX) {
      return { drawingId: drawing.id, part: "body" };
    }
  }

  if (drawing.kind === "text" || drawing.kind === "icon") {
    const p = toPixel(chart, series, drawing.point);
    if (p && Math.hypot(x - p.x, y - p.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "body" };
  }

  if (drawing.kind === "pattern") {
    for (let i = 0; i < drawing.points.length; i++) {
      const p = toPixel(chart, series, drawing.points[i]!);
      if (p && Math.hypot(x - p.x, y - p.y) <= DRAWING_HANDLE_HIT_PX) return { drawingId: drawing.id, part: "endpoint", index: i };
    }
  }

  return null;
}

export function findTopDrawingHit(
  drawings: ChartDrawing[],
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  x: number,
  y: number,
  width: number,
  height: number,
): DrawingHit | null {
  for (let i = drawings.length - 1; i >= 0; i--) {
    const hit = hitTestDrawing(drawings[i]!, chart, series, x, y, width, height);
    if (hit) return hit;
  }
  return null;
}

export function formatMeasure(p1: ChartPoint, p2: ChartPoint): string {
  const dp = Math.abs(p2.price - p1.price);
  const dt = Math.abs(p2.time - p1.time);
  const pct = p1.price ? ((dp / p1.price) * 100).toFixed(2) : "0";
  return `${dp.toFixed(2)} (${pct}%) · ${Math.round(dt / 60)}m`;
}

export function channelLines(drawing: Extract<ChartDrawing, { kind: "channel" }>): [ChartPoint, ChartPoint, ChartPoint, ChartPoint] {
  const off = parallelOffset(drawing.p1, drawing.p2, drawing.p3);
  const p3a = offsetPoint(drawing.p1, drawing.p1, drawing.p2, off);
  const p4a = offsetPoint(drawing.p2, drawing.p1, drawing.p2, off);
  return [drawing.p1, drawing.p2, p3a, p4a];
}

export function pitchforkLines(
  drawing: Extract<ChartDrawing, { kind: "pitchfork" }>,
): [ChartPoint, ChartPoint, ChartPoint, ChartPoint] {
  const mid = {
    time: (drawing.p2.time + drawing.p3.time) / 2,
    price: (drawing.p2.price + drawing.p3.price) / 2,
  };
  const off2 = {
    time: drawing.p2.time - mid.time,
    price: drawing.p2.price - mid.price,
  };
  const off3 = {
    time: drawing.p3.time - mid.time,
    price: drawing.p3.price - mid.price,
  };
  const apex =
    drawing.variant === "schiff"
      ? { time: drawing.p1.time, price: mid.price }
      : drawing.variant === "modified"
        ? { time: mid.time, price: drawing.p1.price }
        : drawing.p1;
  return [
    apex,
    { time: apex.time + off2.time, price: apex.price + off2.price },
    { time: apex.time + off3.time, price: apex.price + off3.price },
    mid,
  ];
}

export function lineAngleDeg(p1: ChartPoint, p2: ChartPoint): number {
  const dx = p2.time - p1.time;
  const dy = p2.price - p1.price;
  return (Math.atan2(-dy, dx) * 180) / Math.PI;
}

export function drawingToolbarAnchor(
  drawing: ChartDrawing,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
): PixelPoint | null {
  switch (drawing.kind) {
    case "line": {
      const seg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, drawing.extend);
      if (!seg) return null;
      return { x: (seg[0].x + seg[1].x) / 2, y: (seg[0].y + seg[1].y) / 2 };
    }
    case "hline": {
      const y = series.priceToCoordinate(drawing.price);
      if (y == null) return null;
      return { x: width * 0.5, y };
    }
    case "vline": {
      const x = chart.timeScale().timeToCoordinate(drawing.time as UTCTimestamp);
      if (x == null) return null;
      return { x, y: height * 0.35 };
    }
    case "cross": {
      return toPixel(chart, series, { time: drawing.time, price: drawing.price });
    }
    case "channel":
    case "pitchfork":
    case "fib":
    case "gann":
    case "position": {
      const c1 = toPixel(chart, series, drawing.p1);
      const c2 = toPixel(chart, series, drawing.p2);
      if (!c1 || !c2) return null;
      return { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 };
    }
    case "rect": {
      const c1 = toPixel(chart, series, drawing.p1);
      const c2 = toPixel(chart, series, drawing.p2);
      if (!c1 || !c2) return null;
      return { x: (c1.x + c2.x) / 2, y: Math.min(c1.y, c2.y) };
    }
    case "text":
    case "icon": {
      return toPixel(chart, series, drawing.point);
    }
    case "pattern": {
      const pts = drawing.points
        .map((p) => toPixel(chart, series, p))
        .filter((p): p is PixelPoint => p != null);
      if (pts.length === 0) return null;
      const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      return { x, y };
    }
    default:
      return null;
  }
}
