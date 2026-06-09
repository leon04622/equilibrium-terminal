import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import type { AggregatedDepthView, CrossVenueQuote } from "@/types/multi-exchange";

export class DepthAggregationEngine {
  static aggregate(asset: string): AggregatedDepthView | null {
    const quotes = multiExchangeMarketState
      .forAsset(asset)
      .filter((q) => q.status === "live" && q.bid != null && q.ask != null);
    if (quotes.length === 0) return null;

    let bestBid: CrossVenueQuote | null = null;
    let bestAsk: CrossVenueQuote | null = null;
    for (const q of quotes) {
      if (q.bid != null && (!bestBid || q.bid > (bestBid.bid ?? 0))) bestBid = q;
      if (q.ask != null && (!bestAsk || q.ask < (bestAsk.ask ?? Infinity))) bestAsk = q;
    }

    const mids = quotes.map((q) => q.mid).filter((m): m is number => m != null);
    const midConsolidated =
      mids.length > 0 ? mids.reduce((a, b) => a + b, 0) / mids.length : null;

    const bidVol = quotes.reduce((s, q) => s + (q.volume24hUsd ?? 0), 0);
    const askSide = quotes.length;
    const imbalancePct =
      bidVol > 0 ? ((bestBid?.volume24hUsd ?? 0) / bidVol) * 100 - 50 : null;

    const spreadBpsConsolidated =
      bestBid?.bid != null && bestAsk?.ask != null && bestBid.bid > 0
        ? ((bestAsk.ask - bestBid.bid) / ((bestBid.bid + bestAsk.ask) / 2)) * 10_000
        : null;

    return {
      asset: asset.toUpperCase(),
      bestBid: bestBid
        ? { exchange: bestBid.exchange, price: bestBid.bid!, size: 0 }
        : null,
      bestAsk: bestAsk
        ? { exchange: bestAsk.exchange, price: bestAsk.ask!, size: 0 }
        : null,
      midConsolidated,
      spreadBpsConsolidated,
      venueCount: quotes.length,
      imbalancePct,
      updatedAt: Date.now(),
    };
  }
}
