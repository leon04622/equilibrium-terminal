import type { IChartApi, ISeriesApi } from "lightweight-charts";
import { computeIndicatorOutput } from "@/lib/charting/computeIndicator";
import { INDICATOR_BY_ID, indicatorPane } from "@/lib/charting/indicatorCatalog";
import {
  resolveIndicatorDisplay,
  type IndicatorDisplaySettings,
} from "@/lib/charting/indicatorDisplay";
import type { IndicatorParamValues } from "@/lib/charting/indicatorParams";
import type { NormalizedCandle } from "@/types/terminal-schema";

export type OverlaySeriesMap = Map<string, ISeriesApi<"Line"> | ISeriesApi<"Histogram">>;

function seriesKey(indicatorId: string, part: string): string {
  return `${indicatorId}:${part}`;
}

function removeStaleSeries(chart: IChartApi, map: OverlaySeriesMap, keep: Set<string>): void {
  for (const [key, series] of Array.from(map.entries())) {
    if (!keep.has(key)) {
      chart.removeSeries(series);
      map.delete(key);
    }
  }
}

function ensureLine(
  chart: IChartApi,
  map: OverlaySeriesMap,
  key: string,
  color: string,
  width: 1 | 2 | 3 = 1,
  lastValueVisible = true,
): ISeriesApi<"Line"> {
  let series = map.get(key) as ISeriesApi<"Line"> | undefined;
  if (!series) {
    series = chart.addLineSeries({
      color,
      lineWidth: width <= 2 ? (width as 1 | 2) : 2,
      priceLineVisible: false,
      lastValueVisible,
      crosshairMarkerVisible: false,
    });
    map.set(key, series);
  } else {
    series.applyOptions({
      color,
      lineWidth: width <= 2 ? (width as 1 | 2) : 2,
      lastValueVisible,
    });
  }
  return series;
}

export function applyOverlayIndicators(
  chart: IChartApi,
  candles: NormalizedCandle[],
  activeIds: string[],
  map: OverlaySeriesMap,
  settings: Record<string, IndicatorParamValues> = {},
  display: Record<string, IndicatorDisplaySettings> = {},
): void {
  const overlayIds = activeIds.filter((id) => indicatorPane(id) === "overlay");
  const keep = new Set<string>();

  for (const id of overlayIds) {
    const meta = INDICATOR_BY_ID[id];
    if (!meta?.implemented) continue;

    const disp = resolveIndicatorDisplay(id, display[id]);
    if (!disp.visible) continue;

    if (id === "vol_profile_fixed" || id === "vol_profile_visible") continue;

    const output = computeIndicatorOutput(id, candles, meta, settings[id]);
    if (!output) continue;

    const lineWidth = disp.lineWidth;
    const labelsOnScale = disp.labelsOnScale;

    if (output.type === "line" || output.type === "dots") {
      const key = seriesKey(id, output.key);
      keep.add(key);
      ensureLine(chart, map, key, disp.color ?? output.color, lineWidth, labelsOnScale).setData(
        output.data,
      );
    } else if (output.type === "bands") {
      const colors = output.colors ?? [meta.color, meta.color, meta.color];
      const parts: Array<["upper" | "middle" | "lower", typeof output.bands.upper]> = [
        ["upper", output.bands.upper],
        ["middle", output.bands.middle],
        ["lower", output.bands.lower],
      ];
      parts.forEach(([part, data], i) => {
        const key = seriesKey(id, part);
        keep.add(key);
        ensureLine(
          chart,
          map,
          key,
          disp.color ?? colors[i] ?? meta.color,
          lineWidth,
          labelsOnScale && part === "middle",
        ).setData(data);
      });
    } else if (output.type === "multi") {
      for (const s of output.series) {
        const key = seriesKey(id, s.key);
        keep.add(key);
        const width =
          s.lineWidth && s.lineWidth <= 2 ? (s.lineWidth as 1 | 2) : lineWidth <= 2 ? lineWidth : 2;
        ensureLine(chart, map, key, disp.color ?? s.color, width as 1 | 2 | 3, labelsOnScale).setData(
          s.data,
        );
      }
    }
  }

  removeStaleSeries(chart, map, keep);
}

export function clearOverlayIndicators(chart: IChartApi | null, map: OverlaySeriesMap): void {
  if (!chart) return;
  for (const series of Array.from(map.values())) chart.removeSeries(series);
  map.clear();
}

export function paneIndicatorIds(activeIds: string[]): string[] {
  return activeIds.filter((id) => indicatorPane(id) === "pane" && INDICATOR_BY_ID[id]?.implemented);
}

export function volumeProfileActive(
  activeIds: string[],
  display: Record<string, IndicatorDisplaySettings> = {},
): boolean {
  const ids = ["vol_profile_fixed", "vol_profile_visible"] as const;
  return ids.some((id) => {
    if (!activeIds.includes(id)) return false;
    return resolveIndicatorDisplay(id, display[id]).visible;
  });
}
