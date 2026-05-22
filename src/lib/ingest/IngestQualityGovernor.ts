import { DataSourceRegistry } from "@/lib/ingest/DataSourceRegistry";
import { IngestDeduplicator } from "@/lib/ingest/IngestDeduplicator";
import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { TimestampNormalizer } from "@/lib/ingest/TimestampNormalizer";
import { platformWebSocketGateway } from "@/lib/infrastructure/WebSocketGateway";
import type { IngestQualityReport } from "@/types/data-ingestion";

export class IngestQualityGovernor {
  static audit(): IngestQualityReport {
    const now = Date.now();
    const sources = DataSourceRegistry.list();
    const live = sources.filter((s) => s.health === "live");
    const stale = sources.filter((s) => {
      if (!s.lastEventAt) return s.health !== "staged";
      return now - s.lastEventAt > 12_000 && s.health !== "staged";
    });

    const events = IngestStreamBuffer.recent(64);
    const timestampIntegrity = TimestampNormalizer.integrityScore(events);

    const assetPrices = new Map<string, number[]>();
    for (const e of events) {
      if (e.eventType !== "trade" || !e.asset) continue;
      const p = (e.payload as { price?: number }).price;
      if (typeof p !== "number") continue;
      const arr = assetPrices.get(e.asset) ?? [];
      arr.push(p);
      assetPrices.set(e.asset, arr);
    }
    let conflictCount = 0;
    assetPrices.forEach((prices) => {
      if (prices.length < 2) return;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min > 0 && (max - min) / min > 0.002) conflictCount += 1;
    });

    const gateway = platformWebSocketGateway.getMetrics();
    const verified = sources.filter((s) => s.verified && s.health === "live").length;
    const avgLatency =
      live.length > 0
        ? Math.round(
            live.reduce((sum, s) => sum + (s.latencyMs ?? 0), 0) / live.length,
          )
        : gateway.latencyMs;

    return {
      overallTrust: Math.round(
        (live.length / Math.max(sources.length, 1)) * 40 +
          timestampIntegrity * 0.35 +
          (verified / Math.max(live.length, 1)) * 20 -
          stale.length * 4 -
          conflictCount * 3,
      ),
      staleFeedCount: stale.length,
      conflictCount,
      redundancyCoverage: Math.min(100, Math.round((live.length / 2) * 100)),
      timestampIntegrity,
      uptimePct: Math.min(100, Math.round(88 + live.length * 2 - stale.length * 5)),
      avgLatencyMs: avgLatency,
      verifiedSourceRatio: Math.round((verified / Math.max(sources.length, 1)) * 100),
      lastAuditAt: now,
    };
  }

  static dedupeSuppressed(): number {
    return IngestDeduplicator.suppressedCount();
  }
}
