import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { ExecutionImmersionDeskEngine } from "@/lib/live-exec-desk/ExecutionImmersionDeskEngine";
import { PerformanceLatencyDeskEngine } from "@/lib/live-exec-desk/PerformanceLatencyDeskEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { ExecutionPolishRow } from "@/types/product-maturity";

export class ExecutionFlowPolishEngine {
  static flows(asset: string): ExecutionPolishRow[] {
    const analytics = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const perf = PerformanceLatencyDeskEngine.metrics(asset);
    const pipeline = useExecutionIntelligenceStore.getState().pipelineActive;
    const latencyRow = perf.find((p) => p.metric === "quality_latency");

    const hotkeys = ExecutionImmersionDeskEngine.hotkeys().slice(0, 4);

    return [
      {
        id: "exec-pipe",
        flow: "execution_pipeline",
        status: pipeline ? "active" : "idle",
        latency: latencyRow?.value ?? `${analytics.quality.latencyMs}ms`,
      },
      {
        id: "exec-conf",
        flow: "execution_confidence",
        status: analytics.executionConfidence >= 70 ? "trusted" : "watch",
        latency: `${analytics.executionConfidence}/100`,
      },
      {
        id: "exec-slip",
        flow: "slippage_visibility",
        status: analytics.quality.slippageBps < 12 ? "ok" : "elevated",
        latency: `${analytics.quality.slippageBps.toFixed(1)} bps avg`,
      },
      ...hotkeys.map((h) => ({
        id: h.id,
        flow: h.action,
        status: "hotkey",
        latency: h.key,
      })),
    ];
  }
}
