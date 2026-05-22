import type { IngestEventEnvelope } from "@/types/data-ingestion";

const MAX_EVENTS = 512;

/** Hot storage — in-memory ring buffer for live stream events. */
export class IngestStreamBuffer {
  private static events: IngestEventEnvelope[] = [];

  static push(event: IngestEventEnvelope): void {
    IngestStreamBuffer.events.unshift(event);
    if (IngestStreamBuffer.events.length > MAX_EVENTS) {
      IngestStreamBuffer.events.length = MAX_EVENTS;
    }
  }

  static recent(limit = 48): IngestEventEnvelope[] {
    return IngestStreamBuffer.events.slice(0, limit);
  }

  static count(): number {
    return IngestStreamBuffer.events.length;
  }

  static clear(): void {
    IngestStreamBuffer.events = [];
  }
}
