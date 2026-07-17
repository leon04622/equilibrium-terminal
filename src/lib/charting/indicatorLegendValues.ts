import { computeIndicatorOutput } from "@/lib/charting/computeIndicator";
import { INDICATOR_BY_ID, indicatorPane } from "@/lib/charting/indicatorCatalog";
import { indicatorBaseType } from "@/lib/charting/indicatorInstances";
import type { IndicatorDisplaySettings } from "@/lib/charting/indicatorDisplay";
import type { IndicatorParamValues } from "@/lib/charting/indicatorParams";
import type { NormalizedCandle } from "@/types/terminal-schema";

export interface IndicatorLegendValue {
  color: string;
  value: number | null;
}

export function chartLegendIndicatorIds(activeIds: string[]): string[] {
  return activeIds.filter((id) => {
    const base = indicatorBaseType(id);
    const meta = INDICATOR_BY_ID[base];
    if (!meta?.implemented) return false;
    return indicatorPane(id) === "overlay";
  });
}

export function indicatorLegendValues(
  id: string,
  candles: NormalizedCandle[],
  inputSettings?: IndicatorParamValues,
  display?: IndicatorDisplaySettings,
): IndicatorLegendValue[] {
  if (candles.length === 0) return [];
  const base = indicatorBaseType(id);
  const meta = INDICATOR_BY_ID[base];
  if (!meta) return [];

  const output = computeIndicatorOutput(id, candles, meta, inputSettings);
  if (!output) {
    if (base === "vol_profile_fixed" || base === "vol_profile_visible") {
      return [{ color: display?.color ?? meta.color, value: null }];
    }
    return [];
  }

  const overrideColor = display?.color;

  switch (output.type) {
    case "line":
    case "dots":
      return [
        {
          color: overrideColor ?? output.color,
          value: output.data[output.data.length - 1]?.value ?? null,
        },
      ];
    case "histogram": {
      const last = output.data[output.data.length - 1];
      return [{ color: overrideColor ?? output.color, value: last?.value ?? null }];
    }
    case "bands":
      return [
        {
          color: overrideColor ?? output.colors?.[1] ?? meta.color,
          value: output.bands.middle[output.bands.middle.length - 1]?.value ?? null,
        },
      ];
    case "multi":
      return output.series.map((s) => ({
        color: overrideColor ?? s.color,
        value: s.data[s.data.length - 1]?.value ?? null,
      }));
    case "macd": {
      const last = output.macd[output.macd.length - 1];
      return [{ color: overrideColor ?? output.colors?.[0] ?? meta.color, value: last?.value ?? null }];
    }
    default:
      return [];
  }
}

export function formatLegendValue(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (abs >= 1) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
