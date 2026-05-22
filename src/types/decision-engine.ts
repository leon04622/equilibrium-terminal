/** Phase 16 — Decision Engine & Actionable Intelligence schemas. */

import type { MarketRegime } from "@/types/market-atmosphere";
import type { SignalStance } from "@/types/agentic";

export type DecisionTraderMode =
  | "balanced"
  | "scalper"
  | "swing"
  | "macro"
  | "momentum"
  | "narrative"
  | "quant";

export type SignalDomain =
  | "orderflow"
  | "macro"
  | "narrative"
  | "execution"
  | "positioning"
  | "volatility"
  | "agentic"
  | "quant";

export type ActionableKind =
  | "high_conviction_long"
  | "high_conviction_short"
  | "liquidation_risk"
  | "low_quality_breakout"
  | "narrative_exhaustion"
  | "macro_conflict"
  | "execution_caution"
  | "mean_reversion_zone"
  | "trend_continuation"
  | "neutral_observe";

export type TimeframeClass = "scalp" | "intraday" | "swing" | "position";

export type ExecutionReadiness =
  | "favorable"
  | "dangerous"
  | "noisy"
  | "illiquid"
  | "trend_supportive"
  | "mean_reverting";

export interface DecisionSignal {
  id: string;
  domain: SignalDomain;
  coin: string;
  stance: SignalStance;
  weight: number;
  confidence: number;
  label: string;
  evidence: string;
  timestamp: number;
}

export interface MarketConflict {
  id: string;
  description: string;
  domains: SignalDomain[];
  severity: number;
  confidencePenalty: number;
}

export interface RiskFactor {
  id: string;
  category:
    | "volatility"
    | "liquidity"
    | "execution"
    | "macro_event"
    | "overextension"
    | "crowding";
  severity: number;
  headline: string;
  explanation: string;
}

export interface TradeThesis {
  id: string;
  coin: string;
  stance: SignalStance;
  summary: string;
  invalidation: string;
  supportingEvidence: string[];
  historicalAnalog: string | null;
  confidence: number;
  timeframe: TimeframeClass;
}

export interface ActionableIntelligence {
  id: string;
  kind: ActionableKind;
  priority: number;
  headline: string;
  directive: string;
  confidence: number;
  coin: string;
}

export interface MarketStateModel {
  coin: string;
  regime: MarketRegime;
  volatilityScore: number;
  liquidityScore: number;
  sentimentScore: number;
  positioningScore: number;
  narrativeScore: number;
  macroScore: number;
  orderFlowScore: number;
  compositeBias: number;
  label: string;
  updatedAt: number;
}

export interface ExecutionReadinessScore {
  readiness: ExecutionReadiness;
  score: number;
  factors: string[];
}

export interface StrategicBriefing {
  coin: string;
  marketState: string;
  primaryThesis: string;
  keyRisk: string;
  executionGuidance: string;
  challengeNote: string | null;
  updatedAt: number;
}

export interface DecisionSnapshot {
  coin: string;
  traderMode: DecisionTraderMode;
  decisionConfidence: number;
  fusedStance: SignalStance;
  marketState: MarketStateModel;
  theses: TradeThesis[];
  conflicts: MarketConflict[];
  risks: RiskFactor[];
  actionables: ActionableIntelligence[];
  executionReadiness: ExecutionReadinessScore;
  briefing: StrategicBriefing;
  signals: DecisionSignal[];
  updatedAt: number;
}
