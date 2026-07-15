import { stressModeController } from "@/lib/performance/StressModeController";
import { isWorkspaceScrolling, onWorkspaceScrollEnd } from "@/lib/runtime/workspaceScroll";
import { terminalIngress } from "@/store/terminalStore";
import type { WsBook, WsTrade } from "@/types/hyperliquid";
import type { NormalizedCandle, NormalizedMidSnapshot } from "@/types/terminal-schema";

/**
 * Coalesces high-frequency WS frames into rAF-aligned store commits.
 * Backpressure: drops overflow trade batches under stress.
 */
export class StreamProcessingEngine {
  private static instance: StreamProcessingEngine | null = null;

  private bookPending: WsBook | null = null;
  private tradePending: WsTrade[] = [];
  private candlesPending: NormalizedCandle[] | null = null;
  private midsPending: NormalizedMidSnapshot | null = null;
  private flushScheduled = false;
  private scrollFlushPending = false;
  private coalesced = 0;
  private dropped = 0;
  private processed = 0;
  private lastFlushMs = 0;
  private lastMessageAt = 0;

  static getInstance(): StreamProcessingEngine {
    if (!StreamProcessingEngine.instance) {
      StreamProcessingEngine.instance = new StreamProcessingEngine();
    }
    return StreamProcessingEngine.instance;
  }

  enqueueBook(raw: WsBook): void {
    if (this.bookPending) this.coalesced += 1;
    this.bookPending = raw;
    this.lastMessageAt = Date.now();
    stressModeController.recordMessages(1);
    this.scheduleFlush();
  }

  enqueueTrades(raw: WsTrade[]): void {
    if (!raw.length) return;
    this.tradePending.push(...raw);
    this.lastMessageAt = Date.now();
    stressModeController.recordMessages(raw.length);

    const cap = stressModeController.isActive() ? 300 : 600;
    if (this.tradePending.length > cap) {
      const overflow = this.tradePending.length - cap;
      this.tradePending.splice(0, overflow);
      this.dropped += overflow;
    }
    this.scheduleFlush();
  }

  enqueueCandles(raw: NormalizedCandle[]): void {
    if (!raw.length) return;
    if (this.candlesPending) this.coalesced += 1;
    this.candlesPending = raw;
    this.lastMessageAt = Date.now();
    stressModeController.recordMessages(1);
    this.scheduleFlush();
  }

  enqueueMids(raw: NormalizedMidSnapshot): void {
    if (this.midsPending) this.coalesced += 1;
    this.midsPending = raw;
    this.lastMessageAt = Date.now();
    stressModeController.recordMessages(1);
    this.scheduleFlush();
  }

  getWsLatencyMs(): number {
    if (!this.lastMessageAt) return 0;
    return Math.max(0, Date.now() - this.lastMessageAt);
  }

  resetWindowStats(): { coalesced: number; dropped: number; processed: number; lastFlushMs: number } {
    const out = {
      coalesced: this.coalesced,
      dropped: this.dropped,
      processed: this.processed,
      lastFlushMs: this.lastFlushMs,
    };
    this.coalesced = 0;
    this.dropped = 0;
    this.processed = 0;
    return out;
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    requestAnimationFrame(() => this.flush());
  }

  private deferFlushUntilScrollEnd(): void {
    if (this.scrollFlushPending) return;
    this.scrollFlushPending = true;
    onWorkspaceScrollEnd(() => {
      this.scrollFlushPending = false;
      if (this.bookPending || this.tradePending.length > 0 || this.candlesPending || this.midsPending) {
        this.scheduleFlush();
      }
    });
  }

  private flush(): void {
    this.flushScheduled = false;

    if (isWorkspaceScrolling()) {
      this.deferFlushUntilScrollEnd();
      return;
    }

    const t0 = performance.now();
    const stress = stressModeController.isActive();
    const maxTrades = stress ? 12 : 48;

    if (this.bookPending) {
      terminalIngress.applyBook(this.bookPending);
      this.bookPending = null;
      this.processed += 1;
    }

    if (this.tradePending.length > 0) {
      const batch = this.tradePending.splice(0, maxTrades);
      terminalIngress.pushTrades(batch, { skipIntel: stress });
      this.processed += batch.length;
    }

    if (this.candlesPending) {
      terminalIngress.applyCandles(this.candlesPending);
      this.candlesPending = null;
      this.processed += 1;
    }

    if (this.midsPending) {
      terminalIngress.applyMids(this.midsPending);
      this.midsPending = null;
      this.processed += 1;
    }

    this.lastFlushMs = performance.now() - t0;

    if (this.bookPending || this.tradePending.length > 0 || this.candlesPending || this.midsPending) {
      this.scheduleFlush();
    }
  }
}

export const streamProcessingEngine = StreamProcessingEngine.getInstance();
