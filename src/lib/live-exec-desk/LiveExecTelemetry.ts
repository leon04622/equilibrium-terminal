import type { LiveExecTelemetrySnapshot } from "@/types/live-execution";

let t0 = 0;

export class LiveExecTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    openPositions: number;
    activeAlerts: number;
    pipelineActive: boolean;
    execConfidence: number;
  }): LiveExecTelemetrySnapshot {
    const computeLatencyMs = Math.round(performance.now() - t0);
    const liveExecScore = Math.min(
      100,
      Math.round(
        input.execConfidence * 0.4 +
          (input.pipelineActive ? 25 : 5) +
          Math.max(0, 20 - input.activeAlerts * 4) +
          (input.openPositions > 0 ? 10 : 15),
      ),
    );

    return {
      openPositions: input.openPositions,
      activeAlerts: input.activeAlerts,
      pipelineActive: input.pipelineActive,
      computeLatencyMs,
      liveExecScore,
    };
  }
}
