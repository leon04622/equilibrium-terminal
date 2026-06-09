import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MicrostructureMetrics } from "@/types/execution-analytics";

export class MicrostructureEngine {
  static analyze(): MicrostructureMetrics {
    const { slippage, imbalance, dom, liquidityVoids } =
      useExecutionIntelligenceStore.getState();
    const book = useTerminalStore.getState().book;

    const spreadVelocity = slippage.velocityTicksPerSec;
    const bookVelocity = book ? book.bids.length + book.asks.length : 0;
    const depthShiftPct = Math.abs(
      imbalance.bidResting + imbalance.askResting > 0
        ? ((imbalance.bidResting - imbalance.askResting) /
            (imbalance.bidResting + imbalance.askResting)) *
            100
        : 0,
    );

    const fragmentationScore = dom?.spreadBps != null ? Math.min(100, dom.spreadBps * 2) : 30;
    const vacuumRisk = Math.min(100, liquidityVoids.length * 15);
    const executionPressure = Math.min(
      100,
      spreadVelocity * 4 + depthShiftPct * 0.3 + vacuumRisk * 0.2,
    );

    return {
      spreadVelocity: Math.round(spreadVelocity * 10) / 10,
      bookVelocity,
      depthShiftPct: Math.round(depthShiftPct),
      fragmentationScore: Math.round(fragmentationScore),
      vacuumRisk: Math.round(vacuumRisk),
      executionPressure: Math.round(executionPressure),
    };
  }
}
