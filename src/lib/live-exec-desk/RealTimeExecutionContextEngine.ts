import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { ExecutionContextRow } from "@/types/live-execution";

export class RealTimeExecutionContextEngine {
  static context(asset: string): ExecutionContextRow[] {
    const analytics = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
    const intel = useTerminalStore.getState().intelligence.filter(
      (i) => i.coin.toUpperCase() === asset.toUpperCase(),
    ).length;

    return [
      {
        id: "ctx-spread",
        metric: "spread",
        value: `${analytics.quality.spreadBps.toFixed(1)} bps`,
        tier: analytics.quality.riskTier,
      },
      {
        id: "ctx-slip",
        metric: "slippage",
        value: `${analytics.quality.slippageBps.toFixed(1)} bps`,
        tier: analytics.quality.riskTier,
      },
      {
        id: "ctx-liq",
        metric: "depth_risk",
        value: `${analytics.liquidity.depthCollapseRisk}`,
        tier: analytics.liquidity.depthCollapseRisk > 60 ? "watch" : "info",
      },
      {
        id: "ctx-flow",
        metric: "order_flow",
        value: analytics.orderFlow.marketPressure,
        tier: analytics.orderFlow.absorptionScore > 70 ? "info" : "watch",
      },
      {
        id: "ctx-funding",
        metric: "funding",
        value: `deriv score ${deriv.derivativesScore}`,
        tier: "info",
      },
      {
        id: "ctx-intel",
        metric: "intel_overlay",
        value: `${intel} active signals`,
        tier: intel > 2 ? "watch" : "info",
      },
      {
        id: "ctx-conf",
        metric: "exec_confidence",
        value: `${analytics.executionConfidence}%`,
        tier: analytics.executionConfidence >= 70 ? "info" : "watch",
      },
    ];
  }
}
