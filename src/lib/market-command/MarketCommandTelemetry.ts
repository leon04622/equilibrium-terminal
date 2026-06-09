import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type { MarketCommandTelemetrySnapshot } from "@/types/market-command";

let t0 = 0;

export class MarketCommandTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    criticalIncidents: number;
    systemicTier: string;
    stressScore: number;
    coverageScore: number;
  }): MarketCommandTelemetrySnapshot {
    const graph = marketKnowledgeGraph.snapshot();
    const computeLatencyMs = Math.round(performance.now() - t0);
    const situationalScore = Math.min(
      100,
      Math.round(
        input.coverageScore * 0.2 +
          (input.stressScore < 50 ? 25 : 10) +
          (input.criticalIncidents === 0 ? 25 : 5) +
          (input.systemicTier === "critical" ? 5 : input.systemicTier === "elevated" ? 15 : 25) +
          (computeLatencyMs < 45 ? 15 : 8),
      ),
    );

    return {
      criticalIncidents: input.criticalIncidents,
      systemicTier: input.systemicTier,
      entityCount: graph.entityCount,
      computeLatencyMs,
      situationalScore,
    };
  }
}
