import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { computeIndicatorOutput } from "@/lib/charting/computeIndicator";
import { INDICATOR_BY_ID, indicatorPane } from "@/lib/charting/indicatorCatalog";
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
  width: 1 | 2 = 1,
): ISeriesApi<"Line"> {
  let series = map.get(key) as ISeriesApi<"Line"> | undefined;
  if (!series) {
    series = chart.addLineSeries({
      color,
      lineWidth: width,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: false,
    });
    map.set(key, series);
  }
  return series;
}

export function applyOverlayIndicators(
  chart: IChartApi,
  candles: NormalizedCandle[],
  activeIds: string[],
  map: OverlaySeriesMap,
): void {
  const overlayIds = activeIds.filter((id) => indicatorPane(id) === "overlay");
  const keep = new Set<string>();

  for (const id of overlayIds) {
    const meta = INDICATOR_BY_ID[id];
    if (!meta?.implemented) continue;
    const output = computeIndicatorOutput(id, candles, meta);
    if (!output) continue;

    if (output.type === "line" || output.type === "dots") {
      const key = seriesKey(id, output.key);
      keep.add(key);
      ensureLine(chart, map, key, output.color).setData(output.data);
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
        ensureLine(chart, map, key, colors[i] ?? meta.color, part === "middle" ? 1 : 1).setData(data);
      });
    } else if (output.type === "multi") {
      for (const s of output.series) {
        const key = seriesKey(id, s.key);
        keep.add(key);
        const width = s.lineWidth && s.lineWidth <= 2 ? (s.lineWidth as 1 | 2) : 1;
        ensureLine(chart, map, key, s.color, width).setData(s.data);
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

export function volumeProfileActive(activeIds: string[]): boolean {
  return activeIds.includes("vol_profile_fixed") || activeIds.includes("vol_profile_visible");
}
