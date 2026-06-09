import { EnterpriseOrchestrator } from "@/lib/enterprise/EnterpriseOrchestrator";
import type { AuditOpsRow } from "@/types/ops-command";

export class SecurityAuditOpsEngine {
  static events(): AuditOpsRow[] {
    const ent = EnterpriseOrchestrator.snapshot();
    return ent.auditTrail.slice(0, 10).map((e) => ({
      id: e.id,
      event: e.action,
      actor: e.actorHandle,
      timestamp: e.timestamp,
    }));
  }
}
