import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { StreamProcessingMetrics, UnifiedNormalizedTrade } from "@/types/data-ingestion";

export class StreamProcessingEngine {
  static compute(): StreamProcessingMetrics {
    const events = IngestStreamBuffer.recent(120);
    const now = Date.now();
    const windowMs = 60_000;
    const recent = events.filter((e) => now - e.receivedAt < windowMs);
    const trades = recent.filter((e) => e.eventType === "trade");
    const books = recent.filter((e) => e.eventType === "book");

    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const book = terminal.book;

    let buyVol = 0;
    let sellVol = 0;
    for (const t of trades) {
      const payload = t.payload as UnifiedNormalizedTrade;
      if (payload.side === "buy") buyVol += payload.size;
      else sellVol += payload.size;
    }
    const totalVol = buyVol + sellVol;
    const imbalance = totalVol > 0 ? (buyVol - sellVol) / totalVol : 0;

    const anomalyFlags: string[] = [];
    if (atmosphere.stress.velocityRatio > 1.5) anomalyFlags.push("velocity_spike");
    if ((book?.spreadBps ?? 0) > 18) anomalyFlags.push("spread_wide");
    if (atmosphere.stress.score > 75) anomalyFlags.push("stress_elevated");
    if (recent.length > 200) anomalyFlags.push("high_throughput");

    const eps = recent.length / (windowMs / 1000);

    return {
      eventsPerSecond: Math.round(eps * 10) / 10,
      tradesPerMinute: trades.length,
      bookUpdatesPerMinute: books.length,
      volatilityScore: Math.min(100, Math.round(atmosphere.stress.score)),
      liquidityScore: Math.min(
        100,
        Math.round(70 - (book?.spreadBps ?? 0) * 1.2 + (book ? 20 : 0)),
      ),
      spreadBps: book?.spreadBps ?? null,
      fundingBias:
        imbalance > 0.15 ? "long_pays" : imbalance < -0.15 ? "short_pays" : "neutral",
      marketBreadth: Math.min(100, Math.round(Object.keys(terminal.mids?.mids ?? {}).length / 3)),
      anomalyFlags,
      updatedAt: now,
    };
  }
}
