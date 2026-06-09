import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { InfraValidationRow } from "@/types/live-deployment";

export class LiveInfrastructureValidationEngine {
  static validate(asset: string): InfraValidationRow[] {
    const devops = DevOpsOperationsOrchestrator.snapshot();
    const analytics = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const terminal = useTerminalStore.getState();
    const exec = useExecutionIntelligenceStore.getState();

    const wsOk = terminal.connectionStatus === "connected";

    return [
      {
        id: "inf-ws",
        system: "websocket_stream",
        status: wsOk ? "live" : "degraded",
        detail: terminal.connectionStatus,
      },
      {
        id: "inf-exec",
        system: "execution_pipeline",
        status: exec.pipelineActive ? "active" : "idle",
        detail: `confidence ${analytics.executionConfidence}`,
      },
      {
        id: "inf-intel",
        system: "intelligence_pipeline",
        status: analytics.telemetry.computeLatencyMs < 80 ? "healthy" : "watch",
        detail: `${analytics.telemetry.computeLatencyMs}ms compute`,
      },
      {
        id: "inf-ops",
        system: "platform_ops",
        status: devops.operationalScore >= 75 ? "healthy" : "watch",
        detail: `ops ${devops.operationalScore}`,
      },
      {
        id: "inf-collab",
        system: "collaboration_sync",
        status: "monitored",
        detail: "desk + mobile continuity",
      },
      {
        id: "inf-cmd",
        system: "market_command",
        status: "deployed",
        detail: "situational awareness layer",
      },
    ];
  }
}
