import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { IncidentManagementEngine } from "@/lib/ops-command/IncidentManagementEngine";

export class OpsCommandBriefEngine {
  static brief(): string {
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const incidents = IncidentManagementEngine.incidents();

    return [
      "Operational command center",
      `Env ${ops.environment} · ops ${ops.operationalScore} · SLO ${ops.sloTargetPct}%`,
      `${incidents.length} open incidents · build ${ops.release.buildId}`,
      "Human operator remains central — no autonomous infra changes.",
    ].join("\n");
  }
}
