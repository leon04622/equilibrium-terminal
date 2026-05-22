import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import type { ComplianceAuditEntry } from "@/types/enterprise-operations";

export class ComplianceAuditEngine {
  static trail(tenantId: string, canViewAudit: boolean): ComplianceAuditEntry[] {
    if (!canViewAudit) return [];

    const prod = useProductionConfigStore.getState();
    const collab = useCollaborationStore.getState().snapshot;
    const entries: ComplianceAuditEntry[] = [];

    for (const log of prod.serverSaveLogs.slice(0, 8)) {
      entries.push({
        id: `audit-save-${log.id}`,
        category: "workspace",
        action: log.operation,
        actorId: prod.session?.userId ?? "system",
        actorHandle: prod.session?.walletAddress?.slice(0, 10) ?? "SYSTEM",
        resource: `workspace:${prod.session?.workspaceId ?? "—"}`,
        allowed: log.status === "ok",
        timestamp: log.at,
        tenantId,
      });
    }

    for (const audit of collab?.auditTrail ?? []) {
      entries.push({
        id: `audit-collab-${audit.id}`,
        category: "annotation",
        action: audit.action,
        actorId: audit.actorId,
        actorHandle: audit.actorHandle,
        resource: audit.resource,
        allowed: audit.allowed,
        timestamp: audit.timestamp,
        tenantId,
      });
    }

    const seeded: ComplianceAuditEntry[] = [
      {
        id: "audit-access-01",
        category: "access",
        action: "session_login",
        actorId: prod.session?.userId ?? "user-01",
        actorHandle: "ADMIN",
        resource: "platform:enterprise",
        allowed: true,
        timestamp: Date.now() - 600_000,
        tenantId,
      },
      {
        id: "audit-exec-01",
        category: "execution",
        action: "order_submit",
        actorId: "trader-02",
        actorHandle: "EXEC DESK A",
        resource: "order:HYPE:limit",
        allowed: true,
        timestamp: Date.now() - 120_000,
        tenantId,
      },
      {
        id: "audit-intel-01",
        category: "intelligence",
        action: "intel_access",
        actorId: "analyst-01",
        actorHandle: "RESEARCH",
        resource: "panel:intelengine",
        allowed: true,
        timestamp: Date.now() - 45_000,
        tenantId,
      },
    ];

    return [...entries, ...seeded].sort((a, b) => b.timestamp - a.timestamp).slice(0, 24);
  }
}
