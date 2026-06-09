import type { GlobalIntelTelemetrySnapshot } from "@/types/global-intelligence";

let t0 = 0;

export class GlobalIntelTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    wireItems: number;
    macroEvents: number;
    criticalAlerts: number;
  }): GlobalIntelTelemetrySnapshot {
    const computeLatencyMs = Math.round(performance.now() - t0);
    const globalScore = Math.min(
      100,
      Math.round(
        input.wireItems * 2 +
          input.macroEvents * 3 +
          (input.criticalAlerts > 0 ? 25 : 10) +
          Math.min(30, input.criticalAlerts * 8),
      ),
    );

    return {
      wireItems: input.wireItems,
      macroEvents: input.macroEvents,
      criticalAlerts: input.criticalAlerts,
      computeLatencyMs,
      globalScore,
    };
  }
}
