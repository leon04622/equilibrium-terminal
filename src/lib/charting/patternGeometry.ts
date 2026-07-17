import type { ChartPoint } from "@/lib/charting/chartDrawing";

export type PatternVariant = "hs" | "xabcd" | "elliott";

export interface PixelPoint {
  x: number;
  y: number;
}

export interface PatternDrawPlan {
  /** Main outline (shoulders + head trace). */
  outline: PixelPoint[];
  /** Neckline segment endpoints (extended). */
  neckline: [PixelPoint, PixelPoint] | null;
  /** Optional fill polygon (closed). */
  fill: PixelPoint[] | null;
  labels: Array<{ text: string; at: PixelPoint; anchor: "start" | "middle" | "end" }>;
}

function extendLine(a: PixelPoint, b: PixelPoint, pad = 40): [PixelPoint, PixelPoint] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return [
    { x: a.x - ux * pad, y: a.y - uy * pad },
    { x: b.x + ux * pad, y: b.y + uy * pad },
  ];
}

/** Five clicks: left shoulder, left trough, head, right trough, right shoulder. */
export function headShouldersPlan(coords: PixelPoint[]): PatternDrawPlan | null {
  if (coords.length < 5) return null;
  const [ls, lt, head, rt, rs] = coords;
  const outline = [ls!, lt!, head!, rt!, rs!];
  const neckline = extendLine(lt!, rt!);
  const fill = [ls!, lt!, head!, rt!, rs!, lt!];
  return {
    outline,
    neckline,
    fill,
    labels: [
      { text: "LS", at: ls!, anchor: "middle" },
      { text: "H", at: head!, anchor: "middle" },
      { text: "RS", at: rs!, anchor: "middle" },
    ],
  };
}

export function xabcdPlan(coords: PixelPoint[]): PatternDrawPlan | null {
  if (coords.length < 5) return null;
  const labels = ["X", "A", "B", "C", "D"];
  return {
    outline: coords.slice(0, 5),
    neckline: null,
    fill: null,
    labels: coords.slice(0, 5).map((at, i) => ({
      text: labels[i]!,
      at,
      anchor: "middle" as const,
    })),
  };
}

export function elliottPlan(coords: PixelPoint[]): PatternDrawPlan | null {
  if (coords.length < 5) return null;
  return {
    outline: coords.slice(0, 5),
    neckline: null,
    fill: null,
    labels: coords.slice(0, 5).map((at, i) => ({
      text: String(i + 1),
      at,
      anchor: "middle" as const,
    })),
  };
}

export function patternPlan(
  variant: PatternVariant,
  coords: PixelPoint[],
): PatternDrawPlan | null {
  switch (variant) {
    case "hs":
      return headShouldersPlan(coords);
    case "xabcd":
      return xabcdPlan(coords);
    case "elliott":
      return elliottPlan(coords);
    default:
      return null;
  }
}

/** Partial plan while user is still clicking. */
export function patternPreviewPlan(
  variant: PatternVariant,
  coords: PixelPoint[],
): PatternDrawPlan | null {
  if (coords.length < 2) return null;
  if (variant === "hs" && coords.length >= 2) {
    const partial = headShouldersPlan(
      coords.length >= 5
        ? coords
        : [
            ...coords,
            ...Array.from({ length: 5 - coords.length }, (_, i) =>
              coords[coords.length - 1] ?? { x: 0, y: 0 },
            ),
          ].slice(0, 5),
    );
    if (!partial) return null;
    return {
      ...partial,
      outline: coords,
      fill: coords.length >= 3 ? partial.fill : null,
      neckline: coords.length >= 4 && partial.neckline ? partial.neckline : null,
      labels: partial.labels.slice(0, Math.max(0, coords.length - 2)),
    };
  }
  return {
    outline: coords,
    neckline: null,
    fill: null,
    labels: coords.map((at, i) => ({
      text: variant === "xabcd" ? ["X", "A", "B", "C", "D"][i] ?? "" : String(i + 1),
      at,
      anchor: "middle" as const,
    })),
  };
}

export function patternPointsFromDrawing(points: ChartPoint[]): ChartPoint[] {
  return points;
}
