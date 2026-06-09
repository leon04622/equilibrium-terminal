/** Phase 51 — Internal admin, operations & platform control. */

export type OpsCommandModeId =
  | "command_center"
  | "incident_ops"
  | "release_control"
  | "customer_support"
  | "security_audit";

export type OpsDomainStatus = "operational" | "degraded" | "offline" | "staged";

export interface AdminDomainRow {
  id: string;
  domain: string;
  status: OpsDomainStatus;
  detail: string;
}

export interface ServiceHealthRow {
  service: string;
  health: OpsDomainStatus;
  latencyMs: number;
  throughputPerMin: number;
}

export interface OpsIncidentRow {
  id: string;
  severity: string;
  status: string;
  title: string;
  runbookId: string;
  openedAt: number;
}

export interface FeatureFlagRow {
  id: string;
  label: string;
  enabled: boolean;
  rolloutPct: number;
  scope: "global" | "org" | "beta";
}

export interface OrgAdminRow {
  id: string;
  name: string;
  tier: string;
  seats: number;
  status: OpsDomainStatus;
}

export interface RuntimeControlRow {
  id: string;
  control: string;
  status: string;
  lastActionAt: number | null;
}

export interface SupportTicketRow {
  id: string;
  subject: string;
  severity: string;
  status: string;
}

export interface AuditOpsRow {
  id: string;
  event: string;
  actor: string;
  timestamp: number;
}

export interface BillingOpsRow {
  label: string;
  value: string;
  status: OpsDomainStatus;
}

export interface ProductIntelRow {
  metric: string;
  value: string;
  trend: "up" | "down" | "flat";
}

export interface OpsCommandDashboardMode {
  id: OpsCommandModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface OpsCommandTelemetrySnapshot {
  openIncidents: number;
  servicesHealthy: number;
  serviceCount: number;
  flagCount: number;
  computeLatencyMs: number;
  controlScore: number;
}

export interface OpsCommandSnapshot {
  adminDomains: AdminDomainRow[];
  serviceHealth: ServiceHealthRow[];
  incidents: OpsIncidentRow[];
  featureFlags: FeatureFlagRow[];
  organizations: OrgAdminRow[];
  runtimeControls: RuntimeControlRow[];
  supportTickets: SupportTicketRow[];
  auditEvents: AuditOpsRow[];
  billing: BillingOpsRow[];
  productIntel: ProductIntelRow[];
  commandBrief: string;
  dashboardModes: OpsCommandDashboardMode[];
  activeMode: OpsCommandModeId;
  telemetry: OpsCommandTelemetrySnapshot;
  controlScore: number;
  updatedAt: number;
}
