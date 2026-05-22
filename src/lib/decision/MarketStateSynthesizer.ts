import type { AggregatedDecisionContext } from "@/lib/decision/DecisionContextAggregator";
import type { DecisionSignal, MarketStateModel } from "@/types/decision-engine";
import type { MarketRegime } from "@/types/market-atmosphere";

function domainScore(signals: DecisionSignal[], domain: DecisionSignal["domain"]): number {
  const subset = signals.filter((s) => s.domain === domain);
  if (!subset.length) return 50;
  let v = 0;
  let w = 0;
  for (const s of subset) {
    const mult = s.stance === "bullish" ? 1 : s.stance === "bearish" ? -1 : 0;
    v += mult * s.confidence * 100 * s.weight;
    w += s.weight;
  }
  return Math.max(0, Math.min(100, 50 + (w ? v / w : 0)));
}

export class MarketStateSynthesizer {
  static synthesize(
    ctx: AggregatedDecisionContext,
    signals: DecisionSignal[],
  ): MarketStateModel {
    const orderFlowScore = domainScore(signals, "orderflow");
    const macroScore = domainScore(signals, "macro");
    const narrativeScore = domainScore(signals, "narrative");
    const liquidityScore = Math.max(
      0,
      Math.min(100, 100 - ctx.spreadBps * 2 - ctx.slippageBps),
    );
    const volatilityScore = Math.min(100, ctx.velocityRatio * 40 + ctx.stressScore * 0.3);
    const sentimentScore = domainScore(signals, "narrative");
    const positioningScore = domainScore(signals, "positioning");

    const compositeBias =
      (orderFlowScore -
        50 +
        macroScore -
        50 +
        narrativeScore -
        50) /
      3;

    const label =
      compositeBias > 12
        ? "CONSTRUCTIVE BIAS"
        : compositeBias < -12
          ? "DEFENSIVE BIAS"
          : "MIXED / RANGE";

    return {
      coin: ctx.coin,
      regime: ctx.regime as MarketRegime,
      volatilityScore,
      liquidityScore,
      sentimentScore,
      positioningScore,
      narrativeScore,
      macroScore,
      orderFlowScore,
      compositeBias,
      label,
      updatedAt: Date.now(),
    };
  }
}
