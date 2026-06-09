/** Phase 46 — Knowledge graph, market relationships & systemic intelligence. */

import type { GraphEntity, GraphLink, GraphRelation } from "@/types/market-knowledge-graph";

export type SystemicDashboardModeId =
  | "relationship_map"
  | "systemic_risk"
  | "narrative_flow"
  | "liquidity_flows"
  | "event_cascade";

export type SystemicAlertKind =
  | "concentration_risk"
  | "stablecoin_stress"
  | "contagion_risk"
  | "narrative_acceleration"
  | "liquidity_fragmentation"
  | "cascade_warning";

export interface MarketEntityNode {
  id: string;
  kind: GraphEntity["kind"];
  label: string;
  coin: string | null;
  systemicWeight: number;
}

export interface RelationshipEdge {
  from: string;
  to: string;
  relation: GraphRelation;
  strength: number;
  label: string;
}

export interface RelationshipMetrics {
  correlationStress: number;
  exchangeDependencyPct: number;
  stablecoinLinkage: number;
  derivativesInfluence: number;
  macroSensitivity: number;
  sectorRotationScore: number;
}

export interface SystemicRiskMetrics {
  exchangeConcentration: number;
  stablecoinDependency: number;
  liquidityFragmentation: number;
  leverageStress: number;
  contagionRisk: number;
  volPropagation: number;
  treasuryConcentration: number;
  riskTier: "low" | "moderate" | "elevated" | "critical";
}

export interface NarrativePropagation {
  emergenceScore: number;
  accelerationScore: number;
  sectorSpread: string[];
  sentimentVelocity: number;
  socialAmplification: number;
  governanceInfluence: number;
  activeNarratives: Array<{ id: string; label: string; coins: string[] }>;
}

export interface LiquidityFlowRow {
  id: string;
  from: string;
  to: string;
  flowType: "stablecoin" | "bridge" | "exchange" | "treasury" | "cross_chain";
  magnitudeUsd: number;
  velocity: "stable" | "active" | "stressed";
}

export interface EventCascadeStep {
  id: string;
  trigger: string;
  propagation: string;
  affectedEntities: string[];
  severity: "info" | "watch" | "critical";
}

export interface ContextualEnrichment {
  eventId: string;
  relatedAssets: string[];
  relatedSectors: string[];
  relatedExchanges: string[];
  systemicImportance: number;
  dependencyContext: string;
  historicalAnalog: string | null;
}

export interface KnowledgeMemoryPoint {
  timestamp: number;
  regime: string;
  contagionRisk: number;
  narrativeAccel: number;
  entityCount: number;
}

export interface SystemicAlert {
  id: string;
  kind: SystemicAlertKind;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  timestamp: number;
}

export interface SystemicDashboardMode {
  id: SystemicDashboardModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface SystemicTelemetrySnapshot {
  entityCount: number;
  linkCount: number;
  computeLatencyMs: number;
  memoryPoints: number;
}

export interface SystemicIntelligenceSnapshot {
  asset: string;
  entities: MarketEntityNode[];
  relationships: RelationshipEdge[];
  relationshipMetrics: RelationshipMetrics;
  systemicRisk: SystemicRiskMetrics;
  narratives: NarrativePropagation;
  liquidityFlows: LiquidityFlowRow[];
  cascades: EventCascadeStep[];
  enrichments: ContextualEnrichment[];
  memory: KnowledgeMemoryPoint[];
  alerts: SystemicAlert[];
  subgraph: { entities: GraphEntity[]; links: GraphLink[] };
  dashboardModes: SystemicDashboardMode[];
  activeMode: SystemicDashboardModeId;
  telemetry: SystemicTelemetrySnapshot;
  systemicScore: number;
  aiContextSummary: string;
  updatedAt: number;
}
