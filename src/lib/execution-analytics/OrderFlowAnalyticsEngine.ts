import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { OrderFlowMetrics } from "@/types/execution-analytics";

export class OrderFlowAnalyticsEngine {
  static metrics(): OrderFlowMetrics {
    const { cvd, imbalance, participants, footprintBars } =
      useExecutionIntelligenceStore.getState();

    const totalVol = cvd.buyVolume + cvd.sellVolume;
    const aggressiveBuyPct = totalVol > 0 ? (cvd.buyVolume / totalVol) * 100 : 50;
    const aggressiveSellPct = totalVol > 0 ? (cvd.sellVolume / totalVol) * 100 : 50;

    let marketPressure: OrderFlowMetrics["marketPressure"] = "neutral";
    if (cvd.delta > totalVol * 0.08) marketPressure = "buy";
    else if (cvd.delta < -totalVol * 0.08) marketPressure = "sell";

    const sweeps = participants.filter((p) => p.kind === "hft_sweep").length;
    const absorption = participants.filter((p) => p.kind === "passive_absorption").length;
    const absorptionScore = Math.min(
      100,
      absorption * 18 + (imbalance.skew === "neutral" ? 20 : 40),
    );

    const barDelta = footprintBars[0]?.barDelta ?? cvd.delta;
    const momentumScore = Math.min(100, Math.abs(barDelta) / Math.max(totalVol * 0.05, 1) * 50);

    const imbalancePct =
      imbalance.bidResting + imbalance.askResting > 0
        ? ((imbalance.bidResting - imbalance.askResting) /
            (imbalance.bidResting + imbalance.askResting)) *
          100
        : 0;

    return {
      aggressiveBuyPct: Math.round(aggressiveBuyPct),
      aggressiveSellPct: Math.round(aggressiveSellPct),
      marketPressure,
      absorptionScore: Math.round(absorptionScore),
      sweepCount: sweeps,
      momentumScore: Math.round(momentumScore),
      imbalancePct: Math.round(imbalancePct),
    };
  }
}
