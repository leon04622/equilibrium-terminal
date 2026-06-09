import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { PerformanceRow } from "@/types/live-execution";

export class PerformanceLatencyDeskEngine {
  static metrics(asset: string): PerformanceRow[] {
    const analytics = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const exec = useExecutionIntelligenceStore.getState();
    const terminal = useTerminalStore.getState();

    return [
      {
        id: "perf-ws",
        metric: "websocket",
        value: terminal.connectionStatus,
      },
      {
        id: "perf-pipe",
        metric: "orderflow_pipeline",
        value: exec.pipelineActive ? "active" : "idle",
      },
      {
        id: "perf-packet",
        metric: "last_packet_seq",
        value: `${exec.lastPacketSeq}`,
      },
      {
        id: "perf-latency",
        metric: "quality_latency",
        value: `${analytics.quality.latencyMs}ms`,
      },
      {
        id: "perf-telemetry",
        metric: "analytics_compute",
        value: `${analytics.telemetry.computeLatencyMs}ms`,
      },
    ];
  }
}
