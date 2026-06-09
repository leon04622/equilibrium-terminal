import { CrossExchangeIntelligenceEngine } from "@/lib/multi-exchange/CrossExchangeIntelligenceEngine";
import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { EventStreamingBackbone } from "@/lib/ingest/EventStreamingBackbone";
import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { IngestOrchestrator } from "@/lib/ingest/IngestOrchestrator";
import { ExchangeIngestionOrchestrator } from "@/lib/ingest/workers/ExchangeIngestionOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { UnifiedNormalizedOrderBook, UnifiedNormalizedTrade } from "@/types/data-ingestion";
import type {
  MarketDataBackboneSnapshot,
  MarketDataPlatformSnapshot,
  NormalizedExchangeStatus,
} from "@/types/market-data-backbone";

function extractTrades(events: { payload: unknown }[]): UnifiedNormalizedTrade[] {
  const out: UnifiedNormalizedTrade[] = [];
  for (const e of events) {
    const p = e.payload as UnifiedNormalizedTrade;
    if (p?.price != null && p?.exchange) out.push(p);
  }
  return out.slice(0, 16);
}

function extractBooks(events: { payload: unknown }[]): UnifiedNormalizedOrderBook[] {
  const out: UnifiedNormalizedOrderBook[] = [];
  for (const e of events) {
    const p = e.payload as UnifiedNormalizedOrderBook;
    if (p?.bids && p?.exchange) out.push(p);
  }
  return out.slice(0, 12);
}

export class MarketDataBackboneOrchestrator {
  static backbone(asset: string): MarketDataBackboneSnapshot {
    const workers = ExchangeIngestionOrchestrator.workers();
    const liveWorkerCount = ExchangeIngestionOrchestrator.liveCount();
    const streams = EventStreamingBackbone.metrics();
    const recent = IngestStreamBuffer.recent(48);
    const quotes = multiExchangeMarketState.forAsset(asset);
    const hlMid = useTerminalStore.getState().book?.mid ?? null;
    const signals = CrossExchangeIntelligenceEngine.analyze(asset, hlMid);

    const exchangeStatus: NormalizedExchangeStatus[] = workers.map((w) => ({
      exchange: w.exchange,
      status:
        w.health === "live"
          ? "operational"
          : w.health === "degraded" || w.health === "reconnecting"
            ? "degraded"
            : w.health === "offline"
              ? "offline"
              : "maintenance",
      latencyMs: w.latencyMs,
      lastHeartbeatAt: w.heartbeatAt,
      reconnectCount: w.reconnectCount,
    }));

    const backboneScore = Math.round(
      (liveWorkerCount / Math.max(workers.length, 1)) * 50 +
        (quotes.length / 7) * 30 +
        (signals.length > 0 ? 10 : 5) +
        Math.min(10, streams.reduce((a, s) => a + s.eventsPerSecond, 0)),
    );

    return {
      workers,
      liveWorkerCount,
      streams,
      backboneScore: Math.min(100, backboneScore),
      crossVenueQuoteCount: quotes.length,
      latestTrades: extractTrades(recent),
      latestBooks: extractBooks(recent),
      exchangeStatus,
      updatedAt: Date.now(),
    };
  }

  static platformSnapshot(asset: string): MarketDataPlatformSnapshot {
    const ingest = IngestOrchestrator.snapshot();
    const backbone = MarketDataBackboneOrchestrator.backbone(asset);
    return {
      ...ingest,
      ingestScore: Math.round((ingest.ingestScore + backbone.backboneScore) / 2),
      backbone,
    };
  }
}
