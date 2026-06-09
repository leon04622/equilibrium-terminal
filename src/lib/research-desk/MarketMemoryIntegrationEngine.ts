import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import type { MemoryIntegrationContext } from "@/types/research-operating";

export class MarketMemoryIntegrationEngine {
  static context(asset: string): MemoryIntegrationContext {
    try {
      const mem = MarketMemoryOrchestrator.snapshot(asset);
      const replay = chartReplayEngine.getState();
      return {
        analogCount: mem.analogs.length,
        archiveHits: mem.archive.length,
        replayLinked: replay.mode !== "live",
        regimeLabel: mem.currentRegime.label,
      };
    } catch {
      return {
        analogCount: 0,
        archiveHits: 0,
        replayLinked: false,
        regimeLabel: "unknown",
      };
    }
  }
}
