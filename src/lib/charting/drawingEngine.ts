import type { ChartDrawTool, ChartDrawing } from "@/types/chart-tools";
import type { ChartPoint } from "@/lib/charting/chartDrawing";

export type DrawInteraction =
  | "select"
  | "drag"
  | "click"
  | "clicks"
  | "path"
  | "erase"
  | "zoom";

export interface DrawToolSpec {
  id: ChartDrawTool;
  interaction: DrawInteraction;
  clickCount?: number;
  promptText?: boolean;
}

const LINE_COLOR = "#787b86";

export const DRAW_TOOL_SPECS: Record<string, DrawToolSpec> = {
  none: { id: "none", interaction: "select" },
  crosshair: { id: "crosshair", interaction: "select" },
  arrow: { id: "arrow", interaction: "select" },
  eraser: { id: "eraser", interaction: "erase" },
  "cursor-cross": { id: "none", interaction: "select" },
  "cursor-dot": { id: "crosshair", interaction: "select" },
  "cursor-arrow": { id: "arrow", interaction: "select" },
  "cursor-eraser": { id: "eraser", interaction: "erase" },
  "line-trend": { id: "line-trend", interaction: "drag" },
  "line-ray": { id: "line-ray", interaction: "drag" },
  "line-info": { id: "line-info", interaction: "drag" },
  "line-extended": { id: "line-extended", interaction: "drag" },
  "line-angle": { id: "line-angle", interaction: "drag" },
  "line-hline": { id: "line-hline", interaction: "drag" },
  "line-hray": { id: "line-hray", interaction: "drag" },
  "line-vline": { id: "line-vline", interaction: "click" },
  "line-cross": { id: "line-cross", interaction: "click" },
  "channel-parallel": { id: "channel-parallel", interaction: "clicks", clickCount: 3 },
  "channel-regression": { id: "channel-regression", interaction: "drag" },
  "channel-flat": { id: "channel-flat", interaction: "clicks", clickCount: 3 },
  "channel-disjoint": { id: "channel-disjoint", interaction: "clicks", clickCount: 3 },
  pitchfork: { id: "pitchfork", interaction: "clicks", clickCount: 3 },
  "pitchfork-schiff": { id: "pitchfork-schiff", interaction: "clicks", clickCount: 3 },
  "pitchfork-modified": { id: "pitchfork-modified", interaction: "clicks", clickCount: 3 },
  "pitchfork-inside": { id: "pitchfork-inside", interaction: "clicks", clickCount: 3 },
  "fib-retracement": { id: "fib-retracement", interaction: "drag" },
  "fib-extension": { id: "fib-extension", interaction: "drag" },
  "fib-channel": { id: "fib-channel", interaction: "drag" },
  "fib-timezone": { id: "fib-timezone", interaction: "drag" },
  "fib-fan": { id: "fib-fan", interaction: "drag" },
  "fib-time": { id: "fib-time", interaction: "drag" },
  "fib-circles": { id: "fib-circles", interaction: "drag" },
  "gann-box": { id: "gann-box", interaction: "drag" },
  "gann-fan": { id: "gann-fan", interaction: "drag" },
  "gann-square": { id: "gann-square", interaction: "drag" },
  "shape-brush": { id: "shape-brush", interaction: "path" },
  "shape-highlighter": { id: "shape-highlighter", interaction: "path" },
  "shape-rectangle": { id: "shape-rectangle", interaction: "drag" },
  "shape-circle": { id: "shape-circle", interaction: "drag" },
  "anno-text": { id: "anno-text", interaction: "click", promptText: true },
  "anno-note": { id: "anno-note", interaction: "click", promptText: true },
  "anno-callout": { id: "anno-callout", interaction: "click", promptText: true },
  "pat-xabcd": { id: "pat-xabcd", interaction: "clicks", clickCount: 5 },
  "pat-hs": { id: "pat-hs", interaction: "clicks", clickCount: 5 },
  "pat-elliott": { id: "pat-elliott", interaction: "clicks", clickCount: 5 },
  "pred-long": { id: "pred-long", interaction: "drag" },
  "pred-short": { id: "pred-short", interaction: "drag" },
  "pred-measure": { id: "pred-measure", interaction: "drag" },
  "icon-star": { id: "icon-star", interaction: "click" },
  measure: { id: "pred-measure", interaction: "drag" },
  zoom: { id: "zoom", interaction: "zoom" },
};

