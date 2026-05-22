import type { PlatformInfrastructureVitals } from "@/types/production-platform";

export type PersistenceJobKind =
  | "telemetry_batch"
  | "snapshot_write"
  | "metric_frame"
  | "event_history";

export interface PersistenceJob {
  id: string;
  kind: PersistenceJobKind;
  userId: string;
  payload: string;
  enqueuedAt: number;
}

export interface PersistenceWorkerStats {
  queueDepth: number;
  lagMs: number;
  processedPerSecond: number;
  lastCommitLatencyMs: number;
  pendingWrites: number;
}

const queue: PersistenceJob[] = [];
const processedTimestamps: number[] = [];
let lastCommitLatencyMs = 0;
let pendingWrites = 0;
let draining = false;
const platformBoot = Date.now();

function recordProcessed(): void {
  const now = Date.now();
  processedTimestamps.push(now);
  const cutoff = now - 1000;
  while (processedTimestamps.length > 0 && (processedTimestamps[0] ?? 0) < cutoff) {
    processedTimestamps.shift();
  }
}

async function processJob(job: PersistenceJob): Promise<void> {
  const started = Date.now();
  pendingWrites += 1;
  await new Promise((resolve) => setTimeout(resolve, Math.min(12, job.payload.length / 400)));
  pendingWrites = Math.max(0, pendingWrites - 1);
  lastCommitLatencyMs = Date.now() - started;
  recordProcessed();
}

export function enqueuePersistenceJob(
  kind: PersistenceJobKind,
  userId: string,
  payload: string,
): string {
  const job: PersistenceJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    kind,
    userId,
    payload,
    enqueuedAt: Date.now(),
  };
  queue.push(job);
  void drainPersistenceQueue();
  return job.id;
}

export async function drainPersistenceQueue(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) break;
      await processJob(job);
    }
  } finally {
    draining = false;
    if (queue.length > 0) {
      void drainPersistenceQueue();
    }
  }
}

export function getPersistenceWorkerStats(): PersistenceWorkerStats {
  const head = queue[0];
  const lagMs = head ? Date.now() - head.enqueuedAt : 0;
  return {
    queueDepth: queue.length,
    lagMs,
    processedPerSecond: processedTimestamps.length,
    lastCommitLatencyMs,
    pendingWrites,
  };
}

export function getPlatformUptimeSec(): number {
  return Math.floor((Date.now() - platformBoot) / 1000);
}

export function buildVitalsFromWorker(
  gatewayLatencyMs: number,
  gatewayUpstreamConnections: number,
  gatewayFanoutClients: number,
  activeSubscriptionTier: PlatformInfrastructureVitals["activeSubscriptionTier"],
  activeDeskCount: number,
): PlatformInfrastructureVitals {
  const worker = getPersistenceWorkerStats();
  return {
    gatewayLatencyMs,
    gatewayUpstreamConnections,
    gatewayFanoutClients,
    workerQueueDepth: worker.queueDepth,
    workerQueueLagMs: worker.lagMs,
    workerProcessedPerSecond: worker.processedPerSecond,
    dbCommitLatencyMs: worker.lastCommitLatencyMs,
    dbPendingWrites: worker.pendingWrites,
    activeSubscriptionTier,
    activeDeskCount,
    systemUptimeSec: getPlatformUptimeSec(),
    updatedAt: Date.now(),
  };
}
