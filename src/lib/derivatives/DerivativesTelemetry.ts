import { derivativesMarketState } from "@/lib/derivatives/derivativesMarketState";
import type { DerivativesTelemetrySnapshot } from "@/types/derivatives-intelligence";

let lastComputeAt = 0;

export class DerivativesTelemetry {
  static begin(): void {
    lastComputeAt = performance.now();
  }

  static snapshot(chainRows: number): DerivativesTelemetrySnapshot {
    const latency = lastComputeAt > 0 ? Math.max(0, Math.round(performance.now() - lastComputeAt)) : 0;
    const lastIngest = derivativesMarketState.lastIngestAt();
    const age = lastIngest > 0 ? Date.now() - lastIngest : 99_999;
    const feedQualityScore = Math.min(
      100,
      chainRows > 0 ? Math.max(40, 100 - Math.round(age / 1000)) : 25,
    );

    return {
      optionsRows: chainRows,
      lastIngestAt: lastIngest,
      computeLatencyMs: latency,
      feedQualityScore,
    };
  }
}
