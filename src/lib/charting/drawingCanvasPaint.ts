import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { effectiveDrawingColor, fibLevelColor, SELECTED_COLOR } from "@/lib/charting/drawingColors";
import {
  applyDrawingLineDash,
  drawingStrokeWidth,
} from "@/lib/charting/drawingStyle";
import {
  channelLines,
  FIB_LEVELS,
  formatMeasure,
  lineAngleDeg,
  linePixels,
  offsetPoint,
  pitchforkLines,
  toPixel,
} from "@/lib/charting/drawingRender";
import { colorForDrawTool } from "@/lib/charting/drawingColors";
import type { ChartPoint } from "@/lib/charting/chartDrawing";
import type { ChartDrawTool, ChartDrawing } from "@/types/chart-tools";

export interface DrawingDraftState {
  tool: ChartDrawTool;
  points: ChartPoint[];
  pathPoints?: ChartPoint[];
  cursor?: ChartPoint;
}

export interface DrawingPaintState {
  hidden: boolean;
  selectedId: string | null;
  drawings: ChartDrawing[];
  skipId: string | null;
  draft: DrawingDraftState | null;
  liveEditDrawing: ChartDrawing | null;
}

function drawingAnchorPoints(drawing: ChartDrawing): ChartPoint[] {
  switch (drawing.kind) {
    case "line":
      return [drawing.p1, drawing.p2];
    case "hline":
      return [];
    case "vline":
      return [];
    case "cross":
      return [{ time: drawing.time, price: drawing.price }];
    case "channel":
      return [drawing.p1, drawing.p2, drawing.p3];
    case "pitchfork":
      return [drawing.p1, drawing.p2, drawing.p3];
    case "fib":
    case "gann":
    case "rect":
    case "position":
      return [drawing.p1, drawing.p2];
    case "text":
    case "icon":
      return [drawing.point];
    case "pattern":
      return drawing.points;
    default:
      return [];
  }
}

function strokeColor(selected: boolean, base: string): string {
  return selected ? SELECTED_COLOR : base;
}

const HANDLE_RADIUS = 5;

