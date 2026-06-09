/** Phase 32 — Global Crypto Market Infrastructure Execution Strategy. */

export type ProductTierId =
  | "professional"
  | "desk"
  | "institutional"
  | "enterprise_infrastructure";

export type ScalingSegment =
  | "active_traders"
  | "professional_traders"
  | "crypto_teams"
  | "funds"
  | "institutions"
  | "market_makers"
  | "treasury_ops"
  | "enterprise_orgs";

export type InfrastructureCapability =
  | "global_latency"
  | "distributed_ingest"
  | "regional_redundancy"
  | "failover_clusters"
  | "stream_partitioning"
  | "event_processing"
  | "uptime_guarantee";

export type OperationalSystemKind =
  | "support"
  | "incident_mgmt"
  | "uptime_monitor"
  | "runbooks"
  | "deployment"
  | "observability"
  | "recovery";

export type GtmSegment =
  | "professional_traders"
  | "crypto_desks"
  | "research_orgs"
  | "market_makers"
  | "treasury_ops"
  | "institutional_firms";

export type MoatPillar =
  | "proprietary_intel"
  | "workflow_dependency"
  | "integrations"
  | "operational_trust"
  | "org_embedding"
  | "market_memory"
  | "network_effects"
  | "infra_scale";

export interface ProductTierRow {
  id: ProductTierId;
  label: string;
  mappedSubscription: string;
  workflowDepth: number;
  operationalCapability: number;
  headline: string;
}

export interface ScalingPhaseRow {
  segment: ScalingSegment;
  label: string;
  phase: 1 | 2 | 3 | 4;
  readinessPct: number;
  priority: "now" | "next" | "future";
}

export interface InfrastructureScalingRow {
  capability: InfrastructureCapability;
  label: string;
  status: "operational" | "staged" | "planned";
  readinessPct: number;
  region?: string;
}

export interface OperationalExcellenceRow {
  kind: OperationalSystemKind;
  label: string;
  status: "pass" | "watch" | "fail";
  coveragePct: number;
}

export interface GtmTargetRow {
  segment: GtmSegment;
  label: string;
  fitScore: number;
  channel: string;
  avoidRetail: boolean;
}

export interface TrustPillarRow {
  pillar: string;
  score: number;
  trend: "up" | "flat" | "down";
}

export interface AdoptionLeverRow {
  lever: string;
  strength: number;
  embedded: boolean;
}

export interface CompetitivePositionRow {
  id: string;
  positioning: string;
  strength: number;
}

export interface StrategicMoatRow {
  pillar: MoatPillar;
  label: string;
  score: number;
  compounding: boolean;
}

export interface GlobalReadinessRow {
  domain: string;
  readinessPct: number;
  status: "ready" | "preparing" | "gap";
}

export interface GlobalInfrastructureSnapshot {
  tiers: ProductTierRow[];
  scalingPhases: ScalingPhaseRow[];
  infrastructure: InfrastructureScalingRow[];
  operationalExcellence: OperationalExcellenceRow[];
  gtmTargets: GtmTargetRow[];
  trustPillars: TrustPillarRow[];
  adoptionLevers: AdoptionLeverRow[];
  competitivePosition: CompetitivePositionRow[];
  strategicMoats: StrategicMoatRow[];
  globalReadiness: GlobalReadinessRow[];
  infrastructureTrustScore: number;
  globalReadinessScore: number;
  moatCompositeScore: number;
  updatedAt: number;
}