export function specForTool(tool: ChartDrawTool): DrawToolSpec {
  return DRAW_TOOL_SPECS[tool] ?? { id: tool, interaction: "drag" };
}

export function isDrawingTool(tool: ChartDrawTool): boolean {
  const spec = specForTool(tool);
  return !["select", "erase", "zoom"].includes(spec.interaction);
}

export function isActiveDrawCapture(tool: ChartDrawTool): boolean {
  const spec = specForTool(tool);
  return spec.interaction === "drag" || spec.interaction === "path";
}

export function newDrawingId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createDrawing(
  tool: ChartDrawTool,
  coin: string,
  points: ChartPoint[],
  text?: string,
): ChartDrawing | null {
  if (!points.length) return null;
  const color = LINE_COLOR;
  const createdAt = Date.now();

  switch (tool) {
    case "line-trend":
      if (points.length < 2) return null;
      return { id: newDrawingId("ln"), coin, kind: "line", p1: points[0]!, p2: points[1]!, extend: "both", variant: "trend", color, createdAt };
    case "line-ray":
      if (points.length < 2) return null;
      return { id: newDrawingId("ln"), coin, kind: "line", p1: points[0]!, p2: points[1]!, extend: "right", variant: "ray", color, createdAt };
    case "line-info":
      if (points.length < 2) return null;
      return { id: newDrawingId("ln"), coin, kind: "line", p1: points[0]!, p2: points[1]!, extend: "segment", variant: "info", color, createdAt };
    case "line-extended":
      if (points.length < 2) return null;
      return { id: newDrawingId("ln"), coin, kind: "line", p1: points[0]!, p2: points[1]!, extend: "both", variant: "extended", color, createdAt };
    case "line-angle":
      if (points.length < 2) return null;
      return { id: newDrawingId("ln"), coin, kind: "line", p1: points[0]!, p2: points[1]!, extend: "segment", variant: "angle", color, createdAt };
    case "channel-regression":
      if (points.length < 2) return null;
      return { id: newDrawingId("ln"), coin, kind: "line", p1: points[0]!, p2: points[1]!, extend: "both", variant: "regression", color, createdAt };
    case "line-hline":
      return { id: newDrawingId("hl"), coin, kind: "hline", price: points[points.length - 1]!.price, color, createdAt };
    case "line-hray":
      if (points.length < 2) return null;
      return { id: newDrawingId("hl"), coin, kind: "hline", price: points[1]!.price, fromTime: points[0]!.time, color, createdAt };
    case "line-vline":
      return { id: newDrawingId("vl"), coin, kind: "vline", time: points[0]!.time, color, createdAt };
    case "line-cross":
      return { id: newDrawingId("cr"), coin, kind: "cross", time: points[0]!.time, price: points[0]!.price, color, createdAt };
    case "channel-parallel":
      if (points.length < 3) return null;
      return { id: newDrawingId("ch"), coin, kind: "channel", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "parallel", color, createdAt };
    case "channel-flat":
      if (points.length < 3) return null;
      return { id: newDrawingId("ch"), coin, kind: "channel", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "flat", color, createdAt };
    case "channel-disjoint":
      if (points.length < 3) return null;
      return { id: newDrawingId("ch"), coin, kind: "channel", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "disjoint", color, createdAt };
    case "pitchfork":
      if (points.length < 3) return null;
      return { id: newDrawingId("pf"), coin, kind: "pitchfork", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "standard", color, createdAt };
    case "pitchfork-schiff":
      if (points.length < 3) return null;
      return { id: newDrawingId("pf"), coin, kind: "pitchfork", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "schiff", color, createdAt };
    case "pitchfork-modified":
      if (points.length < 3) return null;
      return { id: newDrawingId("pf"), coin, kind: "pitchfork", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "modified", color, createdAt };
    case "pitchfork-inside":
      if (points.length < 3) return null;
      return { id: newDrawingId("pf"), coin, kind: "pitchfork", p1: points[0]!, p2: points[1]!, p3: points[2]!, variant: "inside", color, createdAt };
    case "fib-retracement":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "retracement", color, createdAt };
    case "fib-extension":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "extension", color, createdAt };
    case "fib-channel":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "channel", color, createdAt };
    case "fib-timezone":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "timezone", color, createdAt };
    case "fib-fan":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "fan", color, createdAt };
    case "fib-time":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "time", color, createdAt };
    case "fib-circles":
      if (points.length < 2) return null;
      return { id: newDrawingId("fb"), coin, kind: "fib", p1: points[0]!, p2: points[1]!, variant: "circles", color, createdAt };
    case "gann-box":
      if (points.length < 2) return null;
      return { id: newDrawingId("gn"), coin, kind: "gann", p1: points[0]!, p2: points[1]!, variant: "box", color, createdAt };
    case "gann-fan":
      if (points.length < 2) return null;
      return { id: newDrawingId("gn"), coin, kind: "gann", p1: points[0]!, p2: points[1]!, variant: "fan", color, createdAt };
    case "gann-square":
      if (points.length < 2) return null;
      return { id: newDrawingId("gn"), coin, kind: "gann", p1: points[0]!, p2: points[1]!, variant: "square", color, createdAt };
    case "shape-rectangle":
      if (points.length < 2) return null;
      return { id: newDrawingId("sh"), coin, kind: "rect", p1: points[0]!, p2: points[1]!, variant: "rectangle", color, createdAt };
    case "shape-circle":
      if (points.length < 2) return null;
      return { id: newDrawingId("sh"), coin, kind: "rect", p1: points[0]!, p2: points[1]!, variant: "circle", color, createdAt };
    case "shape-brush":
    case "shape-highlighter":
      if (points.length < 2) return null;
      return {
        id: newDrawingId("sh"),
        coin,
        kind: "rect",
        p1: points[0]!,
        p2: points[points.length - 1]!,
        variant: tool === "shape-highlighter" ? "highlighter" : "brush",
        path: points,
        color,
        createdAt,
      };
    case "anno-text":
      return { id: newDrawingId("tx"), coin, kind: "text", point: points[0]!, text: text?.trim() || "Text", variant: "text", color, createdAt };
    case "anno-note":
      return { id: newDrawingId("tx"), coin, kind: "text", point: points[0]!, text: text?.trim() || "Note", variant: "note", color, createdAt };
    case "anno-callout":
      return { id: newDrawingId("tx"), coin, kind: "text", point: points[0]!, text: text?.trim() || "Callout", variant: "callout", color, createdAt };
    case "pat-xabcd":
    case "pat-hs":
    case "pat-elliott":
      if (points.length < 3) return null;
      return {
        id: newDrawingId("pt"),
        coin,
        kind: "pattern",
        points,
        variant: tool === "pat-hs" ? "hs" : tool === "pat-elliott" ? "elliott" : "xabcd",
        color,
        createdAt,
      };
    case "pred-long":
    case "pred-short":
    case "pred-measure":
    case "measure":
      if (points.length < 2) return null;
      return {
        id: newDrawingId("ps"),
        coin,
        kind: "position",
        p1: points[0]!,
        p2: points[1]!,
        variant: tool === "pred-short" ? "short" : tool === "pred-long" ? "long" : "measure",
        color,
        createdAt,
      };
    case "icon-star":
      return { id: newDrawingId("ic"), coin, kind: "icon", point: points[0]!, emoji: "★", color, createdAt };
    default:
      return null;
  }
}

export function migrateLegacyDrawings(
  coin: string,
  hlines: { id: string; price: number; color: string; createdAt: number }[],
  trends: { id: string; time1: number; price1: number; time2: number; price2: number; color: string; createdAt: number }[],
): ChartDrawing[] {
  const out: ChartDrawing[] = [];
  for (const t of trends) {
    out.push({
      id: t.id,
      coin,
      kind: "line",
      p1: { time: t.time1, price: t.price1 },
      p2: { time: t.time2, price: t.price2 },
      extend: "both",
      variant: "trend",
      color: t.color,
      createdAt: t.createdAt,
    });
  }
  for (const h of hlines) {
    out.push({ id: h.id, coin, kind: "hline", price: h.price, color: h.color, createdAt: h.createdAt });
  }
  return out;
}
