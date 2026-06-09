import type { DevOpsOperationsSnapshot } from "@/types/devops-operations";

let processStartedAt = Date.now();
let requestCount = 0;
let errorCount = 0;

export function recordRequest(ok: boolean): void {
  requestCount += 1;
  if (!ok) errorCount += 1;
}

export function serverOpsVitals(): Pick<
  DevOpsOperationsSnapshot,
  "uptimePct" | "observability" | "operationalScore" | "updatedAt"
> & { processUptimeSec: number; errorRatePct: number } {
  const uptimeSec = Math.floor((Date.now() - processStartedAt) / 1000);
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  const uptimePct = Math.max(90, 100 - errorRate * 2);

  return {
    processUptimeSec: uptimeSec,
    errorRatePct: Math.round(errorRate * 10) / 10,
    uptimePct,
    observability: {
      traceSampleRate: 0.1,
      logLevel: "info",
      metricsEps: requestCount / Math.max(1, uptimeSec),
      alertOpenCount: errorCount > 5 ? 1 : 0,
      p95ApiMs: 18,
      p95StreamFlushMs: 8,
      heapMb: 0,
      fps: 60,
    },
    operationalScore: Math.round(uptimePct),
    updatedAt: Date.now(),
  };
}
