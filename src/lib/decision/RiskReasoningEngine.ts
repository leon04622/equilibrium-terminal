import type { AggregatedDecisionContext } from "@/lib/decision/DecisionContextAggregator";
import type { RiskFactor } from "@/types/decision-engine";

export class RiskReasoningEngine {
  static evaluate(ctx: AggregatedDecisionContext): RiskFactor[] {
    const risks: RiskFactor[] = [];

    if (ctx.velocityRatio > 1.35 || ctx.stressScore > 65) {
      risks.push({
        id: "risk-vol",
        category: "volatility",
        severity: Math.min(1, ctx.velocityRatio / 2),
        headline: "VOLATILITY RISK",
        explanation:
          `Trade velocity ${ctx.velocityRatio.toFixed(2)}x and stress ${ctx.stressScore.toFixed(0)} ` +
          "imply widened ranges — stops must account for expansion.",
      });
    }

    if (ctx.spreadBps > 12 || ctx.slippageBps > 8) {
      risks.push({
        id: "risk-liq",
        category: "liquidity",
        severity: Math.min(1, ctx.spreadBps / 25),
        headline: "LIQUIDITY RISK",
        explanation:
          `Spread ${ctx.spreadBps.toFixed(1)}bps and simulated slippage ${ctx.slippageBps.toFixed(1)}bps ` +
          "— size reduction or limit-only execution advised.",
      });
    }

    if (ctx.slippageRiskTier === "high" || ctx.slippageRiskTier === "critical") {
      risks.push({
        id: "risk-exec",
        category: "execution",
        severity: ctx.slippageRiskTier === "critical" ? 0.95 : 0.75,
        headline: "EXECUTION RISK",
        explanation:
          `Slippage radar tier ${ctx.slippageRiskTier.toUpperCase()} — adverse selection and sweep risk elevated near touch.`,
      });
    }

    if (ctx.regime === "liquidation" || ctx.regime === "risk-off") {
      risks.push({
        id: "risk-macro",
        category: "macro_event",
        severity: ctx.regime === "liquidation" ? 0.9 : 0.65,
        headline: "MACRO EVENT RISK",
        explanation:
          `Regime ${ctx.regime} — cross-asset correlation spikes; beta hedges and reduced gross exposure warranted.`,
      });
    }

    if (Math.abs(ctx.narrativeAcceleration) > 40) {
      risks.push({
        id: "risk-crowd",
        category: "crowding",
        severity: Math.min(1, Math.abs(ctx.narrativeAcceleration) / 80),
        headline: "CROWDING RISK",
        explanation:
          "Narrative acceleration extreme — late entrants vulnerable to exhaustion reversals.",
      });
    }

    if (ctx.executionConfidence < 40) {
      risks.push({
        id: "risk-ext",
        category: "overextension",
        severity: 0.55,
        headline: "OVEREXTENSION RISK",
        explanation:
          "Low execution pipeline confidence — momentum may be overextended vs available liquidity.",
      });
    }

    return risks.sort((a, b) => b.severity - a.severity).slice(0, 6);
  }
}
