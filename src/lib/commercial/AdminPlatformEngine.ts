import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { DeploymentOrchestrator } from "@/lib/devops/DeploymentOrchestrator";
import type { AdminPlatformRow } from "@/types/commercial-product";

export class AdminPlatformEngine {
  static rows(): AdminPlatformRow[] {
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const cicd = DeploymentOrchestrator.cicdStatus();

    const mapStatus = (ok: boolean): AdminPlatformRow["status"] =>
      ok ? "operational" : "degraded";

    return [
      {
        domain: "User sessions",
        status: mapStatus(ops.stream.wsConnected),
        detail: "SIWE + JWT session plane",
      },
      {
        domain: "Workspace persistence",
        status: "operational",
        detail: "Snapshot API + cloud sync",
      },
      {
        domain: "Feature flags",
        status: "operational",
        detail: "Wedge desk / expand gating",
      },
      {
        domain: "Deployments",
        status: cicd === "pass" ? "operational" : cicd === "fail" ? "offline" : "degraded",
        detail: `Build ${ops.release.buildId} · ${ops.release.channel}`,
      },
      {
        domain: "Infrastructure",
        status: mapStatus(ops.operationalScore >= 75),
        detail: `Ops score ${ops.operationalScore}`,
      },
      {
        domain: "Subscriptions",
        status: "operational",
        detail: "Entitlement matrix active",
      },
      {
        domain: "Incidents",
        status: ops.incidents.length === 0 ? "operational" : "degraded",
        detail: `${ops.incidents.length} open`,
      },
    ];
  }
}
