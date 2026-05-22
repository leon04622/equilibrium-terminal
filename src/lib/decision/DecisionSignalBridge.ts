import type { AggregatedDecisionContext } from "@/lib/decision/DecisionContextAggregator";
import type { DecisionSignal, SignalDomain } from "@/types/decision-engine";
import type { AgentSignal } from "@/types/agentic";

function sig(
  domain: SignalDomain,
  coin: string,
  stance: AgentSignal["stance"],
  confidence: number,
  label: string,
  evidence: string,
): DecisionSignal {
  return {
    id: `${domain}-${coin}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    domain,
    coin,
    stance,
    weight: 1,
    confidence: Math.min(0.98, Math.max(0.05, confidence)),
    label,
    evidence,
    timestamp: Date.now(),
  };
}

/** Maps aggregated terminal context into weighted decision signals. */
export class DecisionSignalBridge {
  static fromContext(ctx: AggregatedDecisionContext): DecisionSignal[] {
    const out: DecisionSignal[] = [];
    const { coin } = ctx;

    for (const a of ctx.agentSignals) {
      out.push(
        sig(
          "agentic",
          coin,
          a.stance,
          a.confidence,
          `${a.agentId.toUpperCase()} agent`,
          a.thesis,
        ),
      );
    }

    if (ctx.bookSkew === "bid") {
      out.push(
        sig("orderflow", coin, "bullish", 0.68, "Book bid-heavy", "Resting bid depth dominates."),
      );
    } else if (ctx.bookSkew === "ask") {
      out.push(
        sig("orderflow", coin, "bearish", 0.68, "Book ask-heavy", "Resting ask depth dominates."),
      );
    }

    const execConf = ctx.executionConfidence / 100;
    if (ctx.slippageRiskTier === "critical" || ctx.slippageRiskTier === "high") {
      out.push(
        sig(
          "execution",
          coin,
          "bearish",
          0.85,
          "Execution stress",
          `Slippage tier ${ctx.slippageRiskTier} · ${ctx.slippageBps.toFixed(1)}bps simulated.`,
        ),
      );
    } else if (execConf > 0.65) {
      out.push(
        sig(
          "execution",
          coin,
          "bullish",
          execConf,
          "Execution quality",
          `Pipeline confidence ${ctx.executionConfidence}% · spread ${ctx.spreadBps.toFixed(1)}bps.`,
        ),
      );
    }

    const regimeStance =
      ctx.regime === "risk-on"
        ? "bullish"
        : ctx.regime === "risk-off" || ctx.regime === "liquidation"
          ? "bearish"
          : "neutral";
    out.push(
      sig(
        "macro",
        coin,
        regimeStance,
        Math.min(0.9, 0.45 + ctx.stressScore / 200),
        `Macro ${ctx.regime}`,
        `Stress ${ctx.stressScore.toFixed(0)} · velocity ${ctx.velocityRatio.toFixed(2)}x.`,
      ),
    );

    if (ctx.velocityRatio > 1.4) {
      out.push(
        sig(
          "volatility",
          coin,
          "neutral",
          0.75,
          "Volatility expansion",
          `Trade velocity ${ctx.velocityRatio.toFixed(2)}x baseline.`,
        ),
      );
    }

    if (Math.abs(ctx.narrativeAcceleration) > 25) {
      const stance = ctx.narrativeAcceleration > 0 ? "bullish" : "bearish";
      out.push(
        sig(
          "narrative",
          coin,
          stance,
          Math.min(0.88, Math.abs(ctx.narrativeAcceleration) / 100),
          "Narrative pulse",
          `Acceleration ${ctx.narrativeAcceleration > 0 ? "+" : ""}${ctx.narrativeAcceleration.toFixed(0)}.`,
        ),
      );
    }

    for (const item of ctx.intelligence.slice(0, 6)) {
      const stance =
        item.severity === "critical"
          ? "bearish"
          : item.severity === "watch"
            ? "neutral"
            : "neutral";
      const conf =
        item.severity === "critical" ? 0.75 : item.severity === "watch" ? 0.55 : 0.4;
      out.push(
        sig("narrative", coin, stance, conf, item.title.slice(0, 48), item.detail.slice(0, 80)),
      );
    }

    if (ctx.positionCount > 0) {
      out.push(
        sig(
          "positioning",
          coin,
          "neutral",
          0.6,
          "Active exposure",
          `${ctx.positionCount} open position(s) — bias toward risk management.`,
        ),
      );
    }

    for (const fused of ctx.fusedOpportunities.slice(0, 2)) {
      out.push(
        sig(
          "agentic",
          coin,
          fused.dominantStance,
          fused.fusedConfidenceScore,
          "Fused agent consensus",
          fused.thesis,
        ),
      );
    }

    return out;
  }
}
