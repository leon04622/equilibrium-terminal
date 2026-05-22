/** Phase 8 — Agentic Market Operations schemas. */

export type AgentKind =
  | "structure"
  | "whale"
  | "liquidation"
  | "funding"
  | "narrative";

export type SignalStance = "bullish" | "bearish" | "neutral";

export type WatchlistTier = "active" | "warm" | "cold";

export type AgentComputeStatus = "idle" | "running" | "queued" | "throttled";

export interface AgentEvidenceBullet {
  key: string;
  value: string;
  provenance: string;
}

export interface AgentSignal {
  id: string;
  agentId: AgentKind;
  coin: string;
  timestamp: number;
  stance: SignalStance;
  /** Raw agent confidence 0–1 before fusion. */
  confidence: number;
  thesis: string;
  supportingEvidence: AgentEvidenceBullet[];
  provenanceKeys: string[];
  computeTier: WatchlistTier;
}

export interface WeightedAgentContribution {
  agentId: AgentKind;
  weight: number;
  confidence: number;
  stance: SignalStance;
  dampedConfidence: number;
}

export interface FusedOpportunity {
  id: string;
  coin: string;
  timestamp: number;
  fusedConfidenceScore: number;
  thesis: string;
  supportingEvidence: AgentEvidenceBullet[];
  provenanceKeys: string[];
  agentContributions: WeightedAgentContribution[];
  contradictionPenalty: number;
  relevanceScore: number;
  dominantStance: SignalStance;
  signals: AgentSignal[];
}

export interface DynamicWatchlistEntry {
  coin: string;
  tier: WatchlistTier;
  addedAt: number;
  lastInteractionAt: number;
  interactionScore: number;
}

export interface DynamicWatchlist {
  entries: DynamicWatchlistEntry[];
  activeCoin: string | null;
  updatedAt: number;
}

export interface AgentRuntimeState {
  agentId: AgentKind;
  status: AgentComputeStatus;
  lastRunAt: number | null;
  tokensUsed: number;
  pollIntervalMs: number;
  signalsEmitted: number;
}

export interface TraderBehaviorProfile {
  coin: string;
  selectCount: number;
  lastSelectedAt: number;
  typicalHoldMinutes: number;
  riskBias: "conservative" | "balanced" | "aggressive";
  relevanceWeight: number;
}

export interface LocalBehaviorMemory {
  version: 1;
  profiles: Record<string, TraderBehaviorProfile>;
  globalRiskBias: "conservative" | "balanced" | "aggressive";
  updatedAt: number;
}
