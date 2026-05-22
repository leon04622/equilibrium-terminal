import type { IngestEventEnvelope } from "@/types/data-ingestion";
import type { StreamProcessingMetrics } from "@/types/data-ingestion";

const cache: {
  events: IngestEventEnvelope[];
  vitals: StreamProcessingMetrics | null;
  updatedAt: number;
} = {
  events: [],
  vitals: null,
  updatedAt: 0,
};

export function syncIngestionFeed(
  events: IngestEventEnvelope[],
  vitals?: StreamProcessingMetrics,
): void {
  cache.events = events.slice(0, 64);
  if (vitals) cache.vitals = vitals;
  cache.updatedAt = Date.now();
}

export function getIngestionFeed(limit = 32): {
  feedId: string;
  generatedAt: number;
  events: IngestEventEnvelope[];
  vitals: StreamProcessingMetrics | null;
} {
  return {
    feedId: "eq-ingest-v1",
    generatedAt: cache.updatedAt || Date.now(),
    events: cache.events.slice(0, limit),
    vitals: cache.vitals,
  };
}
