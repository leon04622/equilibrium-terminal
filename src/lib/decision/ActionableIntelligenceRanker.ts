import type { AggregatedDecisionContext } from "@/lib/decision/DecisionContextAggregator";
import type {
  ActionableIntelligence,
  ActionableKind,
  ExecutionReadinessScore,
  MarketConflict,
  RiskFactor,
} from "@/types/decision-engine";
import type { SignalStance } from "@/types/agentic";

export class ActionableIntelligenceRanker {
  static rank(
    coin: string,
    fusedStance: SignalStance,
    confidence: number,
    ctx: AggregatedDecisionContext,
    conflicts: MarketConflict[],
    risks: RiskFactor[],
    readiness: ExecutionReadinessScore,
  ): ActionableIntelligence[] {
    const items: ActionableIntelligence[] = [];

    const push = (
      kind: ActionableKind,
      priority: number,
      headline: string,
      directive: string,
      conf: number,
    ) => {
      items.push({
        id: `action-${kind}-${Date.now()}-${items.length}`,
        kind,
        priority,
        headline,
        directive,
        confidence: conf,
        coin,
      });
    };

    if (fusedStance === "bullish" && confidence > 0.62 && readiness.score >= 55) {
      push(
        "high_conviction_long",
        95,
        "BULLISH STRUCTURE NOTED",
        "Order flow and context skew constructive — review book and macro before acting.",
        confidence,
      );
    }
    if (fusedStance === "bearish" && confidence > 0.62 && readiness.score >= 50) {
      push(
        "high_conviction_short",
        94,
        "BEARISH STRUCTURE NOTED",
        "Bearish signal alignment observed — verify liquidity and macro before acting.",
        confidence,
      );
    }

    if (ctx.regime === "liquidation" || risks.some((r) => r.category === "volatility" && r.severity > 0.7)) {
      push(
        "liquidation_risk",
        90,
        "ELEVATED LIQUIDATION RISK",
        "Volatility and cascade regime active — monitor clustered liq zones on chart overlay.",
        0.85,
      );
    }

    if (conflicts.length > 0 && confidence < 0.55) {
      push(
        "macro_conflict",
        88,
        "MACRO CONFLICT WARNING",
        conflicts[0].description + " — cross-check domains before sizing risk.",
        1 - conflicts[0].confidencePenalty,
      );
    }

    if (readiness.readiness === "dangerous" || readiness.readiness === "illiquid") {
      push(
        "execution_caution",
        92,
        "EXECUTION CAUTION ZONE",
        readiness.factors.join(" · ") || "Execution conditions degraded — review spread and slippage.",
        0.8,
      );
    }

    if (ctx.regime === "compression" && ctx.velocityRatio < 0.9) {
      push(
        "low_quality_breakout",
        70,
        "LOW-QUALITY BREAKOUT CONDITIONS",
        "Compression with muted velocity — breakout quality may be poor; confirm with tape.",
        0.65,
      );
    }

    if (Math.abs(ctx.narrativeAcceleration) > 45 && fusedStance !== "bullish") {
      push(
        "narrative_exhaustion",
        75,
        "NARRATIVE EXHAUSTION DETECTED",
        "Extreme narrative acceleration without order-flow confirmation — narrative exhaustion risk.",
        0.7,
      );
    }

    if (readiness.readiness === "trend_supportive") {
      push(
        "trend_continuation",
        72,
        "TREND CONTINUATION FAVORED",
        "Book skew and execution quality indicate directional tape persistence.",
        confidence,
      );
    }

    if (readiness.readiness === "mean_reverting") {
      push(
        "mean_reversion_zone",
        68,
        "MEAN REVERSION ZONE",
        "Compression + moderate readiness — range-bound behavior more likely than trend extension.",
        0.6,
      );
    }

    if (!items.length) {
      push(
        "neutral_observe",
        50,
        "MONITOR — LOW SIGNAL DENSITY",
        "No dominant development — maintain situational awareness across feeds.",
        confidence,
      );
    }

    return items.sort((a, b) => b.priority - a.priority).slice(0, 8);
  }
}
