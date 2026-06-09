/** Phase 17 — Information Dominance & Discovery (Bloomberg-class terminal). */

export type IndexCategory =
  | "asset"
  | "intelligence"
  | "narrative"
  | "macro"
  | "whale"
  | "liquidity"
  | "volatility"
  | "command"
  | "wire"
  | "agent"
  | "watchlist"
  | "workspace"
  | "alert";

export interface IntelligenceIndexEntry {
  id: string;
  category: IndexCategory;
  coin: string | null;
  title: string;
  snippet: string;
  timestamp: number;
  relevanceBoost: number;
  routeWidget: string | null;
  routeCoin: string | null;
  keywords: string[];
}

export interface TimelineEvent {
  id: string;
  coin: string;
  timestamp: number;
  channel: string;
  headline: string;
  severity: "info" | "watch" | "critical";
}

export interface MarketMover {
  coin: string;
  symbol: string;
  mid: number;
  changePct: number;
  volumeScore: number;
}

export interface LiquidityShift {
  coin: string;
  spreadBps: number;
  bookImbalance: number;
  label: string;
}

export interface SurveillanceHeadline {
  id: string;
  priority: number;
  category: "mover" | "volatility" | "macro" | "narrative" | "liquidity" | "risk";
  headline: string;
  detail: string;
  coin: string | null;
  timestamp: number;
}

export interface MarketSurveillanceSnapshot {
  movers: MarketMover[];
  liquidityShifts: LiquidityShift[];
  headlines: SurveillanceHeadline[];
  regime: string;
  stressScore: number;
  narrativeAcceleration: number;
  updatedAt: number;
}

export interface DiscoverySearchResult {
  entry: IntelligenceIndexEntry;
  score: number;
}
