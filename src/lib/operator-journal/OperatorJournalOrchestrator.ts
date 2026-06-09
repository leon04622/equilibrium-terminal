import { BehavioralDetectionEngine } from "@/lib/operator-journal/BehavioralDetectionEngine";
import { ExecutionQualityEngine } from "@/lib/operator-journal/ExecutionQualityEngine";
import { MarketContextStampEngine } from "@/lib/operator-journal/MarketContextStampEngine";
import { OperatorScorecardEngine } from "@/lib/operator-journal/OperatorScorecardEngine";
import { PerformancePatternEngine } from "@/lib/operator-journal/PerformancePatternEngine";
import { SessionReviewEngine } from "@/lib/operator-journal/SessionReviewEngine";
import { useOperatorJournalStore } from "@/store/useOperatorJournalStore";
import type { OperatorJournalSnapshot } from "@/types/operator-journal";

export class OperatorJournalOrchestrator {
  static snapshot(): OperatorJournalSnapshot {
    const { session, decisions, history } = useOperatorJournalStore.getState();
    const context = MarketContextStampEngine.stamp();

    const executionQuality = ExecutionQualityEngine.assess(decisions, context);
    const behavioralFlags = BehavioralDetectionEngine.detect(decisions);
    const scorecard = OperatorScorecardEngine.score(executionQuality, behavioralFlags, decisions);
    const patterns = PerformancePatternEngine.analyze(history);

    const liveSession = { ...session, durationMs: Date.now() - session.startedAt };
    const review =
      decisions.length > 0
        ? SessionReviewEngine.generate(
            liveSession,
            decisions,
            executionQuality,
            behavioralFlags,
            scorecard,
          )
        : null;

    return {
      session: liveSession,
      decisions,
      executionQuality,
      behavioralFlags,
      review,
      patterns,
      scorecard,
      history,
      context,
      updatedAt: Date.now(),
    };
  }
}
