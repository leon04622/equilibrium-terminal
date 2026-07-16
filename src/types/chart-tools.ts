/** Chart studies, drawings, and trade overlays. */

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

/** Catalog-driven indicator id (see indicatorCatalog.ts). */
export type ChartIndicatorId = string;
