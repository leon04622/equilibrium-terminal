import { historicalEventArchive } from "@/lib/market-memory/historicalEventArchive";
import { RegimeAnalysisEngine } from "@/lib/market-memory/RegimeAnalysisEngine";
import type { MarketMemoryTelemetrySnapshot } from "@/types/market-memory";

let lastComputeAt = 0;

export class MarketMemoryTelemetry {
  static begin(): void {
    lastComputeAt = performance.now();
  }

  static snapshot(asset: string): MarketMemoryTelemetrySnapshot {
    const latency = lastComputeAt > 0 ? Math.max(0, Math.round(performance.now() - lastComputeAt)) : 0;
    const archiveSize = historicalEventArchive.forAsset(asset).length;
    const regimeEpochs = RegimeAnalysisEngine.epochs(asset).length;
    const storageQualityScore = Math.min(100, archiveSize * 2 + regimeEpochs * 8 + 20);

    return {
      archiveSize,
      regimeEpochs,
      computeLatencyMs: latency,
      storageQualityScore,
    };
  }
}
