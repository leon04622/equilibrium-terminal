import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import type { ExecutionQualityMetrics } from "@/types/execution-analytics";

export class ExecutionQualityEngine {
  static metrics(): ExecutionQualityMetrics {
    const { slippage, executionConfidence, dom } = useExecutionIntelligenceStore.getState();
    const lastMsg = useTerminalStore.getState().lastMessageAt;
    const latencyMs = lastMsg ? Math.max(0, Date.now() - lastMsg) : 0;
    const vitals = useTraderTelemetryStore.getState().vitals;

    const spreadBps = slippage.spreadBps ?? dom?.spreadBps ?? 0;
    const liquidityImpactBps = slippage.slippageBps * 0.6 + spreadBps * 0.4;

    const fillQualityScore = Math.round(
      executionConfidence * 0.5 +
        (slippage.riskTier === "low" ? 40 : slippage.riskTier === "elevated" ? 25 : 10),
    );

    const efficiencyScore = Math.round(
      Math.max(0, 100 - slippage.slippageBps * 2 - latencyMs / 50),
    );

    return {
      slippageBps: slippage.slippageBps,
      spreadBps,
      fillQualityScore: Math.min(100, fillQualityScore),
      latencyMs: Math.max(latencyMs, Math.round(vitals.wsReconnectLagMs)),
      liquidityImpactBps: Math.round(liquidityImpactBps),
      efficiencyScore: Math.min(100, efficiencyScore),
      riskTier: slippage.riskTier,
    };
  }
}
