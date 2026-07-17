import { patternPlan, type PatternDrawPlan, type PatternVariant } from "@/lib/charting/patternGeometry";

export interface PatternPaintOptions {
  color: string;
  lineWidth: number;
  selected?: boolean;
  dashed?: boolean;
}

function strokePath(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], close = false): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  if (close) ctx.closePath();
  ctx.stroke();
}

export function paintPatternPlan(
  ctx: CanvasRenderingContext2D,
  plan: PatternDrawPlan,
  opts: PatternPaintOptions,
): void {
  const { color, lineWidth, dashed } = opts;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  if (dashed) ctx.setLineDash([5, 4]);
  else ctx.setLineDash([]);

  if (plan.fill && plan.fill.length >= 3) {
    ctx.fillStyle = `${color}18`;
    ctx.beginPath();
    ctx.moveTo(plan.fill[0]!.x, plan.fill[0]!.y);
    for (let i = 1; i < plan.fill.length; i++) ctx.lineTo(plan.fill[i]!.x, plan.fill[i]!.y);
    ctx.closePath();
    ctx.fill();
  }

  strokePath(ctx, plan.outline);

  if (plan.neckline) {
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(plan.neckline[0].x, plan.neckline[0].y);
    ctx.lineTo(plan.neckline[1].x, plan.neckline[1].y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.font = "10px sans-serif";
  ctx.fillStyle = color;
  for (const lbl of plan.labels) {
    ctx.textAlign = lbl.anchor === "middle" ? "center" : lbl.anchor;
    ctx.textBaseline = "bottom";
    ctx.fillText(lbl.text, lbl.at.x, lbl.at.y - 6);
  }
}

export function paintPatternVariant(
  ctx: CanvasRenderingContext2D,
  variant: PatternVariant,
  coords: { x: number; y: number }[],
  opts: PatternPaintOptions,
): void {
  const plan = patternPlan(variant, coords);
  if (!plan) {
    if (coords.length >= 2) {
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.lineWidth;
      if (opts.dashed) ctx.setLineDash([5, 4]);
      strokePath(ctx, coords);
      ctx.setLineDash([]);
    }
    return;
  }
  paintPatternPlan(ctx, plan, opts);
}

export function patternPlanToSvgPath(plan: PatternDrawPlan): string {
  if (plan.outline.length === 0) return "";
  return plan.outline.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

export function fillPlanToSvgPath(plan: PatternDrawPlan): string {
  if (!plan.fill || plan.fill.length < 3) return "";
  return plan.fill.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
}
