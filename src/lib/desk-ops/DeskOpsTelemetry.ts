import type { DeskOpsTelemetrySnapshot } from "@/types/desk-operations";

let t0 = 0;

export class DeskOpsTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    activeMembers: number;
    sharedAnnotations: number;
    deskAlerts: number;
    auditEvents: number;
  }): DeskOpsTelemetrySnapshot {
    const computeLatencyMs = Math.round(performance.now() - t0);
    const orgScore = Math.min(
      100,
      Math.round(
        input.activeMembers * 8 +
          input.sharedAnnotations * 2 +
          input.deskAlerts * 3 +
          Math.min(20, input.auditEvents),
      ),
    );

    return {
      activeMembers: input.activeMembers,
      sharedAnnotations: input.sharedAnnotations,
      deskAlerts: input.deskAlerts,
      auditEvents: input.auditEvents,
      computeLatencyMs,
      orgScore,
    };
  }
}
