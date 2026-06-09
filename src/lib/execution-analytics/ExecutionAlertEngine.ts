import { LiquidityVisibilityEngine } from "@/lib/execution-analytics/LiquidityVisibilityEngine";
import { OrderFlowAnalyticsEngine } from "@/lib/execution-analytics/OrderFlowAnalyticsEngine";
import { ExecutionQualityEngine } from "@/lib/execution-analytics/ExecutionQualityEngine";
import { MicrostructureEngine } from "@/lib/execution-analytics/MicrostructureEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { ExecutionAlert, ExecutionAlertKind } from "@/types/execution-analytics";

function alert(
  kind: ExecutionAlertKind,
  severity: ExecutionAlert["severity"],
  headline: string,
  detail: string,
): ExecutionAlert {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    severity,
    headline,
    detail,
    timestamp: Date.now(),
  };
}

export class ExecutionAlertEngine {
  static evaluate(): ExecutionAlert[] {
    const alerts: ExecutionAlert[] = [];
    const flow = OrderFlowAnalyticsEngine.metrics();
    const liq = LiquidityVisibilityEngine.snapshot();
    const quality = ExecutionQualityEngine.metrics();
    const micro = MicrostructureEngine.analyze();
    const flags = useExecutionIntelligenceStore.getState().copilotTape;

    if (liq.depthCollapseRisk >= 70 || liq.voidCount >= 4) {
      alerts.push(
        alert(
          "liquidity_collapse",
          liq.depthCollapseRisk >= 85 ? "critical" : "watch",
          "Liquidity collapse risk",
          `${liq.voidCount} voids · depth risk ${liq.depthCollapseRisk}`,
        ),
      );
    }

    if (flow.sweepCount >= 2 || flow.momentumScore >= 75) {
      alerts.push(
        alert(
          flow.sweepCount >= 3 ? "sweep_cluster" : "aggressive_flow_spike",
          flow.momentumScore >= 85 ? "critical" : "watch",
          "Aggressive flow activity",
          `Sweeps ${flow.sweepCount} · momentum ${flow.momentumScore} · ${flow.marketPressure}`,
        ),
      );
    }

    if (quality.riskTier === "high" || quality.riskTier === "critical") {
      alerts.push(
        alert(
          "slippage_elevated",
          quality.riskTier === "critical" ? "critical" : "watch",
          "Elevated slippage conditions",
          `${quality.slippageBps.toFixed(1)} bps · tier ${quality.riskTier}`,
        ),
      );
    }

    if (quality.spreadBps > 12 || micro.spreadVelocity > 8) {
      alerts.push(
        alert(
          "spread_expansion",
          quality.spreadBps > 20 ? "critical" : "watch",
          "Spread expansion",
          `${quality.spreadBps.toFixed(1)} bps · velocity ${micro.spreadVelocity}`,
        ),
      );
    }

    if (micro.executionPressure >= 80 && quality.efficiencyScore < 50) {
      alerts.push(
        alert(
          "vol_execution_dislocation",
          "watch",
          "Vol / execution dislocation",
          `Pressure ${micro.executionPressure} · efficiency ${quality.efficiencyScore}`,
        ),
      );
    }

    for (const f of flags.slice(0, 3)) {
      if (f.severity === "critical" || f.severity === "watch") {
        alerts.push(
          alert(
            f.code === "SWEEP_CLUSTER" ? "sweep_cluster" : "aggressive_flow_spike",
            f.severity,
            f.message.slice(0, 48),
            f.code,
          ),
        );
      }
    }

    return alerts.slice(0, 12);
  }
}
