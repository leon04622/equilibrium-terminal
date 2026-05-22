import type { TraderInteractionEvent } from "@/types/trader-telemetry";

const MAX_BUFFER = 4096;
const DEFAULT_BATCH = 64;

export type FlushHandler = (batch: TraderInteractionEvent[]) => void;

/**
 * Ultra-fast interaction buffer — never touches the React render loop.
 * Flushes via queueMicrotask with requestIdleCallback fallback.
 */
export class EventBuffer {
  private static instance: EventBuffer | null = null;

  private queue: TraderInteractionEvent[] = [];
  private flushScheduled = false;
  private flushHandler: FlushHandler | null = null;
  private dropped = 0;

  static getInstance(): EventBuffer {
    if (!EventBuffer.instance) {
      EventBuffer.instance = new EventBuffer();
    }
    return EventBuffer.instance;
  }

  setFlushHandler(handler: FlushHandler | null): void {
    this.flushHandler = handler;
  }

  getDepth(): number {
    return this.queue.length;
  }

  getDropped(): number {
    return this.dropped;
  }

  resetDropped(): number {
    const n = this.dropped;
    this.dropped = 0;
    return n;
  }

  push(event: TraderInteractionEvent): void {
    if (this.queue.length >= MAX_BUFFER) {
      this.queue.shift();
      this.dropped += 1;
    }
    this.queue.push(event);
    this.scheduleFlush();
  }

  pushMany(events: TraderInteractionEvent[]): void {
    for (const ev of events) {
      if (this.queue.length >= MAX_BUFFER) {
        this.queue.shift();
        this.dropped += 1;
      }
      this.queue.push(ev);
    }
    if (events.length > 0) this.scheduleFlush();
  }

  drain(max = DEFAULT_BATCH): TraderInteractionEvent[] {
    if (this.queue.length === 0) return [];
    const count = Math.min(max, this.queue.length);
    return this.queue.splice(0, count);
  }

  private scheduleFlush(): void {
    if (this.flushScheduled || !this.flushHandler) return;
    this.flushScheduled = true;

    const run = () => {
      this.flushScheduled = false;
      const handler = this.flushHandler;
      if (!handler) return;

      let batch = this.drain(DEFAULT_BATCH);
      while (batch.length > 0) {
        handler(batch);
        batch = this.drain(DEFAULT_BATCH);
      }

      if (this.queue.length > 0) this.scheduleFlush();
    };

    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => {
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(() => run(), { timeout: 32 });
        } else {
          run();
        }
      });
    } else if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => run(), { timeout: 32 });
    } else {
      setTimeout(run, 0);
    }
  }
}

export const eventBuffer = EventBuffer.getInstance();
