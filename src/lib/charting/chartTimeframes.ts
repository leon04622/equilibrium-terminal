import type { ChartTimeframe } from "@/types/chart-analytics";

/** Hyperliquid-supported candle intervals (matches HL trading UI). */
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

export function isChartTimeframe(value: string): value is ChartTimeframe {
  return CHART_TIMEFRAMES.includes(value as ChartTimeframe);
}
