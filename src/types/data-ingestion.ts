/** Phase 24 — Data Ingestion & Normalization Infrastructure. */

export type DataSourceCategory =
  | "exchange"
  | "on_chain"
  | "macro"
  | "news"
  | "social"
  | "internal";

export type IngestTransport = "websocket" | "rest_poll" | "webhook" | "internal";

export type IngestStreamKind =
  | "market"
  | "intelligence"
  | "liquidity"
  | "macro"
  | "narrative";

export type SourceHealth = "live" | "degraded" | "staged" | "offline";

export type StorageTier = "hot" | "warm" | "cold";

export interface DataSourceDescriptor {
  id: string;
  name: string;
  category: DataSourceCategory;
  transport: IngestTransport;
  health: SourceHealth;
  latencyMs: number | null;
  lastEventAt: number | null;
  eventsPerMinute: number;
  rateLimitRemaining: number | null;
  verified: boolean;
}

/** Unified cross-venue trade schema. */
export interface UnifiedNormalizedTrade {
  exchange: string;
  asset: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  notionalUsd: number;
  timestamp: number;
  sourceId: string;
  dedupeKey: string;
}

/** Unified cross-venue order book schema. */
export interface UnifiedNormalizedOrderBook {
  exchange: string;
  asset: string;
  bids: [number, number][];
  asks: [number, number][];
  bestBid: number | null;
  bestAsk: number | null;
  spreadBps: number | null;
  timestamp: number;
  sourceId: string;
}

export interface IngestEventEnvelope {
  id: string;
  stream: IngestStreamKind;
  sourceId: string;
  category: DataSourceCategory;
  eventType: string;
  asset: string | null;
  payload: unknown;
  timestamp: number;
  receivedAt: number;
  normalized: boolean;
  verified: boolean;
  latencyMs: number;
}

export interface StreamProcessingMetrics {
  eventsPerSecond: number;
  tradesPerMinute: number;
  bookUpdatesPerMinute: number;
  volatilityScore: number;
  liquidityScore: number;
  spreadBps: number | null;
  fundingBias: "neutral" | "long_pays" | "short_pays";
  marketBreadth: number;
  anomalyFlags: string[];
  updatedAt: number;
}

export interface IngestQualityReport {
  overallTrust: number;
  staleFeedCount: number;
  conflictCount: number;
  redundancyCoverage: number;
  timestampIntegrity: number;
  uptimePct: number;
  avgLatencyMs: number;
  verifiedSourceRatio: number;
  lastAuditAt: number;
}

export interface StorageLayerStatus {
  tier: StorageTier;
  label: string;
  backend: string;
  itemCount: number;
  capacityHint: string;
  status: "active" | "staged" | "offline";
}

export interface IngestPipelineStatus {
  id: string;
  label: string;
  transport: IngestTransport;
  status: SourceHealth;
  backlog: number;
  dedupeSuppressed: number;
  reconnectCount: number;
  lastFlushAt: number | null;
}

export interface DataIngestionSnapshot {
  sources: DataSourceDescriptor[];
  recentEvents: IngestEventEnvelope[];
  processing: StreamProcessingMetrics;
  quality: IngestQualityReport;
  storage: StorageLayerStatus[];
  pipelines: IngestPipelineStatus[];
  ingestScore: number;
  updatedAt: number;
}
