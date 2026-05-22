/** Phase 30 — Proprietary Market Intelligence & Network Effects. */

export type ProprietaryMetricKind =
  | "liquidity_stress"
  | "exchange_risk"
  | "leverage_saturation"
  | "stablecoin_confidence"
  | "volatility_regime"
  | "narrative_acceleration"
  | "execution_quality"
  | "market_breadth"
  | "liquidity_fragmentation";

export type MetricTrend = "improving" | "stable" | "deteriorating";

export type BenchmarkCategory =
  | "exchange_reliability"
  | "liquidity_quality"
  | "execution_quality"
  | "market_depth"
  | "volatility_stability";

export interface ProprietaryMetric {
  id: string;
  kind: ProprietaryMetricKind;
  label: string;
  value: number;
  unit: string;
  band: "low" | "moderate" | "elevated" | "critical";
  trend: MetricTrend;
  description: string;
  updatedAt: number;
}

export interface MarketStructureSignal {
  id: string;
  domain: "cross_liquidity" | "order_flow" | "stablecoin" | "leverage" | "migration" | "macro" | "sector";
  headline: string;
  detail: string;
  score: number;
  affectedAssets: string[];
  timestamp: number;
}

export interface InstitutionalBenchmark {
  id: string;
  category: BenchmarkCategory;
  entity: string;
  rank: number;
  score: number;
  delta7d: number;
  label: string;
}

export interface NetworkIntelligenceSignal {
  id: string;
  source: "aggregated_desks" | "workflow_patterns" | "anomaly_cluster";
  headline: string;
  privacyPreserved: boolean;
  confidence: number;
  deskCount: number;
  timestamp: number;
}

export interface WorkflowEmbeddingMetric {
  id: string;
  label: string;
  score: number;
  description: string;
  dependencyBand: "low" | "moderate" | "high" | "critical";
}

export interface SignatureFeature {
  id: string;
  name: string;
  status: "active" | "watch" | "staged";
  primaryMetric: string;
  value: number;
  description: string;
}

export interface OperationalMemoryEntry {
  id: string;
  kind: "event" | "vol_analog" | "narrative" | "liquidity_regime" | "macro_reaction";
  title: string;
  summary: string;
  analogDate: string | null;
  relevanceScore: number;
  archivedAt: number;
}

export interface IntelligenceDistributionItem {
  id: string;
  title: string;
  kind: "market_state" | "volatility" | "liquidity" | "ecosystem" | "operational";
  summary: string;
  channels: string[];
  publishedAt: number;
}

export interface ProprietaryIntelligenceSnapshot {
  metrics: ProprietaryMetric[];
  marketStructure: MarketStructureSignal[];
  benchmarks: InstitutionalBenchmark[];
  networkSignals: NetworkIntelligenceSignal[];
  workflowEmbedding: WorkflowEmbeddingMetric[];
  signatureFeatures: SignatureFeature[];
  operationalMemory: OperationalMemoryEntry[];
  distribution: IntelligenceDistributionItem[];
  differentiationScore: number;
  moatScore: number;
  updatedAt: number;
}
