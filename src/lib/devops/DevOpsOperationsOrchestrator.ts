import { resolveDeploymentEnvironment } from "@/config/environments";
import { DatabaseOperationsEngine } from "@/lib/devops/DatabaseOperationsEngine";
import { DeploymentOrchestrator } from "@/lib/devops/DeploymentOrchestrator";
import { GlobalRoutingEngine } from "@/lib/devops/GlobalRoutingEngine";
import { IncidentResponseEngine } from "@/lib/devops/IncidentResponseEngine";
import { ObservabilityPipeline } from "@/lib/devops/ObservabilityPipeline";
import { StreamResilienceEngine } from "@/lib/devops/StreamResilienceEngine";
import { useReliabilityStore } from "@/store/useReliabilityStore";
import type { DevOpsOperationsSnapshot } from "@/types/devops-operations";

const SLO_TARGET = 99.9;

export class DevOpsOperationsOrchestrator {
  static snapshot(): DevOpsOperationsSnapshot {
    const stream = StreamResilienceEngine.snapshot();
    const observability = ObservabilityPipeline.aggregate();
    const regions = GlobalRoutingEngine.regions({
      "us-east": observability.p95ApiMs + 8,
      "eu-west": observability.p95ApiMs + 24,
    });
    const activeRegion = GlobalRoutingEngine.pickActiveRegion(regions);
    const reliability = useReliabilityStore.getState().snapshot;

    let operationalScore = 92;
    if (!stream.wsConnected) operationalScore -= 25;
    if (stream.lastMessageAgeMs > 15_000) operationalScore -= 15;
    if (stream.stressMode) operationalScore -= 8;
    if (observability.alertOpenCount > 2) operationalScore -= 10;
    if (observability.fps < 45) operationalScore -= 6;
    operationalScore = Math.max(0, Math.min(100, operationalScore));

    const uptimePct = reliability?.trustScore ?? 94;

    IncidentResponseEngine.autoDetect({
      wsConnected: stream.wsConnected,
      lastMessageAgeMs: stream.lastMessageAgeMs,
      stressMode: stream.stressMode,
      operationalScore,
    });

    return {
      environment: resolveDeploymentEnvironment(),
      release: DeploymentOrchestrator.currentRelease(),
      regions,
      activeRegion,
      uptimePct,
      sloTargetPct: SLO_TARGET,
      observability,
      stream,
      database: DatabaseOperationsEngine.snapshot(),
      incidents: IncidentResponseEngine.list(),
      cicdLastRun: DeploymentOrchestrator.cicdLastRun(),
      cicdStatus: DeploymentOrchestrator.cicdStatus(),
      operationalScore,
      updatedAt: Date.now(),
    };
  }
}
