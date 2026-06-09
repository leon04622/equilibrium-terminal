import { stressModeController } from "@/lib/performance/StressModeController";
import { streamProcessingEngine } from "@/lib/performance/StreamProcessingEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { StreamResilienceStatus } from "@/types/devops-operations";

let reconnectCount = 0;
let dedupeDepth = 0;
let replayDepth = 0;

export class StreamResilienceEngine {
  static noteReconnect(): void {
    reconnectCount += 1;
  }

  static noteDedupe(count: number): void {
    dedupeDepth = count;
  }

  static noteReplay(depth: number): void {
    replayDepth = depth;
  }

  static snapshot(): StreamResilienceStatus {
    const terminal = useTerminalStore.getState();
    const last = terminal.lastMessageAt;
    const age = last ? Date.now() - last : 99_999;
    const stream = streamProcessingEngine.resetWindowStats();

    return {
      wsConnected: terminal.connectionStatus === "connected",
      reconnectCount,
      lastMessageAgeMs: age,
      dedupeBufferDepth: dedupeDepth,
      replayQueueDepth: replayDepth,
      ingestionLagMs: streamProcessingEngine.getWsLatencyMs(),
      stressMode: stressModeController.isActive(),
    };
  }
}
