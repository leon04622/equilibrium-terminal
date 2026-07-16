import type { ChartTimeframe } from "@/types/chart-analytics";

/** Hyperliquid-style short labels on the chart toolbar. */
export const TIMEFRAME_LABEL: Record<ChartTimeframe, string> = {
  "1s": "1s",
  "1m": "1m",
  "3m": "3m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "2h": "2h",
  "4h": "4h",
  "8h": "8h",
  "12h": "12h",
  "1d": "D",
  "3d": "3D",
  "1w": "W",
  "1M": "M",
};

export const CHART_TIMEFRAMES: ChartTimeframe[] = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
];

export const FAST_PREVIEW_BARS = 80;
export const FULL_HISTORY_BARS = 500;

/** Bar counts tuned per interval — higher TFs need fewer bars for the same calendar span. */
export function historyBarsForTimeframe(tf: ChartTimeframe, preview = false): number {
  if (preview) {
    if (tf === "1M" || tf === "1w" || tf === "3d") return 120;
    if (tf === "1d" || tf === "12h" || tf === "8h") return 100;
    return FAST_PREVIEW_BARS;
  }
  if (tf === "1M") return 120;
  if (tf === "1w" || tf === "3d") return 200;
  return FULL_HISTORY_BARS;
}

export function isChartTimeframe(value: string): value is ChartTimeframe {
  return CHART_TIMEFRAMES.includes(value as ChartTimeframe);
}