function paintEndpointHandles(
  ctx: CanvasRenderingContext2D,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  drawing: ChartDrawing,
): void {
  for (const pt of drawingAnchorPoints(drawing)) {
    const px = toPixel(chart, series, pt);
    if (!px) continue;
    ctx.beginPath();
    ctx.arc(px.x, px.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#131722";
    ctx.fill();
    ctx.strokeStyle = SELECTED_COLOR;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function strokeLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function paintLine(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "line" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const seg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, drawing.extend);
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!seg || !c1 || !c2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  ctx.lineCap = "round";
  applyDrawingLineDash(ctx, drawing.lineStyle);
  strokeLine(ctx, seg[0].x, seg[0].y, seg[1].x, seg[1].y);
  ctx.setLineDash([]);

  if (drawing.variant === "angle") {
    ctx.fillStyle = color;
    ctx.font = "10px sans-serif";
    ctx.fillText(`${lineAngleDeg(drawing.p1, drawing.p2).toFixed(1)}°`, c2.x + 6, c2.y - 6);
  } else if (drawing.variant === "info") {
    ctx.fillStyle = color;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(formatMeasure(drawing.p1, drawing.p2), (c1.x + c2.x) / 2, (c1.y + c2.y) / 2 - 6);
    ctx.textAlign = "start";
  }
}

function paintHline(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "hline" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  selected: boolean,
): void {
  const y = series.priceToCoordinate(drawing.price);
  if (y == null) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const x1 =
    drawing.fromTime != null
      ? (chart.timeScale().timeToCoordinate(drawing.fromTime as UTCTimestamp) ?? 0)
      : 0;

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  applyDrawingLineDash(ctx, drawing.lineStyle);
  strokeLine(ctx, x1, y, width, y);
  ctx.setLineDash([]);
}

function paintVline(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "vline" }>,
  chart: IChartApi,
  height: number,
  selected: boolean,
): void {
  const x = chart.timeScale().timeToCoordinate(drawing.time as UTCTimestamp);
  if (x == null) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  strokeLine(ctx, x, 0, x, height);
}

function paintCross(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "cross" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  const px = toPixel(chart, series, { time: drawing.time, price: drawing.price });
  if (!px) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  strokeLine(ctx, 0, px.y, width, px.y);
  strokeLine(ctx, px.x, 0, px.x, height);
}

function paintChannel(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "channel" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  const [a, b, c, d] = channelLines(drawing);
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const seg1 = linePixels(chart, series, a, b, width, height, "both");
  const seg2 = linePixels(chart, series, c, d, width, height, "both");

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  if (seg1) strokeLine(ctx, seg1[0].x, seg1[0].y, seg1[1].x, seg1[1].y);
  if (seg2) strokeLine(ctx, seg2[0].x, seg2[0].y, seg2[1].x, seg2[1].y);
}

function paintPitchfork(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "pitchfork" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  const [apex, left, right] = pitchforkLines(drawing);
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const lines = [
    linePixels(chart, series, apex, left, width, height, "both"),
    linePixels(chart, series, apex, right, width, height, "both"),
    linePixels(chart, series, left, right, width, height, "both"),
  ];

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  for (const seg of lines) {
    if (seg) strokeLine(ctx, seg[0].x, seg[0].y, seg[1].x, seg[1].y);
  }
}

function paintFib(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "fib" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const minX = Math.min(c1.x, c2.x);
  const maxX = Math.max(c1.x, c2.x);

  if (drawing.variant === "timezone" || drawing.variant === "time") {
    for (let i = 0; i < FIB_LEVELS.length; i++) {
      const level = FIB_LEVELS[i]!;
      const t = drawing.p1.time + (drawing.p2.time - drawing.p1.time) * level;
      const x = chart.timeScale().timeToCoordinate(t as UTCTimestamp);
      if (x == null) continue;
      ctx.strokeStyle = selected ? SELECTED_COLOR : fibLevelColor(i);
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1;
      strokeLine(ctx, x, 0, x, height);
      ctx.globalAlpha = 1;
    }
  } else if (drawing.variant === "fan") {
    for (let i = 0; i < FIB_LEVELS.length; i++) {
      const level = FIB_LEVELS[i]!;
      const pt = {
        time: drawing.p1.time + (drawing.p2.time - drawing.p1.time) * level,
        price: drawing.p1.price + (drawing.p2.price - drawing.p1.price) * level,
      };
      const seg = linePixels(chart, series, drawing.p1, pt, width, height, "right");
      if (!seg) continue;
      ctx.strokeStyle = selected ? SELECTED_COLOR : fibLevelColor(i);
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1;
      strokeLine(ctx, seg[0].x, seg[0].y, seg[1].x, seg[1].y);
      ctx.globalAlpha = 1;
    }
  } else if (drawing.variant === "circles") {
    const cx = (c1.x + c2.x) / 2;
    const cy = (c1.y + c2.y) / 2;
    const rx = Math.abs(c2.x - c1.x) / 2;
    const ry = Math.abs(c2.y - c1.y) / 2;
    for (let i = 0; i < FIB_LEVELS.length; i++) {
      const level = FIB_LEVELS[i]!;
      ctx.strokeStyle = selected ? SELECTED_COLOR : fibLevelColor(i);
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * level || 1, ry * level || 1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  } else {
    for (let i = 0; i < FIB_LEVELS.length; i++) {
      const level = FIB_LEVELS[i]!;
      const price = drawing.p2.price + (drawing.p1.price - drawing.p2.price) * level;
      const y = series.priceToCoordinate(price);
      if (y == null) continue;
      const levelColor = selected ? SELECTED_COLOR : fibLevelColor(i);
      ctx.strokeStyle = levelColor;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1;
      strokeLine(ctx, minX, y, maxX, y);
      ctx.globalAlpha = 1;
      ctx.fillStyle = levelColor;
      ctx.font = "9px sans-serif";
      ctx.fillText(`${(level * 100).toFixed(1)}%`, maxX + 4, y + 3);
    }
    if (drawing.variant === "channel") {
      const off = (drawing.p2.price - drawing.p1.price) * 0.382;
      const p3 = offsetPoint(drawing.p1, drawing.p1, drawing.p2, off);
      const p4 = offsetPoint(drawing.p2, drawing.p1, drawing.p2, off);
      const chSeg1 = linePixels(chart, series, drawing.p1, drawing.p2, width, height, "segment");
      const chSeg2 = linePixels(chart, series, p3, p4, width, height, "segment");
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      if (chSeg1) strokeLine(ctx, chSeg1[0].x, chSeg1[0].y, chSeg1[1].x, chSeg1[1].y);
      if (chSeg2) strokeLine(ctx, chSeg2[0].x, chSeg2[0].y, chSeg2[1].x, chSeg2[1].y);
      ctx.setLineDash([]);
    }
  }

  const baseSeg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, "segment");
  if (baseSeg) {
    ctx.strokeStyle = color;
    ctx.lineWidth = drawingStrokeWidth(drawing, selected);
    strokeLine(ctx, baseSeg[0].x, baseSeg[0].y, baseSeg[1].x, baseSeg[1].y);
  }
}

function paintGann(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "gann" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const x1 = Math.min(c1.x, c2.x);
  const x2 = Math.max(c1.x, c2.x);
  const y1 = Math.min(c1.y, c2.y);
  const y2 = Math.max(c1.y, c2.y);

  if (drawing.variant === "box" || drawing.variant === "square") {
    ctx.strokeStyle = color;
    ctx.lineWidth = drawingStrokeWidth(drawing, selected);
    if (drawing.variant === "box") {
      ctx.fillStyle = `${color}18`;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    const steps = 4;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      strokeLine(ctx, x1, y1 + (y2 - y1) * t, x2, y1 + (y2 - y1) * t);
      strokeLine(ctx, x1 + (x2 - x1) * t, y1, x1 + (x2 - x1) * t, y2);
    }
    ctx.globalAlpha = 1;
  }

  if (drawing.variant === "fan") {
    const angles = [1 / 8, 1 / 4, 1 / 3, 1 / 2, 1];
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.85;
    for (const ratio of angles) {
      const pt = {
        time: drawing.p1.time + (drawing.p2.time - drawing.p1.time) * ratio,
        price: drawing.p1.price + (drawing.p2.price - drawing.p1.price) * ratio,
      };
      const seg = linePixels(chart, series, drawing.p1, pt, width, height, "right");
      if (!seg) continue;
      strokeLine(ctx, seg[0].x, seg[0].y, seg[1].x, seg[1].y);
    }
    ctx.globalAlpha = 1;
  }
}

function paintRect(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "rect" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
): void {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const x1 = Math.min(c1.x, c2.x);
  const y1 = Math.min(c1.y, c2.y);
  const w = Math.abs(c2.x - c1.x);
  const h = Math.abs(c2.y - c1.y);

  if (drawing.variant === "brush" || drawing.variant === "highlighter") {
    const path = drawing.path ?? [drawing.p1, drawing.p2];
    const coords = path.map((pt) => toPixel(chart, series, pt)).filter(Boolean);
    if (coords.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = drawing.variant === "highlighter" ? 8 : 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = drawing.variant === "highlighter" ? 0.35 : 1;
    ctx.beginPath();
    ctx.moveTo(coords[0]!.x, coords[0]!.y);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i]!.x, coords[i]!.y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }

  if (drawing.variant === "circle") {
    const cx = (c1.x + c2.x) / 2;
    const cy = (c1.y + c2.y) / 2;
    ctx.fillStyle = `${color}15`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = drawingStrokeWidth(drawing, selected);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = `${color}15`;
  ctx.fillRect(x1, y1, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  ctx.strokeRect(x1, y1, w, h);
}

function paintText(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "text" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
): void {
  const px = toPixel(chart, series, drawing.point);
  if (!px) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));
  const isCallout = drawing.variant === "callout";
  const isNote = drawing.variant === "note";

  ctx.fillStyle = color;
  ctx.font = "11px sans-serif";
  if (isCallout || isNote) {
    const boxW = Math.max(60, drawing.text.length * 6 + 16);
    const boxH = 22;
    const bx = px.x + 8;
    const by = px.y - boxH - 4;
    ctx.fillStyle = "#1e222d";
    ctx.globalAlpha = 0.92;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, boxW, boxH);
    ctx.fillStyle = color;
    ctx.fillText(drawing.text, bx + 8, by + 14);
    ctx.beginPath();
    ctx.moveTo(px.x, px.y);
    ctx.lineTo(bx, by + boxH);
    ctx.stroke();
  } else {
    ctx.fillText(drawing.text, px.x + 4, px.y + (isNote ? 2 : 4));
  }
}

