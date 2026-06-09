import { EventStreamingBackbone } from "@/lib/ingest/EventStreamingBackbone";
import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { MarketDataBackboneOrchestrator } from "@/lib/ingest/MarketDataBackboneOrchestrator";
import type { BackboneStreamTopic } from "@/types/market-data-backbone";
import type { CrossVenueQuote } from "@/types/multi-exchange";
import type { IngestEventEnvelope } from "@/types/data-ingestion";

/**
 * Internal data API — consumed by charts, alerts, OmniBar, intelligence, replay.
 */
export class MarketDataInternalApi {
  static quotes(asset: string): CrossVenueQuote[] {
    return multiExchangeMarketState.forAsset(asset);
  }

  static stream(topic: BackboneStreamTopic, limit = 32): IngestEventEnvelope[] {
    return EventStreamingBackbone.recent(topic, limit);
  }

  static events(limit = 32): IngestEventEnvelope[] {
    return IngestStreamBuffer.recent(limit);
  }

  static vitals(asset: string) {
    return MarketDataBackboneOrchestrator.platformSnapshot(asset);
  }
}
