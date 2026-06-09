import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import type { CrossExchangeSignal, CrossVenueQuote, ExchangeId } from "@/types/multi-exchange";

const DIVERGENCE_WATCH_BPS = 8;
const DIVERGENCE_CRITICAL_BPS = 18;

export class CrossExchangeIntelligenceEngine {
  static analyze(asset: string, hlMid: number | null): CrossExchangeSignal[] {
    const quotes = multiExchangeMarketState.forAsset(asset).filter((q) => q.mid != null);
    const signals: CrossExchangeSignal[] = [];
    const now = Date.now();

    if (hlMid != null && quotes.length > 1) {
      for (const q of quotes) {
        if (q.exchange === "hyperliquid" || q.mid == null) continue;
        const divBps = (Math.abs(q.mid - hlMid) / hlMid) * 10_000;
        if (divBps >= DIVERGENCE_WATCH_BPS) {
          signals.push({
            id: `div-${q.exchange}-${now}`,
            kind: "price_divergence",
            asset: asset.toUpperCase(),
            severity: divBps >= DIVERGENCE_CRITICAL_BPS ? "critical" : "watch",
            headline: `${q.exchange.toUpperCase()} vs HL mid · ${divBps.toFixed(1)} bps`,
            detail: `HL ${hlMid.toFixed(2)} vs ${q.exchange} ${q.mid.toFixed(2)}`,
            venues: ["hyperliquid", q.exchange],
            metricBps: divBps,
            timestamp: now,
          });
        }
      }
    }

    const spreads = quotes
      .filter((q) => q.spreadBps != null)
      .sort((a, b) => (a.spreadBps ?? 0) - (b.spreadBps ?? 0));
    if (spreads.length >= 2) {
      const tight = spreads[0]!;
      const wide = spreads[spreads.length - 1]!;
      const gap = (wide.spreadBps ?? 0) - (tight.spreadBps ?? 0);
      if (gap > 6) {
        signals.push({
          id: `spread-${now}`,
          kind: "spread_anomaly",
          asset: asset.toUpperCase(),
          severity: gap > 14 ? "watch" : "info",
          headline: `Spread dispersion ${gap.toFixed(1)} bps · tight ${tight.exchange}`,
          detail: `${tight.exchange} ${tight.spreadBps?.toFixed(1)} bps vs ${wide.exchange} ${wide.spreadBps?.toFixed(1)} bps`,
          venues: [tight.exchange, wide.exchange],
          metricBps: gap,
          timestamp: now,
        });
      }
    }

    const funding = quotes.filter((q) => q.fundingRate != null);
    if (funding.length >= 2) {
      const rates = funding.map((q) => ({ q, r: q.fundingRate! }));
      const max = rates.reduce((a, b) => (a.r > b.r ? a : b));
      const min = rates.reduce((a, b) => (a.r < b.r ? a : b));
      const disloc = Math.abs(max.r - min.r) * 10_000;
      if (disloc > 2) {
        signals.push({
          id: `fund-${now}`,
          kind: "funding_dislocation",
          asset: asset.toUpperCase(),
          severity: disloc > 5 ? "watch" : "info",
          headline: `Funding dislocation ${disloc.toFixed(1)} bps equiv`,
          detail: `${max.q.exchange} ${(max.r * 100).toFixed(4)}% vs ${min.q.exchange} ${(min.r * 100).toFixed(4)}%`,
          venues: [max.q.exchange, min.q.exchange],
          metricBps: disloc,
          timestamp: now,
        });
      }
    }

    return signals.sort((a, b) => (b.metricBps ?? 0) - (a.metricBps ?? 0)).slice(0, 12);
  }

  static syncHlQuote(asset: string, bid: number | null, ask: number | null, status: CrossVenueQuote["status"]): void {
    const mid = bid != null && ask != null ? (bid + ask) / 2 : null;
    const spreadBps =
      bid != null && ask != null && bid > 0 ? ((ask - bid) / ((bid + ask) / 2)) * 10_000 : null;
    multiExchangeMarketState.upsert({
      exchange: "hyperliquid",
      asset: asset.toUpperCase(),
      bid,
      ask,
      mid,
      spreadBps,
      fundingRate: null,
      openInterestUsd: null,
      volume24hUsd: null,
      timestamp: Date.now(),
      status,
    });
  }
}
