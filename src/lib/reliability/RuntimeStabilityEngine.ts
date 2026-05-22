import { useTerminalStore } from "@/store/terminalStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import type { RuntimeHealthSnapshot } from "@/types/reliability";

let reconnectAttempts = 0;
let prevStatus: string | null = null;

export class RuntimeStabilityEngine {
  static snapshot(): RuntimeHealthSnapshot {
    const terminal = useTerminalStore.getState();
    const telemetry = useTraderTelemetryStore.getState();
    const now = Date.now();
    const lag = terminal.lastMessageAt ? Math.max(0, now - terminal.lastMessageAt) : 99999;

    if (prevStatus !== "reconnecting" && terminal.connectionStatus === "reconnecting") {
      reconnectAttempts += 1;
    }
    prevStatus = terminal.connectionStatus;

    const websocketHealth =
      terminal.connectionStatus === "connected" && lag < 4000
        ? "healthy"
        : terminal.connectionStatus === "disconnected"
          ? "disconnected"
          : "degraded";

    const streamThroughputPerMin = Math.min(
      12000,
      Math.round((telemetry.vitals.eventsPerSecond || 0) * 60),
    );

    const renderCostScore = Math.min(100, Math.round(telemetry.metrics.cognitiveFrictionScore));
    const memoryPressure: RuntimeHealthSnapshot["memoryPressure"] =
      telemetry.vitals.memoryHintMb > 900 ? "high" : telemetry.vitals.memoryHintMb > 500 ? "moderate" : "low";
    const cpuPressure: RuntimeHealthSnapshot["cpuPressure"] =
      telemetry.vitals.avgProcessMs > 28 ? "high" : telemetry.vitals.avgProcessMs > 14 ? "moderate" : "low";
    const stateSyncConsistency = terminal.connectionStatus === "connected" ? 92 : 68;

    return {
      websocketHealth,
      reconnectAttempts,
      lastMessageLagMs: lag,
      streamThroughputPerMin,
      renderCostScore,
      memoryPressure,
      cpuPressure,
      stateSyncConsistency,
      updatedAt: now,
    };
  }
}
