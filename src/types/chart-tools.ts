/** Chart studies, drawings, and trade overlays. */

export type ChartIndicatorId = "ema9" | "ema21" | "ema50" | "vwap";

export type ChartDrawTool = "none" | "hline";

export interface ChartHorizontalLine {
  id: string;
  coin: string;
  price: number;
  color: string;
  label: string;
  createdAt: number;
}

export interface ChartTicketPreview {
  limit?: number;
  stop?: number;
}

export const CHART_INDICATOR_META: Record<
  ChartIndicatorId,
  { label: string; period?: number; color: string }
> = {
  ema9: { label: "EMA 9", period: 9, color: "#f59e0b" },
  ema21: { label: "EMA 21", period: 21, color: "#a855f7" },
  ema50: { label: "EMA 50", period: 50, color: "#2962ff" },
  vwap: { label: "VWAP", color: "#e879f9" },
};
