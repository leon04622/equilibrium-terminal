import { DecisionContextAggregator } from "@/lib/decision/DecisionContextAggregator";
import { DecisionSignalBridge } from "@/lib/decision/DecisionSignalBridge";
import { MODE_DOMAIN_WEIGHTS } from "@/lib/decision/DecisionModeWeights";
import { ConflictResolver } from "@/lib/decision/ConflictResolver";
import { ThesisGenerator } from "@/lib/decision/ThesisGenerator";
import { RiskReasoningEngine } from "@/lib/decision/RiskReasoningEngine";
import { ExecutionReadinessScorer } from "@/lib/decision/ExecutionReadinessScorer";
import { MarketStateSynthesizer } from "@/lib/decision/MarketStateSynthesizer";
import { ActionableIntelligenceRanker } from "@/lib/decision/ActionableIntelligenceRanker";
import type {
  DecisionSnapshot,
  DecisionTraderMode,
  DecisionSignal,
  StrategicBriefing,
} from "@/types/decision-engine";
import type { SignalStance } from "@/types/agentic";

const STANCE_VEC: Record<SignalStance, number> = {
  bullish: 1,
  neutral: 0,
  bearish: -1,
};

function applyModeWeights(
  signals: DecisionSignal[],
  mode: DecisionTraderMode,
): DecisionSignal[] {
  const weights = MODE_DOMAIN_WEIGHTS[mode];
  return signals.map((s) => ({
    ...s,
    weight: (weights[s.domain] ?? 1) * s.weight,
  }));
}

function fuseStance(signals: DecisionSignal[]): {
  stance: SignalStance;
  confidence: number;
} {
  if (!signals.length) return { stance: "neutral", confidence: 0.3 };
  let vec = 0;
  let wSum = 0;
  let conf = 0;
  for (const s of signals) {
    const w = s.weight * s.confidence;
    vec += STANCE_VEC[s.stance] * w;
    wSum += w;
    conf += s.confidence * s.weight;
  }
  const norm = wSum || 1;
  const v = vec / norm;
  const stance: SignalStance = v > 0.12 ? "bullish" : v < -0.12 ? "bearish" : "neutral";
  return {
    stance,
    confidence: Math.min(0.98, Math.max(0.1, conf / signals.length)),
  };
}

function buildBriefing(
  coin: string,
  marketState: DecisionSnapshot["marketState"],
  primaryThesis: string,
  risks: DecisionSnapshot["risks"],
  readiness: DecisionSnapshot["executionReadiness"],
  fusedStance: SignalStance,
  confidence: number,
  challenge: string | null,
): StrategicBriefing {
  const keyRisk = risks[0]?.explanation ?? "No elevated risk factors detected.";
  const execGuidance =
    readiness.readiness === "favorable" || readiness.readiness === "trend_supportive"
      ? "Conditions support tactical execution with standard size."
      : readiness.readiness === "dangerous" || readiness.readiness === "illiquid"
        ? "Stand down or reduce size — execution environment hostile."
        : `Posture: ${readiness.readiness.replace(/_/g, " ")} (score ${readiness.score}).`;

  return {
    coin,
    marketState: `${marketState.label} · regime ${marketState.regime} · bias ${marketState.compositeBias > 0 ? "+" : ""}${marketState.compositeBias.toFixed(1)}`,
    primaryThesis,
    keyRisk,
    executionGuidance: execGuidance,
    challengeNote:
      challenge ??
      (confidence < 0.5
        ? `Weak setup: ${fusedStance} stance lacks conviction — wait for alignment.`
        : null),
    updatedAt: Date.now(),
  };
}

/**
 * Central decision orchestrator — context → fusion → thesis → risk → actionables.
 */
export class DecisionEngine {
  static evaluate(coin: string, traderMode: DecisionTraderMode): DecisionSnapshot {
    const ctx = DecisionContextAggregator.aggregate(coin);
    let signals = DecisionSignalBridge.fromContext(ctx);
    signals = applyModeWeights(signals, traderMode);

    const { conflicts, confidencePenalty } = ConflictResolver.resolve(signals);
    const { stance: fusedStance, confidence: rawConf } = fuseStance(signals);
    const decisionConfidence = Math.max(
      0.05,
      Math.min(0.99, rawConf * (1 - confidencePenalty)),
    );

    const marketState = MarketStateSynthesizer.synthesize(ctx, signals);
    const theses = ThesisGenerator.generate(
      ctx,
      signals,
      fusedStance,
      decisionConfidence,
      traderMode,
    );
    const risks = RiskReasoningEngine.evaluate(ctx);
    const executionReadiness = ExecutionReadinessScorer.score(ctx);
    const actionables = ActionableIntelligenceRanker.rank(
      ctx.coin,
      fusedStance,
      decisionConfidence,
      ctx,
      conflicts,
      risks,
      executionReadiness,
    );

    const primaryThesis =
      theses.find((t) => t.stance === fusedStance)?.summary ?? theses[0]?.summary ?? "—";

    const challenge =
      conflicts.length > 0
        ? `Challenge: ${conflicts[0].description} — confidence penalized ${(confidencePenalty * 100).toFixed(0)}%.`
        : null;

    const briefing = buildBriefing(
      ctx.coin,
      marketState,
      primaryThesis,
      risks,
      executionReadiness,
      fusedStance,
      decisionConfidence,
      challenge,
    );

    return {
      coin: ctx.coin,
      traderMode,
      decisionConfidence,
      fusedStance,
      marketState,
      theses,
      conflicts,
      risks,
      actionables,
      executionReadiness,
      briefing,
      signals,
      updatedAt: Date.now(),
    };
  }
}

export const decisionEngine = DecisionEngine;
