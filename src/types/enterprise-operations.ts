/** Phase 28 — Enterprise Operations & Institutional Management. */

export type EnterpriseRole =
  | "admin"
  | "portfolio_manager"
  | "trader"
  | "analyst"
  | "researcher"
  | "read_only"
  | "compliance"
  | "operations";

export type DeskType =
  | "macro"
  | "execution"
  | "quant"
  | "treasury"
  | "research"
  | "monitoring";

export type TenantIsolationLevel = "strict" | "standard" | "shared_infra";

export type AuditCategory =
  | "access"
  | "execution"
  | "workspace"
  | "alert"
  | "annotation"
  | "intelligence"
  | "configuration";

export type EscalationTier = "desk" | "org" | "compliance" | "executive";

export interface EnterprisePermissionSet {
  role: EnterpriseRole;
  canManageOrg: boolean;
  canManageDesks: boolean;
  canPlaceOrders: boolean;
  canPublishResearch: boolean;
  canManageAlerts: boolean;
  canViewPortfolio: boolean;
  canViewAudit: boolean;
  canManageCompliance: boolean;
  canDeployInfra: boolean;
}

export interface OrganizationWorkspace {
  id: string;
  name: string;
  tenantId: string;
  tier: "desk" | "team" | "enterprise";
  deskCount: number;
  memberCount: number;
  templateId: string;
  layoutVersion: number;
  isolationLevel: TenantIsolationLevel;
  updatedAt: number;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  deskTypes: DeskType[];
  panelPreset: string[];
  inheritedBy: number;
}

export interface MultiDeskProfile {
  id: string;
  name: string;
  type: DeskType;
  memberCount: number;
  activeAlerts: number;
  primaryAssets: string[];
  workflowMode: string;
  status: "operational" | "degraded" | "maintenance";
}

export interface PortfolioExposureRow {
  asset: string;
  category: "spot" | "perp" | "stablecoin" | "defi";
  notionalUsd: number;
  pctPortfolio: number;
  exchange: string;
  leverage: number;
  deltaUsd: number;
  riskBand: "low" | "moderate" | "elevated" | "critical";
}

export interface TreasurySummary {
  totalAumUsd: number;
  stablecoinPct: number;
  crossExchangeBalanceUsd: number;
  liquidityBufferPct: number;
  leverageRatio: number;
  netDeltaUsd: number;
  updatedAt: number;
}

export interface EnterpriseAlertRule {
  id: string;
  name: string;
  scope: "org" | "desk";
  deskType: DeskType | null;
  condition: string;
  severity: "info" | "watch" | "critical";
  escalation: EscalationTier;
  owner: string;
  subscriberCount: number;
  active: boolean;
  lastTriggeredAt: number | null;
}

export interface ComplianceAuditEntry {
  id: string;
  category: AuditCategory;
  action: string;
  actorId: string;
  actorHandle: string;
  resource: string;
  allowed: boolean;
  timestamp: number;
  tenantId: string;
}

export interface EnterpriseNotice {
  id: string;
  kind: "briefing" | "incident" | "operational" | "research" | "execution_coord";
  headline: string;
  body: string;
  severity: "info" | "watch" | "critical";
  authorHandle: string;
  deskType: DeskType | null;
  timestamp: number;
}

export interface OrganizationalPlaybook {
  id: string;
  title: string;
  category: "playbook" | "event_analysis" | "execution_review" | "market_reaction";
  summary: string;
  authorHandle: string;
  tags: string[];
  archivedAt: number;
}

export interface TenantPartition {
  tenantId: string;
  orgName: string;
  isolationLevel: TenantIsolationLevel;
  deskCount: number;
  dataBoundary: string;
  syncRegion: string;
}

export interface EnterpriseReliabilityState {
  uptimePct: number;
  redundancyMode: "active-active" | "active-passive" | "degraded";
  failoverReady: boolean;
  drRpoMinutes: number;
  drRtoMinutes: number;
  deterministicOps: boolean;
  monitoringActive: boolean;
}

export interface EnterpriseOperationsSnapshot {
  organization: OrganizationWorkspace;
  templates: WorkspaceTemplate[];
  desks: MultiDeskProfile[];
  permissions: EnterprisePermissionSet;
  portfolio: PortfolioExposureRow[];
  treasury: TreasurySummary;
  alertGovernance: EnterpriseAlertRule[];
  auditTrail: ComplianceAuditEntry[];
  notices: EnterpriseNotice[];
  knowledge: OrganizationalPlaybook[];
  tenants: TenantPartition[];
  reliability: EnterpriseReliabilityState;
  operationalScore: number;
  updatedAt: number;
}
