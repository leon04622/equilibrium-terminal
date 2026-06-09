import { HyperliquidIngestBridge } from "@/lib/ingest/HyperliquidIngestBridge";
import { RestExchangeIngestWorker } from "@/lib/ingest/workers/RestExchangeIngestWorker";
import type { ExchangeId } from "@/types/multi-exchange";
import type { IngestWorkerStatus } from "@/types/market-data-backbone";

const workerMeta = new Map<
  ExchangeId,
  {
    health: IngestWorkerStatus["health"];
    lastEventAt: number | null;
    latencyMs: number | null;
    reconnectCount: number;
    eventsPerMinute: number;
    backlog: number;
  }
>();

let hlStop: (() => void) | null = null;
let restStop: (() => void) | null = null;
let eventCount = 0;

export class ExchangeIngestionOrchestrator {
  static start(getAsset: () => string): () => void {
    ExchangeIngestionOrchestrator.stop();

    hlStop = HyperliquidIngestBridge.start();
    restStop = RestExchangeIngestWorker.start(getAsset, (exchange, health, latencyMs) => {
      const prev = workerMeta.get(exchange) ?? {
        health: "offline" as const,
        lastEventAt: null,
        latencyMs: null,
        reconnectCount: 0,
        eventsPerMinute: 0,
        backlog: 0,
      };
      workerMeta.set(exchange, {
        ...prev,
        health,
        lastEventAt: health === "live" ? Date.now() : prev.lastEventAt,
        latencyMs,
        eventsPerMinute: health === "live" ? prev.eventsPerMinute + 1 : prev.eventsPerMinute,
      });
      eventCount += 1;
    });

    return () => ExchangeIngestionOrchestrator.stop();
  }

  static stop(): void {
    hlStop?.();
    restStop?.();
    hlStop = null;
    restStop = null;
  }

  static noteHlHealth(
    health: IngestWorkerStatus["health"],
    latencyMs: number | null,
  ): void {
    workerMeta.set("hyperliquid", {
      health,
      lastEventAt: Date.now(),
      latencyMs,
      reconnectCount: 0,
      eventsPerMinute: Math.round(eventCount / 2),
      backlog: 0,
    });
  }

  static workers(): IngestWorkerStatus[] {
    const defs: Array<{
      exchange: ExchangeId;
      label: string;
      transport: IngestWorkerStatus["transport"];
    }> = [
      { exchange: "hyperliquid", label: "HYPERLIQUID", transport: "websocket" },
      { exchange: "binance", label: "BINANCE", transport: "rest_poll" },
      { exchange: "bybit", label: "BYBIT", transport: "rest_poll" },
      { exchange: "okx", label: "OKX", transport: "rest_poll" },
      { exchange: "coinbase", label: "COINBASE", transport: "rest_poll" },
      { exchange: "kraken", label: "KRAKEN", transport: "rest_poll" },
      { exchange: "deribit", label: "DERIBIT", transport: "rest_poll" },
    ];

    return defs.map((d) => {
      const m = workerMeta.get(d.exchange);
      return {
        exchange: d.exchange,
        label: d.label,
        transport: d.transport,
        health: m?.health ?? (d.exchange === "hyperliquid" ? "reconnecting" : "staged"),
        heartbeatAt: m?.lastEventAt ?? null,
        lastEventAt: m?.lastEventAt ?? null,
        latencyMs: m?.latencyMs ?? null,
        reconnectCount: m?.reconnectCount ?? 0,
        backlog: m?.backlog ?? 0,
        rateLimitRemaining: d.exchange === "hyperliquid" ? null : 1200,
        eventsPerMinute: m?.eventsPerMinute ?? 0,
      };
    });
  }

  static liveCount(): number {
    return ExchangeIngestionOrchestrator.workers().filter((w) => w.health === "live").length;
  }
}
