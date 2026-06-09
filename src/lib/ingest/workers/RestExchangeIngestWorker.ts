import { EventStreamingBackbone } from "@/lib/ingest/EventStreamingBackbone";
import { IngestDeduplicator } from "@/lib/ingest/IngestDeduplicator";
import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { NormalizationLayer } from "@/lib/ingest/NormalizationLayer";
import { ingestBus } from "@/lib/ingest/UnifiedIngestBus";
import {
  fetchBinanceTopOfBook,
  fetchBybitTopOfBook,
  fetchCoinbaseTopOfBook,
  fetchDeribitTopOfBook,
  fetchKrakenTopOfBook,
  fetchOkxTopOfBook,
} from "@/lib/ingest/workers/cexRestAdapters";
import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import type { ExchangeId } from "@/types/multi-exchange";
import type { IngestWorkerStatus } from "@/types/market-data-backbone";

const POLL_MS = 5_000;

const POLLERS: Array<{
  exchange: ExchangeId;
  fn: (asset: string) => Promise<void>;
}> = [
  { exchange: "binance", fn: fetchBinanceTopOfBook },
  { exchange: "bybit", fn: fetchBybitTopOfBook },
  { exchange: "okx", fn: fetchOkxTopOfBook },
  { exchange: "coinbase", fn: fetchCoinbaseTopOfBook },
  { exchange: "kraken", fn: fetchKrakenTopOfBook },
  { exchange: "deribit", fn: fetchDeribitTopOfBook },
];

function publishQuote(exchange: ExchangeId, asset: string): void {
  const quote = multiExchangeMarketState.get(exchange, asset);
  if (!quote || quote.bid == null || quote.ask == null) return;

  const receivedAt = Date.now();
  const unified = NormalizationLayer.bookFromQuote(quote);
  const key = IngestDeduplicator.key(
    exchange,
    "book",
    unified.asset,
    `${unified.bestBid}-${unified.bestAsk}`,
  );
  if (!IngestDeduplicator.accept(key)) return;

  const env = NormalizationLayer.envelope(
    "liquidity",
    exchange,
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
  EventStreamingBackbone.publish("market", env);

  if (quote.fundingRate != null) {
    const funding = NormalizationLayer.fundingFromQuote(quote);
    const fEnv = NormalizationLayer.envelope(
      "market",
      exchange,
      "exchange",
      "funding",
      unified.asset,
      funding,
      funding.timestamp,
      receivedAt,
      true,
    );
    IngestStreamBuffer.push(fEnv);
    EventStreamingBackbone.publish("derivatives", fEnv);
  }

  ingestBus.emit("ingest:book", {
    exchange: unified.exchange,
    asset: unified.asset,
    spreadBps: unified.spreadBps,
    timestamp: unified.timestamp,
  });
  ingestBus.emit("venue:status", {
    sourceId: exchange,
    health: "live",
    latencyMs: receivedAt - quote.timestamp,
  });
}

export class RestExchangeIngestWorker {
  static start(
    getAsset: () => string,
    onStatus?: (
      exchange: ExchangeId,
      health: IngestWorkerStatus["health"],
      latencyMs: number | null,
    ) => void,
  ): () => void {
    let active = true;

    const tick = async () => {
      if (!active) return;
      const asset = getAsset();
      const started = Date.now();

      await Promise.all(
        POLLERS.map(async ({ exchange, fn }) => {
          const t0 = Date.now();
          try {
            await fn(asset);
            publishQuote(exchange, asset);
            onStatus?.(exchange, "live", Date.now() - t0);
          } catch {
            onStatus?.(exchange, "degraded", null);
            ingestBus.emit("venue:status", {
              sourceId: exchange,
              health: "degraded",
              latencyMs: null,
            });
          }
        }),
      );

      if (Date.now() - started > POLL_MS * 0.9) {
        ingestBus.emit("feed:stale", { sourceId: "cex-rest", staleMs: Date.now() - started });
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }
}
