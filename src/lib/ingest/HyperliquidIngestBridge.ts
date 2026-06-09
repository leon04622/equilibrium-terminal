import { IngestDeduplicator } from "@/lib/ingest/IngestDeduplicator";
import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { NormalizationLayer } from "@/lib/ingest/NormalizationLayer";
import { EventStreamingBackbone } from "@/lib/ingest/EventStreamingBackbone";
import { ExchangeIngestionOrchestrator } from "@/lib/ingest/workers/ExchangeIngestionOrchestrator";
import { ingestBus } from "@/lib/ingest/UnifiedIngestBus";
import { useTerminalStore } from "@/store/terminalStore";

let bridgeActive = false;
let lastTradeId: string | null = null;
let lastBookVersion = 0;

/**
 * Bridges live Hyperliquid terminal store updates into the unified ingest bus + hot buffer.
 */
export class HyperliquidIngestBridge {
  static start(): () => void {
    if (bridgeActive) return () => undefined;
    bridgeActive = true;

    const flush = () => {
      const state = useTerminalStore.getState();
      const receivedAt = Date.now();

      if (state.book && state.bookVersion !== lastBookVersion) {
        lastBookVersion = state.bookVersion;
        const unified = NormalizationLayer.bookFromHl(state.book, receivedAt);
        const key = IngestDeduplicator.key(
          "hl-perp",
          "book",
          unified.asset,
          `${unified.bestBid}-${unified.bestAsk}`,
        );
        if (IngestDeduplicator.accept(key)) {
          const env = NormalizationLayer.envelope(
            "liquidity",
            "hl-perp",
            "exchange",
            "book",
            unified.asset,
            unified,
            unified.timestamp,
            receivedAt,
            true,
          );
          IngestStreamBuffer.push(env);
          EventStreamingBackbone.publish("liquidity", env);
          ingestBus.emit("ingest:book", {
            exchange: unified.exchange,
            asset: unified.asset,
            spreadBps: unified.spreadBps,
            timestamp: unified.timestamp,
          });
          ingestBus.emit("ingest:normalized", {
            id: env.id,
            stream: "liquidity",
            sourceId: "hl-perp",
            eventType: "book",
            asset: unified.asset,
          });
        }
      }

      const latestTrade = state.trades[0];
      if (latestTrade && latestTrade.id !== lastTradeId) {
        lastTradeId = latestTrade.id;
        const unified = NormalizationLayer.tradeFromHl(latestTrade, receivedAt);
        const key = IngestDeduplicator.key(
          "hl-perp",
          "trade",
          unified.asset,
          unified.dedupeKey,
        );
        if (IngestDeduplicator.accept(key)) {
          const env = NormalizationLayer.envelope(
            "market",
            "hl-perp",
            "exchange",
            "trade",
            unified.asset,
            unified,
            unified.timestamp,
            receivedAt,
            true,
          );
          IngestStreamBuffer.push(env);
          EventStreamingBackbone.publish("market", env);
          ingestBus.emit("ingest:trade", {
            exchange: unified.exchange,
            asset: unified.asset,
            price: unified.price,
            size: unified.size,
            timestamp: unified.timestamp,
          });
          ingestBus.emit("ingest:normalized", {
            id: env.id,
            stream: "market",
            sourceId: "hl-perp",
            eventType: "trade",
            asset: unified.asset,
          });
        }
      }

      for (const intel of state.intelligence.slice(0, 3)) {
        const key = IngestDeduplicator.key("eq-internal", "intel", intel.coin, intel.id);
        if (!IngestDeduplicator.accept(key)) continue;
        const env = NormalizationLayer.envelope(
          "intelligence",
          "eq-internal",
          "internal",
          "intel",
          intel.coin,
          intel,
          intel.timestamp,
          receivedAt,
          true,
        );
        IngestStreamBuffer.push(env);
        EventStreamingBackbone.publish("intelligence", env);
        ingestBus.emit("ingest:normalized", {
          id: env.id,
          stream: "intelligence",
          sourceId: "eq-internal",
          eventType: "intel",
          asset: intel.coin,
        });
      }

      const hlHealth =
        state.connectionStatus === "connected"
          ? "live"
          : state.connectionStatus === "reconnecting"
            ? "degraded"
            : "offline";
      const hlLatency = state.lastMessageAt ? receivedAt - state.lastMessageAt : null;
      ExchangeIngestionOrchestrator.noteHlHealth(hlHealth, hlLatency);
      ingestBus.emit("venue:status", {
        sourceId: "hl-perp",
        health: hlHealth,
        latencyMs: hlLatency,
      });

      if (state.lastMessageAt && receivedAt - state.lastMessageAt > 8000) {
        ingestBus.emit("feed:stale", {
          sourceId: "hl-perp",
          staleMs: receivedAt - state.lastMessageAt,
        });
      }
    };

    flush();
    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, flush);
    const unsubTrades = useTerminalStore.subscribe((s) => s.trades, flush);
    const unsubIntel = useTerminalStore.subscribe((s) => s.intelligenceVersion, flush);
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, flush);

    return () => {
      bridgeActive = false;
      unsubBook();
      unsubTrades();
      unsubIntel();
      unsubConn();
    };
  }
}
