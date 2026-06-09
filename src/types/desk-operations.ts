/** Phase 53 — Enterprise collaboration, desk operations & multi-user workflows. */

import type { CollaborationRole } from "@/types/collaboration";
import type { EnterpriseRole } from "@/types/enterprise-operations";

export type DeskOpsModeId =
  | "desk_command"
  | "intel_share"
  | "research_collab"
  | "ops_coordination"
  | "governance";

export interface OrgWorkspaceRow {
  id: string;
  name: string;
  deskType: string;
  members: number;
  layoutVersion: number;
  watchlistCount: number;
  status: "active" | "syncing" | "staged";
}

export interface OrgRoleRow {
  role: EnterpriseRole | CollaborationRole;
  label: string;
  canTrade: boolean;
  canResearch: boolean;
  canAudit: boolean;
  canOps: boolean;
}

export interface SharedIntelRow {
  id: string;
  kind: string;
  headline: string;
  author: string;
  severity: string;
  coin: string | null;
}

export interface CollabResearchRow {
  id: string;
  title: string;
  kind: string;
  author: string;
  version: number;
  visibility: string;
}

export interface OrgAlertRow {
  id: string;
  scope: string;
  condition: string;
  severity: string;
  subscribers: number;
}

export interface OpsCoordinationRow {
  id: string;
  label: string;
  status: string;
  owner: string;
  updatedAt: number;
}

export interface GovernanceAuditRow {
  id: string;
  action: string;
  actor: string;
  resource: string;
  allowed: boolean;
  timestamp: number;
}

export interface TenantIsolationRow {
  tenantId: string;
  orgName: string;
  isolation: string;
  dataBoundary: string;
  encrypted: boolean;
}

export interface CollabMemoryRow {
  id: string;
  kind: string;
  title: string;
  author: string;
  archivedAt: number;
}

export interface DeskOpsDashboardMode {
  id: DeskOpsModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface DeskOpsTelemetrySnapshot {
  activeMembers: number;
  sharedAnnotations: number;
  deskAlerts: number;
  auditEvents: number;
  computeLatencyMs: number;
  orgScore: number;
}

export interface DeskOpsSnapshot {
  asset: string;
  workspaces: OrgWorkspaceRow[];
  roles: OrgRoleRow[];
  sharedIntel: SharedIntelRow[];
  collabResearch: CollabResearchRow[];
  orgAlerts: OrgAlertRow[];
  coordination: OpsCoordinationRow[];
  governance: GovernanceAuditRow[];
  tenants: TenantIsolationRow[];
  collabMemory: CollabMemoryRow[];
  orgBrief: string;
  dashboardModes: DeskOpsDashboardMode[];
  activeMode: DeskOpsModeId;
  telemetry: DeskOpsTelemetrySnapshot;
  orgScore: number;
  updatedAt: number;
}
