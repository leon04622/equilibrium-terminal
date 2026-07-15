import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useLiveBlotterStore } from "@/store/useLiveBlotterStore";
import { useTerminalStore } from "@/store/terminalStore";
import { SettlementReconciliationEngine } from "@/lib/institutional/SettlementReconciliationEngine";
import type { ExecutionReliabilitySnapshot } from "@/types/reliability";

let failedOrderCount = 0;
let lastErrorSeen: string | null = null;

export class ExecutionReliabilityEngine {
  static snapshot(): ExecutionReliabilitySnapshot {
    const execution = useExecutionIntelligenceStore.getState();
    const terminal = useTerminalStore.getState();
    const blotter = useLiveBlotterStore.getState().snapshot;
    const recon = SettlementReconciliationEngine.snapshot(blotter);

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
    const reconciliationHealth = Math.round(
      recon.healthScore * 0.75 + Math.max(40, 95 - failedOrderCount * 4) * 0.25,
    );

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
