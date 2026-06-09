import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import type { RuntimeControlRow } from "@/types/ops-command";

export class RuntimeControlEngine {
  static controls(): RuntimeControlRow[] {
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const stream = ops.stream;
    const now = Date.now();

    return [
      {
        id: "ctl-stream-restart",
        control: "Restart market stream",
        status: stream.wsConnected ? "ready" : "action_required",
        lastActionAt: stream.wsConnected ? now - 120_000 : null,
      },
      {
        id: "ctl-ingest-failover",
        control: "Ingestion failover",
        status: stream.ingestionLagMs < 500 ? "standby" : "action_required",
        lastActionAt: null,
      },
      {
        id: "ctl-replay-flush",
        control: "Replay queue flush",
        status: stream.replayQueueDepth > 0 ? "action_required" : "ready",
        lastActionAt: stream.replayQueueDepth > 0 ? now - 60_000 : null,
      },
      {
        id: "ctl-cache-invalidate",
        control: "Cache invalidation",
        status: "ready",
        lastActionAt: now - 900_000,
      },
      {
        id: "ctl-emergency-calm",
        control: "Emergency calm mode (global)",
        status: stream.stressMode ? "active" : "standby",
        lastActionAt: stream.stressMode ? now - 30_000 : null,
      },
    ];
  }
}
