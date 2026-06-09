/** Phase 33 — Full market coverage & multi-exchange engine. */

export type ExchangeId =
  | "hyperliquid"
  | "binance"
  | "bybit"
  | "okx"
  | "coinbase"
  | "kraken"
  | "deribit"
  | "uniswap"
  | "curve";

export type VenueFeedStatus = "live" | "degraded" | "staged" | "offline";

export interface ExchangeVenueDescriptor {
  id: ExchangeId;
  label: string;
  kind: "cex" | "dex" | "derivatives" | "options";
  status: VenueFeedStatus;
  capabilities: Array<
    | "trades"
    | "book"
    | "funding"
    | "oi"
    | "liquidations"
    | "options"
    | "perp"
  >;
  latencyMs: number | null;
  lastEventAt: number | null;
}

/** Unified top-of-book quote across venues. */
export interface CrossVenueQuote {
  exchange: ExchangeId;
  asset: string;
  bid: number | null;
  ask: number | null;
  mid: number | null;
  spreadBps: number | null;
  fundingRate: number | null;
  openInterestUsd: number | null;
  volume24hUsd: number | null;
  timestamp: number;
  status: VenueFeedStatus;
}

export type CrossExchangeSignalKind =
  | "price_divergence"
  | "spread_anomaly"
  | "funding_dislocation"
  | "liquidity_migration"
  | "exchange_stress"
  | "vol_fragmentation";

export interface CrossExchangeSignal {
  id: string;
  kind: CrossExchangeSignalKind;
  asset: string;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  venues: ExchangeId[];
  metricBps: number | null;
  timestamp: number;
}

export interface AggregatedDepthLevel {
  exchange: ExchangeId;
  price: number;
  size: number;
}

export interface AggregatedDepthView {
  asset: string;
  bestBid: AggregatedDepthLevel | null;
  bestAsk: AggregatedDepthLevel | null;
  midConsolidated: number | null;
  spreadBpsConsolidated: number | null;
  venueCount: number;
  imbalancePct: number | null;
  updatedAt: number;
}

/** Execution remains HL-first; context is cross-venue read. */
export interface MultiVenueExecutionContext {
  asset: string;
  primaryVenue: ExchangeId;
  bestBidVenue: ExchangeId | null;
  bestAskVenue: ExchangeId | null;
  hlMid: number | null;
  crossMidMedian: number | null;
  divergenceBps: number | null;
  hlSpreadBps: number | null;
  tightestSpreadBps: number | null;
  summary: string;
  updatedAt: number;
}

export interface DerivativesVenueSnapshot {
  exchange: ExchangeId;
  asset: string;
  fundingRate: number | null;
  openInterestUsd: number | null;
  markPrice: number | null;
  indexPrice: number | null;
  ivAtm: number | null;
  updatedAt: number;
}

export interface MultiExchangeSnapshot {
  venues: ExchangeVenueDescriptor[];
  quotes: CrossVenueQuote[];
  signals: CrossExchangeSignal[];
  aggregatedDepth: AggregatedDepthView | null;
  executionContext: MultiVenueExecutionContext | null;
  derivatives: DerivativesVenueSnapshot[];
  liveVenueCount: number;
  coverageScore: number;
  updatedAt: number;
}
