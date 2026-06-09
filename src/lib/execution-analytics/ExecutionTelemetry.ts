import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { ExecutionTelemetrySnapshot } from "@/types/execution-analytics";

let lastSeq = 0;
let lastAt = 0;
let packetCount = 0;

export class ExecutionTelemetry {
  static notePacket(seq: number): void {
    const now = Date.now();
    if (now - lastAt > 1000) {
      packetCount = 0;
      lastAt = now;
    }
    packetCount += 1;
    lastSeq = seq;
  }

  static snapshot(): ExecutionTelemetrySnapshot {
    const store = useExecutionIntelligenceStore.getState();
    const computeLatencyMs =
      store.lastComputedAtNs > 0
        ? Math.max(0, Math.round((performance.now() * 1e6 - store.lastComputedAtNs) / 1e6))
        : 0;

    return {
      workerActive: store.pipelineActive,
      packetsPerSecond: packetCount,
      lastPacketSeq: store.lastPacketSeq,
      computeLatencyMs,
      replayReady: store.footprintBars.length > 0,
    };
  }
}
