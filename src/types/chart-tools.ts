/** Chart studies, drawings, and trade overlays. */

export type ChartDrawTool =
  | "none"
  | "crosshair"
  | "trendline"
  | "hline"
  | "parallel"
  | "text"
  | "measure";

export interface ChartHorizontalLine {
  id: string;
  coin: string;
  price: number;
  color: string;
  label: string;
  createdAt: number;
}

export interface ChartTrendLine {
  id: string;
  coin: string;
  time1: number;
  price1: number;
  time2: number;
  price2: number;
  color: string;
  createdAt: number;
}

export interface ChartDrawingPrefs {
  magnet: boolean;
  stayInDrawingMode: boolean;
  lockDrawings: boolean;
  hideDrawings: boolean;
}

export const DEFAULT_DRAWING_PREFS: ChartDrawingPrefs = {
  magnet: false,
  stayInDrawingMode: false,
  lockDrawings: false,
  hideDrawings: false,
};

export interface ChartTicketPreview {
  limit?: number;
  stop?: number;
}

/** Catalog-driven indicator id (see indicatorCatalog.ts). */
export type ChartIndicatorId = string;
