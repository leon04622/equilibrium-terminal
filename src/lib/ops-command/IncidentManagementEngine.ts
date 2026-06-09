import { IncidentResponseEngine, RUNBOOKS } from "@/lib/devops/IncidentResponseEngine";
import type { OpsIncidentRow } from "@/types/ops-command";

export class IncidentManagementEngine {
  static incidents(): OpsIncidentRow[] {
    return IncidentResponseEngine.list().map((i) => ({
      id: i.id,
      severity: i.severity,
      status: i.status,
      title: i.title,
      runbookId: i.runbookId,
      openedAt: i.openedAt,
    }));
  }

  static runbooks(): string[] {
    return Object.values(RUNBOOKS);
  }
}
