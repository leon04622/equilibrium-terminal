import type { ChartDrawing, DrawingLineStyle } from "@/types/chart-tools";

export function drawingStrokeWidth(drawing: ChartDrawing, selected: boolean): number {
  return drawing.strokeWidth ?? (selected ? 2 : 1.5);
}

export function drawingStrokeDash(lineStyle?: DrawingLineStyle): string | undefined {
  if (lineStyle === "dashed") return "6 4";
  if (lineStyle === "dotted") return "2 3";
  return undefined;
}

export function applyDrawingLineDash(
  ctx: CanvasRenderingContext2D,
  lineStyle?: DrawingLineStyle,
): void {
  if (lineStyle === "dashed") ctx.setLineDash([6, 4]);
  else if (lineStyle === "dotted") ctx.setLineDash([2, 3]);
  else ctx.setLineDash([]);
}

export function isDrawingLocked(drawing: ChartDrawing): boolean {
  return drawing.locked === true;
}
