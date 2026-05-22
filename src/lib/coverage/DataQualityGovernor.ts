import { IngestQualityGovernor } from "@/lib/ingest/IngestQualityGovernor";
import { MarketCoverageRegistry } from "@/lib/coverage/MarketCoverageRegistry";
import { useTerminalStore } from "@/store/terminalStore";
import type { DataQualityReport } from "@/types/market-coverage";

export class DataQualityGovernor {
  static audit(): DataQualityReport {
    const venues = MarketCoverageRegistry.list();
    const live = venues.filter((v) => v.status === "live").length;
    const terminal = useTerminalStore.getState();
    const staleSources: string[] = [];

    for (const v of venues) {
      if (v.status === "offline" || v.status === "degraded") {
        staleSources.push(v.name);
      }
      if (v.latencyMs != null && v.latencyMs > 5000) {
        staleSources.push(`${v.name} (stale)`);
      }
    }

    if (!terminal.assetsLoaded) staleSources.push("ASSET INDEX");
    const trust = Math.round(
      (live / Math.max(venues.length, 1)) * 70 +
        (terminal.connectionStatus === "connected" ? 25 : 0) +
        (terminal.lastMessageAt && Date.now() - terminal.lastMessageAt < 3000 ? 5 : 0),
    );

    return {
      overallTrust: Math.min(100, trust),
      feedsOnline: live,
      feedsTotal: venues.length,
      staleSources: staleSources.slice(0, 8),
      conflictCount: IngestQualityGovernor.audit().conflictCount,
      lastAuditAt: Date.now(),
    };
  }
}
