import type { OperatorAiTelemetrySnapshot } from "@/types/operator-ai";

let t0 = 0;

export class OperatorAiTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    contextSources: number;
    summariesGenerated: number;
    retrievalHits: number;
  }): OperatorAiTelemetrySnapshot {
    const inferenceLatencyMs = Math.round(performance.now() - t0);
    const assistantScore = Math.min(
      100,
      Math.round(
        input.contextSources * 10 +
          input.summariesGenerated * 2 +
          input.retrievalHits * 3 +
          (inferenceLatencyMs < 50 ? 15 : 8),
      ),
    );

    return {
      contextSources: input.contextSources,
      summariesGenerated: input.summariesGenerated,
      retrievalHits: input.retrievalHits,
      inferenceLatencyMs,
      assistantScore,
    };
  }
}
