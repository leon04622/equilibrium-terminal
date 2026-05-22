import type { AggregatedDecisionContext } from "@/lib/decision/DecisionContextAggregator";
import type { ExecutionReadiness, ExecutionReadinessScore } from "@/types/decision-engine";

export class ExecutionReadinessScorer {
  static score(ctx: AggregatedDecisionContext): ExecutionReadinessScore {
    const factors: string[] = [];
    let score = 50;

    if (ctx.executionConfidence >= 70 && ctx.spreadBps < 10) {
      score += 25;
      factors.push("Strong execution pipeline confidence");
    }
    if (ctx.slippageRiskTier === "low") {
      score += 15;
      factors.push("Slippage tier low");
    }
    if (ctx.slippageRiskTier === "critical" || ctx.slippageRiskTier === "high") {
      score -= 35;
      factors.push("Slippage tier elevated");
    }
    if (ctx.spreadBps > 15) {
      score -= 20;
      factors.push("Wide spread — illiquid touch");
    }
    if (ctx.velocityRatio > 1.5) {
      score -= 10;
      factors.push("High velocity — noisy tape");
    }
    if (ctx.bookSkew !== "neutral" && ctx.executionConfidence > 55) {
      score += 10;
      factors.push("Directional book skew supports flow");
    }
    if (ctx.regime === "compression") {
      score -= 5;
      factors.push("Compression regime — breakout risk");
    }

    score = Math.max(0, Math.min(100, score));

    let readiness: ExecutionReadiness = "favorable";
    if (score < 30) readiness = "dangerous";
    else if (score < 45) readiness = "illiquid";
    else if (score < 55 && ctx.velocityRatio > 1.3) readiness = "noisy";
    else if (score >= 65 && ctx.bookSkew !== "neutral") readiness = "trend_supportive";
    else if (ctx.regime === "compression" && score < 60) readiness = "mean_reverting";

    return { readiness, score, factors: factors.slice(0, 5) };
  }
}
