import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import type { ExecutionOversightRow } from "@/types/mobile-operational";

export class MobileExecutionOversightEngine {
  static rows(asset: string): ExecutionOversightRow[] {
    const snap = ExecutionAnalyticsOrchestrator.snapshot(asset);
    const q = snap.quality;
    const liq = snap.liquidity;

    return [
      {
        label: "Flow sweeps",
        value: `${snap.orderFlow.sweepCount}`,
        actionable: snap.orderFlow.sweepCount >= 3,
      },
      {
        label: "Fill quality",
        value: `${q.fillQualityScore}/100`,
        actionable: false,
      },
      {
        label: "Slippage tier",
        value: q.riskTier,
        actionable: q.riskTier === "high" || q.riskTier === "critical",
      },
      {
        label: "Liquidity risk",
        value: `${100 - liq.depthCollapseRisk}/100`,
        actionable: liq.depthCollapseRisk >= 70,
      },
      {
        label: "Emergency reduce",
        value: "Staged · desk-primary",
        actionable: true,
      },
      {
        label: "Last fill alert",
        value: snap.alerts[0]?.headline ?? "—",
        actionable: false,
      },
    ];
  }
}
