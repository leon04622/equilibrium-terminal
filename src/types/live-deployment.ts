/** Phase 60 — Live market deployment, institutional alpha & operational scale. */

export type LiveDeploymentModeId =
  | "alpha_control"
  | "infra_validation"
  | "telemetry_ops"
  | "enterprise_go_live"
  | "incident_ready";

export interface DeploymentControlRow {
  id: string;
  control: string;
  state: string;
  governance: string;
}

export interface InfraValidationRow {
  id: string;
  system: string;
  status: string;
  detail: string;
}

export interface OperationalTelemetryRow {
  id: string;
  metric: string;
  value: string;
  signal: string;
}

export interface RetentionInsightRow {
  id: string;
  insight: string;
  strength: string;
  implication: string;
}

export interface FeedbackLoopRow {
  id: string;
  channel: string;
  priority: string;
  summary: string;
}

export interface HardeningPriorityRow {
  id: string;
  area: string;
  status: string;
  action: string;
}

export interface SupportOpsRow {
  id: string;
  workflow: string;
  state: string;
}

export interface EnterpriseReadinessRow {
  id: string;
  asset: string;
  readiness: string;
}

export interface LiveDeploymentDashboardMode {
  id: LiveDeploymentModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface LiveDeploymentTelemetrySnapshot {
  rolloutPct: number;
  inviteValidated: boolean;
  killSwitchActive: boolean;
  deploymentScore: number;
  computeLatencyMs: number;
}

export interface LiveDeploymentSnapshot {
  asset: string;
  alphaControls: DeploymentControlRow[];
  infraValidation: InfraValidationRow[];
  telemetry: OperationalTelemetryRow[];
  retentionInsights: RetentionInsightRow[];
  feedbackLoops: FeedbackLoopRow[];
  hardening: HardeningPriorityRow[];
  supportOps: SupportOpsRow[];
  enterpriseReadiness: EnterpriseReadinessRow[];
  successIndicators: Array<{ label: string; met: boolean; detail: string }>;
  deploymentBrief: string;
  iterationFocus: string[];
  dashboardModes: LiveDeploymentDashboardMode[];
  activeMode: LiveDeploymentModeId;
  telemetryMeta: LiveDeploymentTelemetrySnapshot;
  deploymentScore: number;
  updatedAt: number;
}
