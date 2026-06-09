import type { DeskOpsSnapshot } from "@/types/desk-operations";

export class DeskOpsBriefEngine {
  static brief(snapshot: Pick<DeskOpsSnapshot, "workspaces" | "sharedIntel" | "orgAlerts" | "coordination" | "telemetry">): string {
    const activeDesks = snapshot.workspaces.filter((w) => w.status === "active").length;
    const criticalAlerts = snapshot.orgAlerts.filter((a) => a.severity === "critical").length;
    const handoff = snapshot.coordination.find((c) => c.id === "shift-pm");
    const intel = snapshot.sharedIntel.length;

    if (criticalAlerts > 0) {
      return `${criticalAlerts} org-critical alert(s) · ${activeDesks} desks live · ${intel} intel items`;
    }
    if (handoff?.status === "active") {
      return `PM coverage active · ${activeDesks} desks · org score ${snapshot.telemetry.orgScore}`;
    }
    return `${activeDesks} org workspaces · ${intel} shared intel · score ${snapshot.telemetry.orgScore}`;
  }
}
