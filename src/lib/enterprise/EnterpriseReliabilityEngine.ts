import { ReliabilityOrchestrator } from "@/lib/reliability";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { EnterpriseReliabilityState } from "@/types/enterprise-operations";

export class EnterpriseReliabilityEngine {
  static state(): EnterpriseReliabilityState {
    const reliability = ReliabilityOrchestrator.snapshot();
    const vitals = useProductionConfigStore.getState().vitals;
    const trustScore = reliability.trustScore;

    return {
      uptimePct: Math.min(99.99, 99.5 + trustScore * 0.005),
      redundancyMode:
        vitals.gatewayLatencyMs > 120
          ? "degraded"
          : vitals.workerQueueDepth > 50
            ? "active-passive"
            : "active-active",
      failoverReady: trustScore > 70,
      drRpoMinutes: 5,
      drRtoMinutes: 15,
      deterministicOps: reliability.runtime.stateSyncConsistency > 85,
      monitoringActive: vitals.gatewayUpstreamConnections > 0,
    };
  }
}
