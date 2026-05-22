import type { PersistenceJobKind } from "@/lib/infrastructure/server/persistenceWorker";

export interface ClientPersistenceJob {
  id: string;
  kind: PersistenceJobKind;
  userId: string;
  payload: string;
  enqueuedAt: number;
  attempts: number;
}

export type PersistenceFlushHandler = (
  jobs: ClientPersistenceJob[],
) => Promise<{ accepted: string[]; failed: string[] }>;

export interface PersistenceQueueMetrics {
  depth: number;
  lagMs: number;
  flushedTotal: number;
  failedTotal: number;
  lastFlushMs: number;
}

/**
 * Client-side non-blocking persistence queue.
 * Batches telemetry and metric frames without blocking UI reads.
 */
export class PersistenceQueue {
  private readonly maxDepth: number;
  private readonly flushIntervalMs: number;
  private readonly batchSize: number;
  private readonly queue: ClientPersistenceJob[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;
  private handler: PersistenceFlushHandler | null = null;
  private flushedTotal = 0;
  private failedTotal = 0;
  private lastFlushMs = 0;

  constructor(options?: {
    maxDepth?: number;
    flushIntervalMs?: number;
    batchSize?: number;
  }) {
    this.maxDepth = options?.maxDepth ?? 2048;
    this.flushIntervalMs = options?.flushIntervalMs ?? 750;
    this.batchSize = options?.batchSize ?? 32;
  }

  setFlushHandler(handler: PersistenceFlushHandler): void {
    this.handler = handler;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.flush();
    }, this.flushIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  enqueue(kind: PersistenceJobKind, userId: string, payload: string): string | null {
    if (this.queue.length >= this.maxDepth) {
      this.queue.shift();
    }
    const job: ClientPersistenceJob = {
      id: `cq_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      kind,
      userId,
      payload,
      enqueuedAt: Date.now(),
      attempts: 0,
    };
    this.queue.push(job);
    return job.id;
  }

  getMetrics(): PersistenceQueueMetrics {
    const head = this.queue[0];
    return {
      depth: this.queue.length,
      lagMs: head ? Date.now() - head.enqueuedAt : 0,
      flushedTotal: this.flushedTotal,
      failedTotal: this.failedTotal,
      lastFlushMs: this.lastFlushMs,
    };
  }

  async flush(): Promise<void> {
    if (this.flushing || !this.handler || this.queue.length === 0) return;
    this.flushing = true;
    const started = Date.now();
    try {
      const batch = this.queue.splice(0, this.batchSize);
      const result = await this.handler(batch);
      this.flushedTotal += result.accepted.length;
      this.failedTotal += result.failed.length;

      for (const job of batch) {
        if (result.failed.includes(job.id)) {
          job.attempts += 1;
          if (job.attempts < 3) {
            this.queue.push(job);
          }
        }
      }
    } finally {
      this.lastFlushMs = Date.now() - started;
      this.flushing = false;
    }
  }
}

export const clientPersistenceQueue = new PersistenceQueue();
