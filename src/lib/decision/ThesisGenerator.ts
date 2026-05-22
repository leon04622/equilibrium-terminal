import type { AggregatedDecisionContext } from "@/lib/decision/DecisionContextAggregator";
import type {
  DecisionSignal,
  TimeframeClass,
  TradeThesis,
} from "@/types/decision-engine";
import type { SignalStance } from "@/types/agentic";

function buildThesis(
  coin: string,
  stance: SignalStance,
  ctx: AggregatedDecisionContext,
  signals: DecisionSignal[],
  confidence: number,
  timeframe: TimeframeClass,
): TradeThesis {
  const supporting = signals
    .filter((s) => s.stance === stance || (stance === "neutral" && s.stance === "neutral"))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((s) => `${s.label}: ${s.evidence}`);

  let summary = "";
  let invalidation = "";
  let analog: string | null = null;

  if (stance === "bullish") {
    summary =
      `${coin} showing constructive setup — ` +
      (ctx.bookSkew === "bid"
        ? "bid-heavy book with "
        : "") +
      (ctx.regime === "risk-on"
        ? "risk-on macro tailwind."
        : "supportive microstructure despite mixed macro.");
    invalidation =
      ctx.mid != null
        ? `Invalidate below ${(ctx.mid * 0.985).toFixed(2)} or on regime shift to risk-off.`
        : "Invalidate on bearish order-flow flip and slippage tier escalation.";
    analog = "Similar to prior squeeze: rising participation + negative funding divergence.";
  } else if (stance === "bearish") {
    summary =
      `${coin} momentum weakening — ` +
      (ctx.slippageRiskTier === "high" || ctx.slippageRiskTier === "critical"
        ? "execution stress elevated; "
        : "") +
      (ctx.regime === "risk-off" || ctx.regime === "liquidation"
        ? "macro risk increasing with thinning liquidity near resistance."
        : "liquidity thins near local resistance with ask-heavy book.");
    invalidation =
      ctx.mid != null
        ? `Invalidate above ${(ctx.mid * 1.015).toFixed(2)} on sustained bid absorption.`
        : "Invalidate on macro relief and order-flow reversal to bid-heavy.";
    analog = "Analog: prior distribution phase — OI rise with negative funding and outflows.";
  } else {
    summary =
      `${coin} in equilibrium — conflicting signals suggest range / wait-for-catalyst posture.`;
    invalidation = "Break of range with aligned order flow + macro required for directional bias.";
    analog = null;
  }

  return {
    id: `thesis-${stance}-${coin}-${Date.now()}`,
    coin,
    stance,
    summary,
    invalidation,
    supportingEvidence: supporting.length ? supporting : ["Insufficient aligned evidence."],
    historicalAnalog: analog,
    confidence,
    timeframe,
  };
}

export class ThesisGenerator {
  static generate(
    ctx: AggregatedDecisionContext,
    signals: DecisionSignal[],
    fusedStance: SignalStance,
    baseConfidence: number,
    mode: string,
  ): TradeThesis[] {
    const timeframe: TimeframeClass =
      mode === "scalper"
        ? "scalp"
        : mode === "swing"
          ? "swing"
          : mode === "macro"
            ? "position"
            : "intraday";

    const bullConf =
      signals.filter((s) => s.stance === "bullish").reduce((a, s) => a + s.confidence, 0) /
      Math.max(1, signals.filter((s) => s.stance === "bullish").length);
    const bearConf =
      signals.filter((s) => s.stance === "bearish").reduce((a, s) => a + s.confidence, 0) /
      Math.max(1, signals.filter((s) => s.stance === "bearish").length);

    return [
      buildThesis(ctx.coin, "bullish", ctx, signals, bullConf * baseConfidence, timeframe),
      buildThesis(ctx.coin, "bearish", ctx, signals, bearConf * baseConfidence, timeframe),
      buildThesis(ctx.coin, "neutral", ctx, signals, baseConfidence * 0.7, timeframe),
    ];
  }
}
