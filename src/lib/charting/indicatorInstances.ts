import { INDICATOR_BY_ID, migrateIndicatorId } from "@/lib/charting/indicatorCatalog";
import { defaultIndicatorParams, type IndicatorParamValues } from "@/lib/charting/indicatorParams";
import {
  DEFAULT_INDICATOR_DISPLAY,
  type IndicatorDisplaySettings,
} from "@/lib/charting/indicatorDisplay";

const INSTANCE_SEP = "#";

/** Indicators that stay one-per-chart (toggle on second click). */
const SINGLETON_INDICATORS = new Set(["vol_profile_fixed", "vol_profile_visible"]);

const INSTANCE_COLOR_PALETTE = [
  "#f59e0b",
  "#2962ff",
  "#e879f9",
  "#22c55e",
  "#f23645",
  "#cbd5e1",
  "#14b8a6",
  "#a855f7",
];

/** Common HL-style period presets when stacking MAs. */
const MA_PERIOD_PRESETS: Record<string, number[]> = {
  sma: [20, 50, 200],
  ema: [21, 50, 200],
  ema_9: [9, 21, 50],
  ema_50: [50, 100, 200],
  smma: [7, 21, 50],
  wma: [20, 50, 200],
  hma: [21, 55, 89],
  vwma: [20, 50, 200],
  tema: [20, 50, 200],
  dema: [20, 50, 200],
  linreg: [20, 50, 100],
};

export function indicatorBaseType(instanceOrTypeId: string): string {
  const migrated = migrateIndicatorId(instanceOrTypeId);
  const sep = migrated.indexOf(INSTANCE_SEP);
  if (sep >= 0) return migrated.slice(0, sep);
  return migrated;
}

export function createIndicatorInstanceId(baseType: string): string {
  const base = migrateIndicatorId(baseType);
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${base}${INSTANCE_SEP}${suffix}`;
}

export function isIndicatorInstanceId(id: string): boolean {
  return indicatorBaseType(id) !== migrateIndicatorId(id) || id.includes(INSTANCE_SEP);
}

export function allowsMultipleInstances(baseType: string): boolean {
  return !SINGLETON_INDICATORS.has(baseType);
}

export function isImplementedIndicatorInstance(id: string): boolean {
  return INDICATOR_BY_ID[indicatorBaseType(id)]?.implemented === true;
}

export function countIndicatorInstances(active: string[], baseType: string): number {
  return active.filter((id) => indicatorBaseType(id) === baseType).length;
}

export function findIndicatorInstance(active: string[], baseType: string): string | undefined {
  return active.find((id) => indicatorBaseType(id) === baseType);
}

export function defaultParamsForNewInstance(
  baseType: string,
  existing: string[],
): IndicatorParamValues {
  const defaults = defaultIndicatorParams(baseType);
  const count = countIndicatorInstances(existing, baseType);
  const presets = MA_PERIOD_PRESETS[baseType];
  if (presets && count < presets.length) {
    return { ...defaults, period: presets[count]! };
  }
  return defaults;
}

export function defaultDisplayForNewInstance(
  baseType: string,
  instanceId: string,
  existing: string[],
): IndicatorDisplaySettings {
  const base = INDICATOR_BY_ID[baseType];
  const sameType = existing.filter((id) => indicatorBaseType(id) === baseType);
  const idx = sameType.length;
  const paletteColor = INSTANCE_COLOR_PALETTE[idx % INSTANCE_COLOR_PALETTE.length];
  return {
    ...DEFAULT_INDICATOR_DISPLAY,
    color: idx === 0 ? base?.color : paletteColor,
  };
}
