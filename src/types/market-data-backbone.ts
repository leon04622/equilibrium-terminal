/** Phase 42 — Multi-exchange ingestion & normalization backbone. */

import type { ExchangeId } from "@/types/multi-exchange";
import type {
  DataIngestionSnapshot,
  IngestStreamKind,
  UnifiedNormalizedOrderBook,
  UnifiedNormalizedTrade,
} from "@/types/data-ingestion";

export type BackboneStreamTopic =
  | "market"
  | "liquidity"
  | "intelligence"
  | "derivatives"
  | "macro"
  | "execution";

export type WorkerTransport = "websocket" | "rest_poll" | "hybrid";

export type WorkerHealth = "live" | "degraded" | "reconnecting" | "offline" | "staged";

export interface NormalizedFunding {
  exchange: string;
  asset: string;
  rate: number;
  nextFundingTime: number | null;
  timestamp: number;
}

export interface NormalizedOpenInterest {
  exchange: string;
  asset: string;
  openInterestUsd: number;
  timestamp: number;
}

export interface NormalizedLiquidation {
  exchange: string;
  asset: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  notionalUsd: number;
  timestamp: number;
}

export interface NormalizedExchangeStatus {
  exchange: ExchangeId;
  status: "operational" | "degraded" | "maintenance" | "offline";
  latencyMs: number | null;
  lastHeartbeatAt: number | null;
  reconnectCount: number;
}

export interface NormalizedVolatility {
  exchange: string;
  asset: string;
  realizedVol1h: number | null;
  spreadBps: number | null;
  timestamp: number;
}

export interface IngestWorkerStatus {
  exchange: ExchangeId;
  label: string;
  transport: WorkerTransport;
  health: WorkerHealth;
  heartbeatAt: number | null;
  lastEventAt: number | null;
  latencyMs: number | null;
  reconnectCount: number;
  backlog: number;
  rateLimitRemaining: number | null;
  eventsPerMinute: number;
}

export interface EventStreamMetrics {
  topic: BackboneStreamTopic;
  eventsPerSecond: number;
  backlog: number;
  lastPublishAt: number | null;
}

export interface MarketDataBackboneSnapshot {
  workers: IngestWorkerStatus[];
  liveWorkerCount: number;
  streams: EventStreamMetrics[];
  backboneScore: number;
  crossVenueQuoteCount: number;
  latestTrades: UnifiedNormalizedTrade[];
  latestBooks: UnifiedNormalizedOrderBook[];
  exchangeStatus: NormalizedExchangeStatus[];
  updatedAt: number;
}

export interface MarketDataPlatformSnapshot extends DataIngestionSnapshot {
  backbone: MarketDataBackboneSnapshot;
}

export const STREAM_TOPIC_MAP: Record<BackboneStreamTopic, IngestStreamKind> = {
  market: "market",
  liquidity: "liquidity",
  intelligence: "intelligence",
  derivatives: "market",
  macro: "macro",
  execution: "market",
};
