import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import type { OpsDomainStatus, ServiceHealthRow } from "@/types/ops-command";

function mapHealth(ok: boolean): OpsDomainStatus {
  return ok ? "operational" : "degraded";
}

export class PlatformObservabilityCenterEngine {
  static services(): ServiceHealthRow[] {
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const obs = ops.observability;
    const stream = ops.stream;

    return [
      {
        service: "API gateway",
        health: mapHealth(obs.p95ApiMs < 200),
        latencyMs: obs.p95ApiMs,
        throughputPerMin: obs.metricsEps * 60,
      },
      {
        service: "Market stream",
        health: mapHealth(stream.wsConnected),
        latencyMs: stream.lastMessageAgeMs,
        throughputPerMin: stream.reconnectCount < 3 ? 240 : 80,
      },
      {
        service: "Ingestion bus",
        health: mapHealth(stream.ingestionLagMs < 500),
        latencyMs: stream.ingestionLagMs,
        throughputPerMin: 120,
      },
      {
        service: "Observability pipeline",
        health: mapHealth(obs.alertOpenCount <= 2),
        latencyMs: obs.p95StreamFlushMs,
        throughputPerMin: obs.metricsEps,
      },
      {
        service: `Region ${ops.activeRegion}`,
        health: mapHealth(ops.operationalScore >= 75),
        latencyMs: ops.regions.find((r) => r.id === ops.activeRegion)?.latencyMs ?? 0,
        throughputPerMin: 0,
      },
    ];
  }
}
