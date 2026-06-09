import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { KnowledgeMemoryEngine } from "@/lib/systemic-intelligence/KnowledgeMemoryEngine";
import type { SystemicTelemetrySnapshot } from "@/types/systemic-intelligence";

let lastComputeAt = 0;

export class SystemicTelemetry {
  static begin(): void {
    lastComputeAt = performance.now();
  }

  static snapshot(): SystemicTelemetrySnapshot {
    const snap = marketKnowledgeGraph.snapshot();
    const latency = lastComputeAt > 0 ? Math.max(0, Math.round(performance.now() - lastComputeAt)) : 0;
    return {
      entityCount: snap.entityCount,
      linkCount: snap.linkCount,
      computeLatencyMs: latency,
      memoryPoints: KnowledgeMemoryEngine.points().length,
    };
  }
}
