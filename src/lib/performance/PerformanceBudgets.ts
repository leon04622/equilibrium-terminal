import type { PerformanceBudgets } from "@/types/terminal-performance";

/** Institutional performance budgets — violations surface in diagnostics. */
export const PERFORMANCE_BUDGETS: PerformanceBudgets = {
  frameTimeWarnMs: 20,
  frameTimeCriticalMs: 33,
  commandParseMs: 8,
  streamFlushMs: 12,
  wsIngressMs: 16,
  heapWarnMb: 512,
  stressThroughputEps: 90,
};

export function budgetStatus(
  vitals: { frameTimeMs: number; heapMb: number; lastFlushMs: number },
): "ok" | "warn" | "critical" {
  if (
    vitals.frameTimeMs >= PERFORMANCE_BUDGETS.frameTimeCriticalMs ||
    vitals.heapMb >= PERFORMANCE_BUDGETS.heapWarnMb
  ) {
    return "critical";
  }
  if (
    vitals.frameTimeMs >= PERFORMANCE_BUDGETS.frameTimeWarnMs ||
    vitals.lastFlushMs >= PERFORMANCE_BUDGETS.streamFlushMs
  ) {
    return "warn";
  }
  return "ok";
}
