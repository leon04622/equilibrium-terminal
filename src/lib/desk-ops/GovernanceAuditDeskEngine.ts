import { CollaborationOrchestrator } from "@/lib/collaboration/CollaborationOrchestrator";
import { ComplianceAuditEngine } from "@/lib/enterprise/ComplianceAuditEngine";
import { EnterprisePermissionEngine } from "@/lib/enterprise/EnterprisePermissionEngine";
import { OrganizationWorkspaceEngine } from "@/lib/enterprise/OrganizationWorkspaceEngine";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { GovernanceAuditRow } from "@/types/desk-operations";

export class GovernanceAuditDeskEngine {
  static trail(): GovernanceAuditRow[] {
    const collab = CollaborationOrchestrator.snapshot().auditTrail.map((a) => ({
      id: a.id,
      action: a.action,
      actor: a.actorHandle,
      resource: a.resource,
      allowed: a.allowed,
      timestamp: a.timestamp,
    }));

    const prod = useProductionConfigStore.getState();
    const org = OrganizationWorkspaceEngine.organization();
    const permissions = EnterprisePermissionEngine.resolve(
      prod.primaryRole(),
      prod.session?.tier ?? prod.entitlements.tier,
      prod.can("manageTeam"),
      prod.can("deployInfra"),
    );
    const ent = ComplianceAuditEngine.trail(org.tenantId, permissions.canViewAudit)
      .slice(0, 8)
      .map((e) => ({
        id: e.id,
        action: e.action,
        actor: e.actorHandle,
        resource: e.resource,
        allowed: e.allowed,
        timestamp: e.timestamp,
      }));

    return [...collab, ...ent].sort((a, b) => b.timestamp - a.timestamp);
  }
}
