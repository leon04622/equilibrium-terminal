/** Phase 25 — Real-Time Market Intelligence Engine. */

export type IntelligenceCategory =
  | "liquidity"
  | "volatility"
  | "macro"
  | "narrative"
  | "funding"
  | "positioning"
  | "exchange"
  | "stablecoin"
  | "liquidation";

export type IntelligenceSeverityBand = "info" | "watch" | "critical";

export interface IntelligenceEvent {
  id: string;
  category: IntelligenceCategory;
  severity: number;
  severityBand: IntelligenceSeverityBand;
  confidence: number;
  urgencyScore: number;
  impactScore: number;
  relevanceScore: number;
  compositeScore: number;
  affectedAssets: string[];
  summary: string;
  detail: string;
  timestamp: number;
  relatedEntities: string[];
  enriched: boolean;
}

export interface IntelligenceMarketState {
  volatilityEnvironment: "compressed" | "normal" | "elevated" | "extreme";
  liquidityEnvironment: "deep" | "adequate" | "thin" | "stressed";
  leverageEnvironment: "neutral" | "long_crowded" | "short_crowded" | "extreme";
  marketBreadth: number;
  sentimentState: "risk-on" | "risk-off" | "mixed" | "liquidation";
  macroRiskLevel: "low" | "moderate" | "elevated" | "event";
  compositeLabel: string;
  regime: string;
  updatedAt: number;
}

export interface AssetIntelligenceProfile {
  coin: string;
  liquidityShift: "stable" | "thinning" | "deepening" | "stressed";
  volatilityChange: "flat" | "rising" | "spiking" | "compressing";
  fundingCondition: "neutral" | "long_pays" | "short_pays" | "extreme";
  narrativeActivity: number;
  whaleFlowSignal: "neutral" | "accumulation" | "distribution";
  orderFlowBias: "buy" | "sell" | "balanced";
  macroExposure: "low" | "moderate" | "high";
  headline: string;
  updatedAt: number;
}

export interface SectorNarrativeRow {
  id: string;
  sector: string;
  velocity: number;
  direction: "accelerating" | "stable" | "fading";
  leaders: string[];
  summary: string;
}

export interface IntelligenceAiBrief {
  id: string;
  scope: "market" | "asset" | "event";
  coin: string | null;
  summary: string;
  contextBullets: string[];
  relatedEvents: string[];
  generatedAt: number;
}

export interface MarketIntelligenceSnapshot {
  events: IntelligenceEvent[];
  marketState: IntelligenceMarketState;
  assetProfiles: AssetIntelligenceProfile[];
  sectorNarratives: SectorNarrativeRow[];
  aiBrief: IntelligenceAiBrief | null;
  anomalyCount: number;
  intelligenceScore: number;
  updatedAt: number;
}
