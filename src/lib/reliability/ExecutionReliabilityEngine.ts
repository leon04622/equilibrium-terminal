import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ExecutionReliabilitySnapshot } from "@/types/reliability";

let failedOrderCount = 0;
let lastErrorSeen: string | null = null;

export class ExecutionReliabilityEngine {
  static snapshot(): ExecutionReliabilitySnapshot {
    const execution = useExecutionIntelligenceStore.getState();
    const terminal = useTerminalStore.getState();

    if (terminal.orderError && terminal.orderError !== lastErrorSeen) {
      failedOrderCount += 1;
      lastErrorSeen = terminal.orderError;
    } else if (!terminal.orderError) {
      lastErrorSeen = null;
    }

    const confirmationClarity = terminal.orderPending ? 62 : 90;
    const slippageWarningCoverage =
      execution.slippage.riskTier === "critical"
        ? 96
        : execution.slippage.riskTier === "high"
          ? 88
          : 78;
    const retrySafetyScore = terminal.orderError ? 58 : 84;
    const reconciliationHealth = Math.max(40, 95 - failedOrderCount * 4);

    return {
      confirmationClarity,
      slippageWarningCoverage,
      retrySafetyScore,
      reconciliationHealth,
      failedOrderCount,
      updatedAt: Date.now(),
    };
  }
}
