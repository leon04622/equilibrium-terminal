/** Phase 21 — Proprietary Data & Market Coverage Expansion. */

export type VenueKind =
  | "cex"
  | "dex"
  | "derivatives"
  | "options"
  | "stablecoin"
  | "etf"
  | "on_chain"
  | "bridge"
  | "staking"
  | "governance";

export type VenueStatus = "live" | "degraded" | "staged" | "offline";

export interface CoverageVenue {
  id: string;
  name: string;
  kind: VenueKind;
  status: VenueStatus;
  assetsTracked: number;
  latencyMs: number | null;
  lastEventAt: number | null;
}

export interface ProprietaryMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "flat";
  description: string;
  updatedAt: number;
}

export interface OnChainSignal {
  id: string;
  category:
    | "whale"
    | "treasury"
    | "exchange_flow"
    | "bridge"
    | "staking"
    | "unlock"
    | "governance"
    | "validator";
  coin: string;
  headline: string;
  notionalUsd: number | null;
  severity: "info" | "watch" | "critical";
  timestamp: number;
  sourceVerified: boolean;
}

export interface MarketHealthIndicator {
  id: string;
  label: string;
  state: "healthy" | "elevated" | "stressed" | "critical";
  score: number;
  detail: string;
}

export interface InstitutionalWatch {
  id: string;
  entity: string;
  category: "etf" | "fund" | "treasury" | "market_maker" | "stablecoin_issuer" | "exchange_reserve";
  note: string;
  updatedAt: number;
}

export interface RankedMarketEvent {
  id: string;
  source: string;
  category: string;
  headline: string;
  coin: string | null;
  priority: number;
  severity: "info" | "watch" | "critical";
  timestamp: number;
  verified: boolean;
}

export interface DataQualityReport {
  overallTrust: number;
  feedsOnline: number;
  feedsTotal: number;
  staleSources: string[];
  conflictCount: number;
  lastAuditAt: number;
}

export interface MarketCoverageSnapshot {
  venues: CoverageVenue[];
  proprietaryMetrics: ProprietaryMetric[];
  onChainSignals: OnChainSignal[];
  healthIndicators: MarketHealthIndicator[];
  institutionalWatches: InstitutionalWatch[];
  rankedEvents: RankedMarketEvent[];
  dataQuality: DataQualityReport;
  coverageScore: number;
  updatedAt: number;
}
