/** Phase 40 — consolidation, integration audit & pre-launch hardening. */

export type HardeningStatus = "pass" | "watch" | "fail";

export type IntegrationDomain =
  | "ingestion"
  | "intelligence"
  | "execution"
  | "charting"
  | "workspaces"
  | "collaboration"
  | "apis"
  | "alerting"
  | "omnibar"
  | "knowledge_graph"
  | "security"
  | "enterprise"
  | "devops";

export interface IntegrationAuditRow {
  domain: IntegrationDomain;
  label: string;
  status: HardeningStatus;
  score: number;
  detail: string;
}

export type WorkflowStageId =
  | "discovery"
  | "analysis"
  | "monitoring"
  | "execution"
  | "journaling"
  | "alerting"
  | "persistence"
  | "research"
  | "collaboration";

export interface WorkflowContinuityRow {
  stage: WorkflowStageId;
  label: string;
  status: HardeningStatus;
  continuityPct: number;
  detail: string;
}

export interface DataQualityRow {
  check: string;
  status: HardeningStatus;
  value: string;
}

export interface LaunchGate {
  id: string;
  label: string;
  status: HardeningStatus;
  score: number;
  required: boolean;
}

export type PreLaunchEnvironmentId = "staging" | "qa" | "stress" | "enterprise_demo";

export interface PreLaunchEnvironment {
  id: PreLaunchEnvironmentId;
  label: string;
  purpose: string;
  hlNetwork: "mainnet" | "testnet";
  stressReplay: boolean;
}

export interface LaunchHardeningSnapshot {
  launchReadinessScore: number;
  integrationScore: number;
  workflowScore: number;
  dataQualityScore: number;
  securityScore: number;
  performanceScore: number;
  uxCohesionScore: number;
  integration: IntegrationAuditRow[];
  workflows: WorkflowContinuityRow[];
  dataQuality: DataQualityRow[];
  gates: LaunchGate[];
  environments: PreLaunchEnvironment[];
  blockers: string[];
  launchApproved: boolean;
  updatedAt: number;
}
