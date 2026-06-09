import type { UnifiedOpsTelemetrySnapshot } from "@/types/unified-operations";

let t0 = 0;

export class UnifiedOpsTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    linkedSystems: number;
    propagationRules: number;
    continuityItems: number;
  }): UnifiedOpsTelemetrySnapshot {
    const orchestrationLatencyMs = Math.round(performance.now() - t0);
    const unifiedScore = Math.min(
      100,
      Math.round(
        input.linkedSystems * 8 +
          input.propagationRules * 4 +
          input.continuityItems * 5 +
          (orchestrationLatencyMs < 40 ? 20 : 10),
      ),
    );

    return {
      linkedSystems: input.linkedSystems,
      propagationRules: input.propagationRules,
      continuityItems: input.continuityItems,
      orchestrationLatencyMs,
      unifiedScore,
    };
  }
}
