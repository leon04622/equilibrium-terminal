import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import { ReliabilityOrchestrator } from "@/lib/reliability/ReliabilityOrchestrator";
import type { HardeningPriorityRow } from "@/types/live-deployment";

export class OperationalHardeningDeskEngine {
  static priorities(): HardeningPriorityRow[] {
    const hard = HardeningOrchestrator.snapshot();
    const rel = ReliabilityOrchestrator.snapshot();
    const devops = DevOpsOperationsOrchestrator.snapshot();

    return [
      {
        id: "hard-launch",
        area: "launch_readiness",
        status: hard.launchApproved ? "approved" : "gated",
        action: `L${hard.launchReadinessScore} · no hype launch`,
      },
      {
        id: "hard-ws",
        area: "stream_recovery",
        status: devops.stream.wsConnected ? "stable" : "watch",
        action: `${rel.runtime.websocketHealth} · reconnect ${devops.stream.reconnectCount}`,
      },
      {
        id: "hard-mem",
        area: "memory_stability",
        status: rel.runtime.memoryPressure,
        action: "long-session desk operations",
      },
      {
        id: "hard-lat",
        area: "latency",
        status: devops.observability.p95ApiMs < 120 ? "ok" : "optimize",
        action: `p95 ${devops.observability.p95ApiMs}ms api`,
      },
      {
        id: "hard-obs",
        area: "observability",
        status: "active",
        action: "runtime vitals + ops command",
      },
    ];
  }
}
