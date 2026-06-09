import { DeskOpsOrchestrator } from "@/lib/desk-ops/DeskOpsOrchestrator";
import { EnterpriseAlertGovernanceEngine } from "@/lib/enterprise/EnterpriseAlertGovernanceEngine";
import type { OrgCommandRow } from "@/types/market-command";

export class OrganizationalCommandEngine {
  static command(): OrgCommandRow[] {
    const desk = DeskOpsOrchestrator.snapshot();
    const alerts = EnterpriseAlertGovernanceEngine.rules().slice(0, 4);

    return [
      {
        id: "org-desks",
        scope: "desk_ops",
        status: `${desk.workspaces.filter((w) => w.status === "active").length} desks`,
        detail: desk.orgBrief.slice(0, 48),
      },
      ...alerts.map((a) => ({
        id: a.id,
        scope: a.scope,
        status: a.severity,
        detail: a.condition.slice(0, 40),
      })),
    ];
  }
}
