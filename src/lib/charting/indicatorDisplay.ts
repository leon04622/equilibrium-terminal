import { INDICATOR_BY_ID } from "@/lib/charting/indicatorCatalog";

export interface IndicatorDisplaySettings {
  visible: boolean;
  color?: string;
  lineWidth: 1 | 2 | 3;
  labelsOnScale: boolean;
  valuesInLegend: boolean;
}

export const DEFAULT_INDICATOR_DISPLAY: IndicatorDisplaySettings = {
  visible: true,
  lineWidth: 1,
  labelsOnScale: true,
  valuesInLegend: true,
};

export function defaultIndicatorDisplay(id: string): IndicatorDisplaySettings {
  return {
    ...DEFAULT_INDICATOR_DISPLAY,
    color: INDICATOR_BY_ID[id]?.color,
  };
}

export function resolveIndicatorDisplay(
  id: string,
  saved?: Partial<IndicatorDisplaySettings>,
): IndicatorDisplaySettings {
  const base = defaultIndicatorDisplay(id);
  if (!saved) return base;
  return {
    visible: saved.visible !== false,
    color: saved.color ?? base.color,
    lineWidth: saved.lineWidth === 2 || saved.lineWidth === 3 ? saved.lineWidth : 1,
    labelsOnScale: saved.labelsOnScale !== false,
    valuesInLegend: saved.valuesInLegend !== false,
  };
}

export function sanitizeIndicatorDisplay(
  raw: unknown,
): Record<string, IndicatorDisplaySettings> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, IndicatorDisplaySettings> = {};
  for (const [id, vals] of Object.entries(raw as Record<string, Partial<IndicatorDisplaySettings>>)) {
    if (!INDICATOR_BY_ID[id]) continue;
    out[id] = resolveIndicatorDisplay(id, vals);
  }
  return out;
}
