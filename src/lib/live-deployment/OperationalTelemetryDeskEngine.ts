import { RetentionMetricsEngine } from "@/lib/alpha/RetentionMetricsEngine";
import { WorkflowObserverEngine } from "@/lib/alpha/WorkflowObserverEngine";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import type { OperationalTelemetryRow } from "@/types/live-deployment";

export class OperationalTelemetryDeskEngine {
  static metrics(): OperationalTelemetryRow[] {
    const retention = RetentionMetricsEngine.snapshot();
    const telemetry = useTraderTelemetryStore.getState();
    const observations = WorkflowObserverEngine.observe();

    return [
      {
        id: "tel-session",
        metric: "avg_session_min",
        value: `${retention.avgSessionMin}`,
        signal: retention.avgSessionMin >= 45 ? "deep_work" : "forming",
      },
      {
        id: "tel-depth",
        metric: "workflow_depth",
        value: `${retention.workflowDepthScore}`,
        signal: retention.workflowDepthScore >= 60 ? "strong" : "shallow",
      },
      {
        id: "tel-omni",
        metric: "omnibar_usage",
        value: `${retention.omniBarUsageScore}`,
        signal: "command_adoption",
      },
      {
        id: "tel-panels",
        metric: "panel_engagement",
        value: `${retention.panelEngagementScore}`,
        signal: "dashboard_usage",
      },
      {
        id: "tel-events",
        metric: "telemetry_events",
        value: `${telemetry.eventRing.length}`,
        signal: "session_trace",
      },
      ...observations.slice(0, 3).map((o) => ({
        id: `tel-${o.signal}`,
        metric: o.signal,
        value: o.value,
        signal: o.weight,
      })),
    ];
  }
}
