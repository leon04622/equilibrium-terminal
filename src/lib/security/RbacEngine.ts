import {
  mapTeamRolesToInstitutional,
  type InstitutionalRole,
  type SecurityPermission,
} from "@/types/security-trust";
import type { AuthSessionClaims, TeamRole } from "@/types/production-platform";

function permSet(...items: SecurityPermission[]): Set<SecurityPermission> {
  return new Set(items);
}

const MATRIX: Record<InstitutionalRole, Set<SecurityPermission>> = {
  trader: permSet(
    "markets.view",
    "markets.stream",
    "watchlist.edit",
    "execution.place",
    "execution.close",
    "execution.approve_agent",
    "workspace.read",
    "workspace.write",
    "api.invoke",
  ),
  analyst: permSet(
    "markets.view",
    "markets.stream",
    "watchlist.edit",
    "research.run",
    "workspace.read",
    "api.invoke",
    "intel.export",
  ),
  admin: permSet(
    "markets.view",
    "markets.stream",
    "watchlist.edit",
    "research.run",
    "execution.place",
    "execution.close",
    "execution.approve_agent",
    "workspace.read",
    "workspace.write",
    "team.manage",
    "infra.deploy",
    "audit.read",
    "api.invoke",
    "intel.export",
  ),
  researcher: permSet(
    "markets.view",
    "markets.stream",
    "research.run",
    "workspace.read",
    "api.invoke",
    "intel.export",
  ),
  compliance: permSet(
    "markets.view",
    "audit.read",
    "compliance.review",
    "workspace.read",
    "api.invoke",
  ),
  operations: permSet(
    "markets.view",
    "markets.stream",
    "workspace.read",
    "workspace.write",
    "infra.deploy",
    "audit.read",
    "api.invoke",
  ),
};

export class RbacEngine {
  static permissionsForRoles(roles: InstitutionalRole[]): Set<SecurityPermission> {
    const merged = new Set<SecurityPermission>();
    for (const role of roles) {
      MATRIX[role].forEach((p) => merged.add(p));
    }
    return merged;
  }

  static authorize(
    claims: AuthSessionClaims | null,
    permission: SecurityPermission,
  ): { allowed: boolean; reason: string } {
    if (!claims) return { allowed: false, reason: "unauthenticated" };
    const roles = mapTeamRolesToInstitutional(claims.roles as TeamRole[]);
    const perms = RbacEngine.permissionsForRoles(roles);
    if (perms.has(permission)) return { allowed: true, reason: "ok" };
    return { allowed: false, reason: `missing_permission:${permission}` };
  }
}
