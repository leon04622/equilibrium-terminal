/** Aggregated builder fill analytics from HL stats-data CSV. */

export interface BuilderFillRow {
  time: string;
  user: string;
  coin: string;
  side: string;
  px: number;
  sz: number;
  builderFee: number;
  notionalUsd: number;
}

export interface BuilderFillDaySummary {
  date: string;
  fillCount: number;
  notionalUsd: number;
  builderFeeUsd: number;
}

export interface BuilderFillAnalytics {
  builderAddress: string;
  daysQueried: number;
  daysWithData: number;
  fillCount: number;
  notionalUsd: number;
  builderFeeUsd: number;
  lastFillAt: string | null;
  byDay: BuilderFillDaySummary[];
  topCoins: Array<{ coin: string; fillCount: number; notionalUsd: number; builderFeeUsd: number }>;
  recentFills: BuilderFillRow[];
  fetchedAt: number;
}
