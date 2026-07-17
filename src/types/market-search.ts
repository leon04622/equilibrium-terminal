export type MarketSearchTab =
  | "favorites"
  | "all"
  | "perps"
  | "spot"
  | "crypto"
  | "tradfi"
  | "hip3"
  | "trending"
  | "prelaunch";

export interface MarketContextRow {
  coin: string;
  symbol: string;
  market: "perp" | "spot";
  displayName: string;
  maxLeverage: number | null;
  isHip3: boolean;
  lastPrice: number | null;
  markPrice: number | null;
  oraclePrice: number | null;
  change24hAbs: number | null;
  change24hPct: number | null;
  funding8hPct: number | null;
  volume24hUsd: number | null;
  openInterestUsd: number | null;
}

export interface MarketContextsSnapshot {
  rows: MarketContextRow[];
  updatedAt: number;
}
