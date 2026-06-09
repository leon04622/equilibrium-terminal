import { AlphaFeatureFlags } from "@/lib/alpha/AlphaFeatureFlags";
import { FeedbackIterationEngine } from "@/lib/alpha/FeedbackIterationEngine";
import { InviteGateEngine } from "@/lib/alpha/InviteGateEngine";
import { RetentionMetricsEngine } from "@/lib/alpha/RetentionMetricsEngine";
import { TrustValidationEngine } from "@/lib/alpha/TrustValidationEngine";
import { WorkflowObserverEngine } from "@/lib/alpha/WorkflowObserverEngine";
import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import { resolveDeploymentEnvironment } from "@/config/environments";
import type { AlphaLaunchSnapshot, AlphaSuccessIndicator } from "@/types/alpha-launch";

export class AlphaOrchestrator {
  static snapshot(): AlphaLaunchSnapshot {
    const retention = RetentionMetricsEngine.snapshot();
    const trust = TrustValidationEngine.evaluate();
    const hardening = HardeningOrchestrator.snapshot();
    const flags = AlphaFeatureFlags.all();
    const killSwitchActive = AlphaFeatureFlags.anyKillSwitchActive();

    const trustAvg = Math.round(
      trust.reduce((a, t) => a + t.score, 0) / Math.max(1, trust.length),
    );

    const operationalScore = Math.round(
      (retention.habitFormationScore * 0.35 +
        trustAvg * 0.35 +
        hardening.launchReadinessScore * 0.3) *
        (killSwitchActive ? 0.85 : 1),
    );

    const successIndicators: AlphaSuccessIndicator[] = [
      {
        label: "Daily return likelihood",
        met: retention.dailyReturnLikelihood >= 70,
        detail: `${retention.dailyReturnLikelihood}%`,
      },
      {
        label: "Habit formation",
        met: retention.dependencySignal === "forming" || retention.dependencySignal === "emerging",
        detail: retention.dependencySignal,
      },
      {
        label: "Execution trust",
        met: (trust.find((t) => t.dimension === "Execution confidence")?.score ?? 0) >= 75,
        detail: "Reconciliation health",
      },
      {
        label: "Workflow depth",
        met: retention.workflowDepthScore >= 60,
        detail: `${retention.workflowDepthScore}`,
      },
      {
        label: "Launch hardening",
        met: hardening.launchApproved,
        detail: `L${hardening.launchReadinessScore}`,
      },
    ];

    const env = resolveDeploymentEnvironment();
    const rolloutPct = env === "production" ? 15 : env === "staging" ? 35 : 100;

    return {
      inviteActive: InviteGateEngine.inviteRequired(),
      inviteValidated: InviteGateEngine.isValidated(),
      cohort: InviteGateEngine.cohort(),
      rolloutPct,
      environmentIsolated: env !== "production",
      killSwitchActive,
      featureFlags: flags,
      retention,
      trust,
      workflowObservations: WorkflowObserverEngine.observe(),
      painPoints: FeedbackIterationEngine.painPoints(),
      successIndicators,
      operationalScore,
      iterationFocus: FeedbackIterationEngine.iterationFocus(),
      updatedAt: Date.now(),
    };
  }
}
