import type { ChartDrawTool, ChartDrawing } from "@/types/chart-tools";

export const LEGACY_DEFAULT_COLOR = "#787b86";

export const SELECTED_COLOR = "#62eec4";

/** TradingView-style fib level line colors (0% → 100%). */
export const FIB_LEVEL_COLORS = [
  "#787b86",
  "#f23645",
  "#81b441",
  "#2962ff",
  "#9c27b0",
  "#ff9800",
  "#787b86",
];

export function colorForDrawTool(tool: ChartDrawTool): string {
  if (tool.startsWith("fib-")) return "#2962ff";
  if (tool.startsWith("gann-")) return "#f7931a";
  if (tool.startsWith("line-")) return "#62eec4";
  if (tool.startsWith("channel-") || tool.startsWith("pitchfork")) return "#787b86";
  if (tool === "shape-highlighter") return "#f0b90b";
  if (tool.startsWith("shape-")) return "#5b9cf6";
  if (tool.startsWith("anno-")) return "#d1d4dc";
  if (tool.startsWith("pat-")) return "#ab47bc";
  if (tool === "pred-long") return "#26a69a";
  if (tool === "pred-short") return "#ef5350";
  if (tool === "pred-measure" || tool === "measure") return "#787b86";
  if (tool === "icon-star") return "#f5c84c";
  return "#787b86";
}

export function fibLevelColor(index: number): string {
  return FIB_LEVEL_COLORS[index % FIB_LEVEL_COLORS.length] ?? "#2962ff";
}

export function effectiveDrawingColor(drawing: ChartDrawing): string {
  if (drawing.color && drawing.color !== LEGACY_DEFAULT_COLOR) return drawing.color;
  switch (drawing.kind) {
    case "line":
      return "#62eec4";
    case "fib":
      return "#2962ff";
    case "gann":
      return "#f7931a";
    case "rect":
      return drawing.variant === "highlighter" ? "#f0b90b" : "#5b9cf6";
    case "text":
      return "#d1d4dc";
    case "pattern":
      return "#ab47bc";
    case "position":
      return drawing.variant === "long"
        ? "#26a69a"
        : drawing.variant === "short"
          ? "#ef5350"
          : LEGACY_DEFAULT_COLOR;
    case "icon":
      return "#f5c84c";
    default:
      return LEGACY_DEFAULT_COLOR;
  }
}
