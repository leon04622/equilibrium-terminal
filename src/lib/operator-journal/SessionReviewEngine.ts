import type {
  BehavioralFlag,
  DecisionEntry,
  ExecutionQuality,
  OperatorScorecard,
  OperatorSession,
  SessionReview,
} from "@/types/operator-journal";

const FLAG_LABEL: Record<BehavioralFlag["kind"], string> = {
  revenge_trading: "Revenge trading",
  overtrading: "Overtrading",
  volatility_chasing: "Volatility chasing",
  poor_liquidity_exec: "Poor-liquidity execution",
  oversized_risk: "Oversized risk",
  emotional_deterioration: "Emotional deterioration",
};

export class SessionReviewEngine {
  static generate(
    session: OperatorSession,
    decisions: DecisionEntry[],
    execution: ExecutionQuality,
    flags: BehavioralFlag[],
    scorecard: OperatorScorecard,
  ): SessionReview {
    const sorted = [...decisions].sort((a, b) => b.confidence - a.confidence);
    const bestDecision = sorted[0] ?? null;
    const worstDecision =
      sorted.length > 1 ? sorted[sorted.length - 1] : null;

    const dangerousBehaviors = Array.from(new Set(flags.map((f) => FLAG_LABEL[f.kind])));

    const volExposure = session.volatilityExposure;
    const volatilityAdaptation = volExposure.includes("extreme")
      ? execution.chaseRate > 0.3
        ? "Struggled in extreme volatility — chased low-conviction entries."
        : "Handled extreme volatility with discipline — limited chasing."
      : volExposure.includes("elevated")
        ? "Operated through elevated volatility; watch sizing on expansion."
        : "Mostly calm volatility — clean operating environment.";

    const missedOpportunities =
      decisions.filter((d) => d.kind === "skip").length > 0
        ? "Logged skips — review whether any were valid setups passed on hesitation."
        : "No skips logged — ensure you are not forcing trades to stay active.";

    const observations: string[] = [];
    observations.push(
      `Session ran ${Math.round(session.durationMs / 60_000)} min across ${session.regimesParticipated.join(", ") || "n/a"} regime(s).`,
    );
    observations.push(...execution.notes);
    if (flags.length === 0) {
      observations.push("No behavioral warnings — disciplined session.");
    } else {
      observations.push(`${flags.length} behavioral flag(s) raised this session.`);
    }
    if (scorecard.grade === "A" || scorecard.grade === "B") {
      observations.push("Strong operator grade — repeat these conditions.");
    } else if (scorecard.grade === "D" || scorecard.grade === "F") {
      observations.push("Weak grade — prioritize discipline and execution timing tomorrow.");
    }

    return {
      generatedAt: Date.now(),
      sessionId: session.id,
      qualityScore: scorecard.composite,
      executionScore: execution.score,
      disciplineScore: scorecard.discipline,
      bestDecision,
      worstDecision,
      dangerousBehaviors,
      volatilityAdaptation,
      missedOpportunities,
      observations,
    };
  }
}
