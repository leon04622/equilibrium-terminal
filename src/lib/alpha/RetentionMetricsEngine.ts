import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { RetentionMetrics, RetentionSignal } from "@/types/alpha-launch";

export class RetentionMetricsEngine {
  static snapshot(): RetentionMetrics {
    const telemetry = useTraderTelemetryStore.getState();
    const trends = telemetry.layoutFocusTrends;
    const events = telemetry.eventRing;
    const deskFocus = useWedgeStore.getState().deskFocusMode;
    const onboardPct = OnboardingEngine.completionPct();

    const panelEngagementScore = Math.min(
      100,
      trends.length * 8 + (deskFocus ? 40 : 65),
    );
    const omniEvents = events.filter((e) => e.kind === "omnibar_command").length;
    const omniBarUsageScore = Math.min(100, omniEvents * 12 + 20);

    const workflowDepthScore = Math.round(
      (panelEngagementScore * 0.4 + omniBarUsageScore * 0.3 + onboardPct * 0.3),
    );

    const habitFormationScore = Math.round(
      (workflowDepthScore + (telemetry.pipelineActive ? 15 : 0)) * 0.9,
    );

    let dependencySignal: RetentionSignal = "unknown";
    if (habitFormationScore >= 75) dependencySignal = "forming";
    else if (habitFormationScore >= 55) dependencySignal = "emerging";
    else if (habitFormationScore >= 35) dependencySignal = "weak";

    const avgSessionMin = Math.round(
      Math.max(5, events.length / 4 + (telemetry.pipelineActive ? 12 : 4)),
    );

    return {
      sessions7d: Math.max(1, Math.floor(events.length / 40) + 1),
      avgSessionMin,
      workflowDepthScore,
      panelEngagementScore,
      omniBarUsageScore,
      habitFormationScore,
      dependencySignal,
      dailyReturnLikelihood: Math.min(95, habitFormationScore + (onboardPct > 80 ? 10 : 0)),
    };
  }
}
