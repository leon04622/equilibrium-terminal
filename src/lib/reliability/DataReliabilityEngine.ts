import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { DataReliabilitySnapshot } from "@/types/reliability";

export class DataReliabilityEngine {
  static snapshot(): DataReliabilitySnapshot {
    const coverage = useMarketCoverageStore.getState().snapshot;
    const terminal = useTerminalStore.getState();
    const now = Date.now();
    const lag = terminal.lastMessageAt ? now - terminal.lastMessageAt : 99999;

    const sourceVerification = coverage
      ? Math.max(0, Math.min(100, coverage.dataQuality.overallTrust))
      : 58;
    const redundancyCoverage = coverage
      ? Math.min(100, Math.round((coverage.dataQuality.feedsOnline / Math.max(1, coverage.dataQuality.feedsTotal)) * 100))
      : 40;
    const staleFeedCount = coverage?.dataQuality.staleSources.length ?? 0;
    const conflictCount = coverage?.dataQuality.conflictCount ?? 0;
    const timestampIntegrity = lag < 2000 ? 96 : lag < 6000 ? 78 : 42;
    const streamIntegrityScore = Math.max(0, 100 - staleFeedCount * 8 - conflictCount * 6);
    const qualityScore = Math.round(
      timestampIntegrity * 0.32 +
        sourceVerification * 0.28 +
        redundancyCoverage * 0.2 +
        streamIntegrityScore * 0.2,
    );

    return {
      timestampIntegrity,
      sourceVerification,
      redundancyCoverage,
      conflictCount,
      staleFeedCount,
      streamIntegrityScore,
      qualityScore,
      updatedAt: now,
    };
  }
}
