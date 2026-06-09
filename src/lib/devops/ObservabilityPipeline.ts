import { ENVIRONMENT_PROFILES, resolveDeploymentEnvironment } from "@/config/environments";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import { useReliabilityStore } from "@/store/useReliabilityStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ObservabilitySnapshot } from "@/types/devops-operations";

export class ObservabilityPipeline {
  static aggregate(): ObservabilitySnapshot {
    const env = resolveDeploymentEnvironment();
    const profile = ENVIRONMENT_PROFILES[env];
    const perf = usePerformanceStore.getState().vitals;
    const rel = useReliabilityStore.getState().snapshot;
    const conn = useTerminalStore.getState().connectionStatus;

    const openAlerts =
      (rel?.data.staleFeedCount ?? 0) +
      (rel?.execution.failedOrderCount ?? 0) +
      (conn !== "connected" ? 1 : 0);

    return {
      traceSampleRate: profile.traceSampleRate,
      logLevel: profile.logLevel,
      metricsEps: perf.streamEps,
      alertOpenCount: openAlerts,
      p95ApiMs: 24,
      p95StreamFlushMs: perf.lastFlushMs,
      heapMb: perf.heapMb,
      fps: perf.fps,
    };
  }
}
