import type {
  BehavioralFlag,
  DecisionEntry,
  ExecutionQuality,
  OperatorScorecard,
} from "@/types/operator-journal";

function grade(score: number): OperatorScorecard["grade"] {
  if (score >= 88) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export class OperatorScorecardEngine {
  static score(
    execution: ExecutionQuality,
    flags: BehavioralFlag[],
    decisions: DecisionEntry[],
  ): OperatorScorecard {
    const criticalFlags = flags.filter((f) => f.severity === "critical").length;
    const watchFlags = flags.filter((f) => f.severity === "watch").length;

    const discipline = Math.max(
      0,
      100 - criticalFlags * 25 - watchFlags * 12 - Math.round(execution.overtradingPressure * 20),
    );

    const documented = decisions.filter((d) => d.thesis.trim().length > 0).length;
    const decisionQuality = decisions.length
      ? Math.round(
          (documented / decisions.length) * 60 +
            (decisions.reduce((a, d) => a + d.confidence, 0) / (decisions.length * 5)) * 40,
        )
      : 70;

    // Consistency: lower variance in confidence = steadier operation.
    let consistency = 75;
    if (decisions.length >= 3) {
      const confs = decisions.map((d) => d.confidence);
      const mean = confs.reduce((a, b) => a + b, 0) / confs.length;
      const variance = confs.reduce((a, b) => a + (b - mean) ** 2, 0) / confs.length;
      consistency = Math.max(40, Math.round(100 - variance * 18));
    }

    const composite = Math.round(
      execution.score * 0.3 + discipline * 0.3 + decisionQuality * 0.25 + consistency * 0.15,
    );

    return {
      execution: execution.score,
      discipline,
      decisionQuality,
      consistency,
      composite,
      grade: grade(composite),
    };
  }
}
