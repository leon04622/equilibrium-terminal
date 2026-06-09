import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { WorkflowObservationRow } from "@/types/alpha-launch";

export class WorkflowObserverEngine {
  static observe(): WorkflowObservationRow[] {
    const telemetry = useTraderTelemetryStore.getState();
    const topPanels = [...telemetry.layoutFocusTrends]
      .sort((a, b) => b.totalDwellMs - a.totalDwellMs)
      .slice(0, 3)
      .map((t) => t.panelId)
      .join(", ");

    const omniCount = telemetry.eventRing.filter((e) => e.kind === "omnibar_command").length;
    const alertSignals = telemetry.metrics.bypassedCriticalAlerts + telemetry.metrics.bypassedWatchAlerts;

    return [
      {
        signal: "Top panels",
        value: topPanels || "hyperbook, chart, ticket",
        weight: "high",
      },
      {
        signal: "Desk mode",
        value: useWedgeStore.getState().deskFocusMode ? "HL execution desk" : "Full terminal",
        weight: "high",
      },
      {
        signal: "OmniBar commands",
        value: String(omniCount),
        weight: "high",
      },
      {
        signal: "Stream",
        value: useTerminalStore.getState().connectionStatus,
        weight: "high",
      },
      {
        signal: "Alert interaction",
        value: `${alertSignals} bypassed`,
        weight: "medium",
      },
      {
        signal: "Cognitive friction",
        value: String(Math.round(telemetry.metrics.cognitiveFrictionScore)),
        weight: "medium",
      },
      {
        signal: "Workspace persist",
        value: useTerminalStore.getState().selectedAsset?.symbol ?? "—",
        weight: "medium",
      },
      {
        signal: "Session pipeline",
        value: telemetry.pipelineActive ? "active" : "idle",
        weight: "low",
      },
    ];
  }
}
