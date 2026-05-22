import { DataReliabilityEngine } from "@/lib/reliability/DataReliabilityEngine";
import { ExecutionReliabilityEngine } from "@/lib/reliability/ExecutionReliabilityEngine";
import { HighVolatilityModeEngine } from "@/lib/reliability/HighVolatilityModeEngine";
import { RuntimeStabilityEngine } from "@/lib/reliability/RuntimeStabilityEngine";
import type { ReliabilitySnapshot } from "@/types/reliability";

export class ReliabilityOrchestrator {
  static snapshot(): ReliabilitySnapshot {
    const runtime = RuntimeStabilityEngine.snapshot();
    const data = DataReliabilityEngine.snapshot();
    const volatility = HighVolatilityModeEngine.snapshot();
    const execution = ExecutionReliabilityEngine.snapshot();

    const trustScore = Math.round(
      runtime.stateSyncConsistency * 0.26 +
        data.qualityScore * 0.3 +
        execution.reconciliationHealth * 0.24 +
        (volatility.highVolMode ? 72 : 90) * 0.2,
    );

    return {
      runtime,
      data,
      volatility,
      execution,
      trustScore,
      updatedAt: Date.now(),
    };
  }
}
