/** Phase 37 — Security, authorization & trust infrastructure. */

import type { AuthSessionClaims, TeamRole } from "@/types/production-platform";

export type InstitutionalRole =
  | "trader"
  | "analyst"
  | "admin"
  | "researcher"
  | "compliance"
  | "operations";

export type SecurityPermission =
  | "markets.view"
  | "markets.stream"
  | "watchlist.edit"
  | "research.run"
  | "execution.place"
  | "execution.close"
  | "execution.approve_agent"
  | "workspace.read"
  | "workspace.write"
  | "team.manage"
  | "infra.deploy"
  | "audit.read"
  | "api.invoke"
  | "intel.export"
  | "compliance.review";

export type AuditCategory =
  | "auth"
  | "execution"
  | "permission"
  | "workspace"
  | "api"
  | "websocket"
  | "alert"
  | "system"
  | "secret";

export type ThreatKind =
  | "brute_force"
  | "credential_stuffing"
  | "suspicious_login"
  | "rate_limit"
  | "ws_abuse"
  | "execution_anomaly";

export interface AuditLogEntry {
  id: string;
  category: AuditCategory;
  action: string;
  actorWallet: string | null;
  sessionId: string | null;
  resource: string | null;
  outcome: "ok" | "denied" | "error";
  detail: string;
  traceId: string;
  at: number;
}

export interface DeviceSession {
  deviceId: string;
  sessionId: string;
  walletAddress: string;
  userAgent: string;
  ipHash: string;
  createdAt: number;
  lastSeenAt: number;
  suspicious: boolean;
}

export interface ThreatEvent {
  id: string;
  kind: ThreatKind;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  at: number;
}

export interface ExecutionAuthInput {
  walletAddress: string | null;
  claims: AuthSessionClaims | null;
  oneClickEnabled: boolean;
  connectionStatus: string;
  lastMessageAt: number | null;
  markPx: number | null | undefined;
  operation: "place_order" | "close_position" | "approve_agent" | "update_leverage";
}

export interface ExecutionAuthDecision {
  allowed: boolean;
  reason: string;
  auditAction: string;
}

export interface SecurityTrustSnapshot {
  trustScore: number;
  sessionHealth: "healthy" | "expiring" | "invalid" | "none";
  activeDevices: number;
  suspiciousDevices: number;
  auditEntries24h: number;
  threatEvents24h: number;
  rateLimitHits1h: number;
  executionDenials1h: number;
  secretsRotationDue: boolean;
  wsSessionBound: boolean;
  updatedAt: number;
}

export interface ApiScope {
  id: string;
  permissions: SecurityPermission[];
}

/** Maps legacy team roles to institutional RBAC roles. */
export function mapTeamRolesToInstitutional(roles: TeamRole[]): InstitutionalRole[] {
  const out = new Set<InstitutionalRole>();
  for (const r of roles) {
    if (r === "admin") out.add("admin");
    if (r === "trader") out.add("trader");
    if (r === "analyst") out.add("analyst");
  }
  if (out.size === 0) out.add("analyst");
  return Array.from(out);
}
