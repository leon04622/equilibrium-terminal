import { TimestampNormalizer } from "@/lib/ingest/TimestampNormalizer";
import type {
  NormalizedOrderBook,
  NormalizedTrade,
} from "@/types/terminal-schema";
import type { CrossVenueQuote } from "@/types/multi-exchange";
import type {
  IngestEventEnvelope,
  IngestStreamKind,
  UnifiedNormalizedOrderBook,
  UnifiedNormalizedTrade,
} from "@/types/data-ingestion";
import type { NormalizedFunding, NormalizedOpenInterest } from "@/types/market-data-backbone";

export class NormalizationLayer {
  static tradeFromHl(trade: NormalizedTrade, receivedAt: number): UnifiedNormalizedTrade {
    const timestamp = TimestampNormalizer.toMs(trade.time);
    return {
      exchange: "hyperliquid",
      asset: trade.coin,
      side: trade.side,
      price: trade.price,
      size: trade.size,
      notionalUsd: trade.notionalUsd,
      timestamp,
      sourceId: "hl-perp",
      dedupeKey: `${trade.id}-${timestamp}`,
    };
  }

  static bookFromHl(book: NormalizedOrderBook, receivedAt: number): UnifiedNormalizedOrderBook {
    return {
      exchange: "hyperliquid",
      asset: book.coin,
      bids: book.bids.slice(0, 24).map((l) => [l.price, l.size] as [number, number]),
      asks: book.asks.slice(0, 24).map((l) => [l.price, l.size] as [number, number]),
      bestBid: book.bestBid,
      bestAsk: book.bestAsk,
      spreadBps: book.spreadBps,
      timestamp: TimestampNormalizer.toMs(book.time),
      sourceId: "hl-perp",
    };
  }

  static bookFromQuote(q: CrossVenueQuote): UnifiedNormalizedOrderBook {
    return {
      exchange: q.exchange,
      asset: q.asset,
      bids: q.bid != null ? [[q.bid, 1]] : [],
      asks: q.ask != null ? [[q.ask, 1]] : [],
      bestBid: q.bid,
      bestAsk: q.ask,
      spreadBps: q.spreadBps,
      timestamp: TimestampNormalizer.toMs(q.timestamp),
      sourceId: q.exchange,
    };
  }

  static fundingFromQuote(q: CrossVenueQuote): NormalizedFunding {
    return {
      exchange: q.exchange,
      asset: q.asset,
      rate: q.fundingRate ?? 0,
      nextFundingTime: null,
      timestamp: TimestampNormalizer.toMs(q.timestamp),
    };
  }

  static openInterestFromQuote(q: CrossVenueQuote): NormalizedOpenInterest {
    return {
      exchange: q.exchange,
      asset: q.asset,
      openInterestUsd: q.openInterestUsd ?? 0,
      timestamp: TimestampNormalizer.toMs(q.timestamp),
    };
  }

  static envelope(
    stream: IngestStreamKind,
    sourceId: string,
    category: IngestEventEnvelope["category"],
    eventType: string,
    asset: string | null,
    payload: unknown,
    timestamp: number,
    receivedAt: number,
    verified: boolean,
  ): IngestEventEnvelope {
    return {
      id: `${sourceId}-${eventType}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      stream,
      sourceId,
      category,
      eventType,
      asset,
      payload,
      timestamp: TimestampNormalizer.toMs(timestamp),
      receivedAt,
      normalized: true,
      verified,
      latencyMs: TimestampNormalizer.skewMs(timestamp, receivedAt),
    };
  }
}
