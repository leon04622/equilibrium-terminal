import { RetentionMetricsEngine } from "@/lib/alpha/RetentionMetricsEngine";
import { TrustValidationEngine } from "@/lib/alpha/TrustValidationEngine";
import type { RetentionInsightRow } from "@/types/live-deployment";

export class RetentionDependencyEngine {
  static insights(): RetentionInsightRow[] {
    const r = RetentionMetricsEngine.snapshot();
    const trust = TrustValidationEngine.evaluate();

    const execTrust = trust.find((t) => t.dimension === "Execution confidence");
    const habit = r.dependencySignal;

    return [
      {
        id: "ret-habit",
        insight: "daily_habit_signal",
        strength: habit,
        implication:
          habit === "forming"
            ? "Operational dependency forming — protect core workflows"
            : "Increase workflow depth before expanding features",
      },
      {
        id: "ret-return",
        insight: "daily_return_likelihood",
        strength: `${r.dailyReturnLikelihood}%`,
        implication: r.dailyReturnLikelihood >= 70 ? "Retention-positive cohort" : "Investigate abandonment triggers",
      },
      {
        id: "ret-exec",
        insight: "execution_trust",
        strength: `${execTrust?.score ?? 0}/100`,
        implication: (execTrust?.score ?? 0) >= 75 ? "Execution desk is anchor workflow" : "Harden execution visibility",
      },
      {
        id: "ret-sessions",
        insight: "sessions_7d",
        strength: `${r.sessions7d}`,
        implication: "Real-world usage depth — prioritize reliability over new panels",
      },
    ];
  }
}
