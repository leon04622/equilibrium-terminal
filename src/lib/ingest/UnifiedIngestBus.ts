type Handler<T> = (payload: T) => void;

export type IngestEventMap = {
  "ingest:normalized": {
    id: string;
    stream: import("@/types/data-ingestion").IngestStreamKind;
    sourceId: string;
    eventType: string;
    asset: string | null;
  };
  "ingest:trade": {
    exchange: string;
    asset: string;
    price: number;
    size: number;
    timestamp: number;
  };
  "ingest:book": {
    exchange: string;
    asset: string;
    spreadBps: number | null;
    timestamp: number;
  };
  "venue:status": {
    sourceId: string;
    health: import("@/types/data-ingestion").SourceHealth;
    latencyMs: number | null;
  };
  "feed:stale": {
    sourceId: string;
    staleMs: number;
  };
};

/**
 * Central internal event bus for normalized ingest streams.
 * Terminal panels consume standardized events from ONE pipeline.
 */
class UnifiedIngestBus {
  private listeners = new Map<keyof IngestEventMap, Set<Handler<unknown>>>();

  on<K extends keyof IngestEventMap>(
    event: K,
    handler: Handler<IngestEventMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(handler as Handler<unknown>);
    return () => set.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof IngestEventMap>(event: K, payload: IngestEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((handler) => handler(payload));
  }
}

export const ingestBus = new UnifiedIngestBus();
