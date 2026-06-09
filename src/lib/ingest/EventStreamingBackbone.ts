import type { IngestEventEnvelope } from "@/types/data-ingestion";
import type { BackboneStreamTopic } from "@/types/market-data-backbone";

const RING_MAX = 256;
const rings = new Map<BackboneStreamTopic, IngestEventEnvelope[]>();
const epsWindow = new Map<BackboneStreamTopic, { count: number; windowStart: number }>();

function ring(topic: BackboneStreamTopic): IngestEventEnvelope[] {
  if (!rings.has(topic)) rings.set(topic, []);
  return rings.get(topic)!;
}

export class EventStreamingBackbone {
  /** Publish to unified internal stream (Kafka/NATS abstraction). */
  static publish(topic: BackboneStreamTopic, envelope: IngestEventEnvelope): void {
    const r = ring(topic);
    r.unshift(envelope);
    if (r.length > RING_MAX) r.length = RING_MAX;

    const w = epsWindow.get(topic) ?? { count: 0, windowStart: Date.now() };
    w.count += 1;
    epsWindow.set(topic, w);
  }

  static recent(topic: BackboneStreamTopic, limit = 32): IngestEventEnvelope[] {
    return ring(topic).slice(0, limit);
  }

  static metrics(): import("@/types/market-data-backbone").EventStreamMetrics[] {
    const topics: BackboneStreamTopic[] = [
      "market",
      "liquidity",
      "intelligence",
      "derivatives",
      "macro",
      "execution",
    ];
    const now = Date.now();

    return topics.map((topic) => {
      const w = epsWindow.get(topic) ?? { count: 0, windowStart: now };
      const elapsed = Math.max(1, now - w.windowStart) / 1000;
      const eps = w.count / elapsed;
      if (now - w.windowStart > 2000) {
        epsWindow.set(topic, { count: 0, windowStart: now });
      }
      const r = ring(topic);
      return {
        topic,
        eventsPerSecond: Math.round(eps * 10) / 10,
        backlog: r.length,
        lastPublishAt: r[0]?.receivedAt ?? null,
      };
    });
  }

  static clear(): void {
    rings.clear();
    epsWindow.clear();
  }
}