function paintPattern(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "pattern" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
): void {
  const coords = drawing.points.map((p) => toPixel(chart, series, p));
  if (coords.some((c) => !c)) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));

  ctx.strokeStyle = color;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  ctx.beginPath();
  ctx.moveTo(coords[0]!.x, coords[0]!.y);
  for (let i = 1; i < coords.length; i++) {
    ctx.lineTo(coords[i]!.x, coords[i]!.y);
  }
  ctx.stroke();
}

function paintPosition(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "position" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
): void {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return;

  const isLong = drawing.variant === "long";
  const isShort = drawing.variant === "short";
  const isMeasure = drawing.variant === "measure";
  const fill = isLong ? "#26a69a33" : isShort ? "#ef535033" : "#787b8622";
  const stroke = isLong ? "#26a69a" : isShort ? "#ef5350" : strokeColor(selected, effectiveDrawingColor(drawing));
  const x1 = Math.min(c1.x, c2.x);
  const y1 = Math.min(c1.y, c2.y);
  const w = Math.abs(c2.x - c1.x);
  const h = Math.abs(c2.y - c1.y);

  ctx.fillStyle = fill;
  ctx.fillRect(x1, y1, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = drawingStrokeWidth(drawing, selected);
  if (isMeasure) ctx.setLineDash([5, 4]);
  ctx.strokeRect(x1, y1, w, h);
  ctx.setLineDash([]);

  ctx.fillStyle = stroke;
  ctx.font = "10px sans-serif";
  if (isMeasure) {
    ctx.textAlign = "center";
    ctx.fillText(formatMeasure(drawing.p1, drawing.p2), x1 + w / 2, y1 - 4);
    ctx.textAlign = "start";
  } else {
    ctx.fillText(isLong ? "LONG" : "SHORT", x1 + 4, y1 + 12);
  }
}

function paintIcon(
  ctx: CanvasRenderingContext2D,
  drawing: Extract<ChartDrawing, { kind: "icon" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
): void {
  const px = toPixel(chart, series, drawing.point);
  if (!px) return;
  const color = strokeColor(selected, effectiveDrawingColor(drawing));

  ctx.fillStyle = color;
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(drawing.emoji, px.x, px.y);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

function paintDrawing(
  ctx: CanvasRenderingContext2D,
  drawing: ChartDrawing,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
): void {
  switch (drawing.kind) {
    case "line":
      paintLine(ctx, drawing, chart, series, width, height, selected);
      break;
    case "hline":
      paintHline(ctx, drawing, chart, series, width, selected);
      break;
    case "vline":
      paintVline(ctx, drawing, chart, height, selected);
      break;
    case "cross":
      paintCross(ctx, drawing, chart, series, width, height, selected);
      break;
    case "channel":
      paintChannel(ctx, drawing, chart, series, width, height, selected);
      break;
    case "pitchfork":
      paintPitchfork(ctx, drawing, chart, series, width, height, selected);
      break;
    case "fib":
      paintFib(ctx, drawing, chart, series, width, height, selected);
      break;
    case "gann":
      paintGann(ctx, drawing, chart, series, width, height, selected);
      break;
    case "rect":
      paintRect(ctx, drawing, chart, series, selected);
      break;
    case "text":
      paintText(ctx, drawing, chart, series, selected);
      break;
    case "pattern":
      paintPattern(ctx, drawing, chart, series, selected);
      break;
    case "position":
      paintPosition(ctx, drawing, chart, series, selected);
      break;
    case "icon":
      paintIcon(ctx, drawing, chart, series, selected);
      break;
    default:
      break;
  }
}

function paintDraftPreview(
  ctx: CanvasRenderingContext2D,
  draft: DrawingDraftState,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
): void {
  const points = [...draft.points];
  if (draft.cursor && draft.tool !== "shape-brush" && draft.tool !== "shape-highlighter") {
    points.push(draft.cursor);
  }
  const pathPoints =
    draft.pathPoints ??
    (draft.cursor ? [...(draft.pathPoints ?? []), draft.cursor] : draft.pathPoints);
  const previewColor = colorForDrawTool(draft.tool);

  ctx.setLineDash([5, 4]);

  if (pathPoints && pathPoints.length >= 2) {
    const coords = pathPoints.map((pt) => toPixel(chart, series, pt)).filter(Boolean);
    if (coords.length >= 2) {
      ctx.strokeStyle = previewColor;
      ctx.lineWidth = draft.tool === "shape-highlighter" ? 8 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = draft.tool === "shape-highlighter" ? 0.35 : 1;
      ctx.beginPath();
      ctx.moveTo(coords[0]!.x, coords[0]!.y);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i]!.x, coords[i]!.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.setLineDash([]);
    return;
  }

  if (points.length === 0) {
    ctx.setLineDash([]);
    return;
  }

  const previewDrawing = {
    id: "draft",
    coin: "",
    color: previewColor,
    createdAt: 0,
  } as ChartDrawing;

  if (points.length === 1) {
    const px = toPixel(chart, series, points[0]!);
    if (px) {
      ctx.strokeStyle = previewColor;
      ctx.fillStyle = previewColor;
      ctx.lineWidth = 1;
      if (draft.tool === "line-vline") {
        strokeLine(ctx, px.x, 0, px.x, height);
      } else if (draft.tool === "line-hline" || draft.tool === "line-hray") {
        const y = series.priceToCoordinate(points[0]!.price);
        if (y != null) strokeLine(ctx, 0, y, width, y);
      } else {
        ctx.beginPath();
        ctx.arc(px.x, px.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.setLineDash([]);
    return;
  }

  const temp = {
    ...previewDrawing,
    p1: points[0]!,
    p2: points[points.length - 1]!,
  };

  ctx.setLineDash([]);

  if (draft.tool.startsWith("line-") || draft.tool === "channel-regression") {
    paintLine(
      ctx,
      {
        ...temp,
        kind: "line",
        extend:
          draft.tool === "line-ray"
            ? "right"
            : draft.tool === "line-extended"
              ? "both"
              : "segment",
        variant: "trend",
      },
      chart,
      series,
      width,
      height,
      false,
    );
    if (points.length >= 2) {
      paintEndpointHandles(
        ctx,
        chart,
        series,
        {
          ...temp,
          kind: "line",
          extend: "segment",
          variant: "trend",
        } as ChartDrawing,
      );
    }
    return;
  }

  if (points.length >= 3 && draft.tool.startsWith("channel-")) {
    paintChannel(
      ctx,
      { ...temp, kind: "channel", p3: points[2]!, variant: "parallel" },
      chart,
      series,
      width,
      height,
      false,
    );
    return;
  }

  if (points.length >= 3 && draft.tool.startsWith("pitchfork")) {
    paintPitchfork(
      ctx,
      { ...temp, kind: "pitchfork", p3: points[2]!, variant: "standard" },
      chart,
      series,
      width,
      height,
      false,
    );
    return;
  }

  if (draft.tool.startsWith("fib-") || draft.tool.startsWith("gann-")) {
    paintFib(
      ctx,
      { ...temp, kind: "fib", variant: "retracement" },
      chart,
      series,
      width,
      height,
      false,
    );
    return;
  }

  if (draft.tool.startsWith("shape-")) {
    paintRect(
      ctx,
      { ...temp, kind: "rect", variant: draft.tool === "shape-circle" ? "circle" : "rectangle" },
      chart,
      series,
      false,
    );
    return;
  }

  if (draft.tool.startsWith("pred-") || draft.tool === "measure") {
    paintPosition(
      ctx,
      {
        ...temp,
        kind: "position",
        variant: draft.tool === "pred-short" ? "short" : draft.tool === "pred-long" ? "long" : "measure",
      },
      chart,
      series,
      false,
    );
    return;
  }

  if (points.length >= 2) {
    const coords = points.map((p) => toPixel(chart, series, p)).filter(Boolean);
    if (coords.length >= 2) {
      ctx.strokeStyle = previewColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(coords[0]!.x, coords[0]!.y);
      for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i]!.x, coords[i]!.y);
      }
      ctx.stroke();
      ctx.fillStyle = previewColor;
      for (const c of coords) {
        ctx.beginPath();
        ctx.arc(c!.x, c!.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export function paintDrawingsOnTarget(
  target: CanvasRenderingTarget2D,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  state: DrawingPaintState,
): void {
  if (state.hidden) return;
  if (
    state.drawings.length === 0 &&
    !state.draft &&
    !state.liveEditDrawing
  ) {
    return;
  }

  target.useMediaCoordinateSpace(({ context, mediaSize }) => {
    const { width, height } = mediaSize;
    for (const drawing of state.drawings) {
      if (state.skipId && drawing.id === state.skipId) continue;
      const selected = state.selectedId === drawing.id;
      paintDrawing(
        context,
        drawing,
        chart,
        series,
        width,
        height,
        selected,
      );
      if (selected) {
        paintEndpointHandles(context, chart, series, drawing);
      }
    }
    if (state.liveEditDrawing) {
      const selected = state.selectedId === state.liveEditDrawing.id;
      paintDrawing(
        context,
        state.liveEditDrawing,
        chart,
        series,
        width,
        height,
        selected,
      );
      if (selected) {
        paintEndpointHandles(context, chart, series, state.liveEditDrawing);
      }
    }
    if (state.draft) {
      paintDraftPreview(context, state.draft, chart, series, width, height);
    }
  });
}
