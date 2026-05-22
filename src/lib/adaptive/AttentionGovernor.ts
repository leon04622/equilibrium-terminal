import type {
  CognitiveLoadModel,
  TerminalMode,
  WorkspaceContextSnapshot,
} from "@/types/adaptive-workspace";
import type { CognitiveLoadMetrics } from "@/types/trader-telemetry";

function recommendMode(ctx: WorkspaceContextSnapshot): TerminalMode {
  if (ctx.executionState === "active_order" || ctx.slippageRiskTier === "critical") {
    return "execution";
  }
  if (ctx.volatilityScore >= 70 || ctx.marketRegime === "liquidation") {
    return "scalping";
  }
  if (ctx.marketRegime === "compression" && ctx.volatilityScore < 35) {
    return "research";
  }
  if (ctx.marketRegime === "risk-off" || ctx.marketRegime === "risk-on") {
    return "macro";
  }
  if (ctx.cognitiveFriction > 0.7) return "balanced";
  return "balanced";
}

/**
 * Hierarchical attention control — reduces visual noise and alert fatigue.
 */
export class AttentionGovernor {
  static evaluate(
    ctx: WorkspaceContextSnapshot,
    metrics: CognitiveLoadMetrics,
    panelCount: number,
  ): CognitiveLoadModel {
    const overloadRisk = Math.min(
      1,
      metrics.cognitiveFrictionScore * 0.35 +
        metrics.alertFatigueIndex * 0.25 +
        metrics.focusSwitchRatePerMin * 0.02 +
        panelCount * 0.012,
    );

    const visualNoiseIndex = Math.min(
      1,
      metrics.navigationRepetitionScore * 0.2 +
        ctx.alertPressure * 0.004 +
        (ctx.volatilityScore / 100) * 0.25,
    );

    const alertFatigue = Math.min(1, metrics.alertFatigueIndex);

    const focusDispersion = Math.min(1, metrics.focusSwitchRatePerMin / 30);

    return {
      overloadRisk,
      visualNoiseIndex,
      alertFatigue,
      focusDispersion,
      recommendedMode: recommendMode(ctx),
      suppressFlashes: overloadRisk > 0.55 || visualNoiseIndex > 0.5,
      suppressDuplicateIntel: overloadRisk > 0.45,
      throttleAlerts: alertFatigue > 0.5 || ctx.alertPressure > 60,
      updatedAt: Date.now(),
    };
  }
}
