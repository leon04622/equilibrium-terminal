import { LiquidityVisibilityEngine } from "@/lib/execution-analytics/LiquidityVisibilityEngine";
import { ExecutionQualityEngine } from "@/lib/execution-analytics/ExecutionQualityEngine";
import { MicrostructureEngine } from "@/lib/execution-analytics/MicrostructureEngine";
import { OrderFlowAnalyticsEngine } from "@/lib/execution-analytics/OrderFlowAnalyticsEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { TradeSurveillanceSnapshot } from "@/types/institutional-capabilities";

function washScore(
  buyPct: number,
  sellPct: number,
  delta: number,
  totalVol: number,
  passiveBlocks: number,
): number {
  if (totalVol < 1) return 0;
  const balance = 100 - Math.abs(buyPct - sellPct);
  const lowNet = Math.abs(delta) / totalVol < 0.06 ? 35 : 0;
  const turnover = Math.min(25, totalVol / 500);
  const passive = Math.min(20, passiveBlocks * 8);
  return Math.min(100, Math.round(balance * 0.35 + lowNet + turnover + passive));
}

function layeringScore(
  spoofScore: number,
  voidCount: number,
  depthShiftPct: number,
  passiveBlocks: number,
): number {
  return Math.min(
    100,
    Math.round(spoofScore * 0.45 + voidCount * 8 + Math.abs(depthShiftPct) * 0.4 + passiveBlocks * 6),
  );
}

function toxicFlowScore(toxicCount: number, sweepCount: number, slippageBps: number): number {
  return Math.min(100, Math.round(toxicCount * 28 + sweepCount * 12 + slippageBps * 1.5));
}

export class TradeSurveillanceEngine {
  static snapshot(coin: string): TradeSurveillanceSnapshot {
    const store = useExecutionIntelligenceStore.getState();
    const flow = OrderFlowAnalyticsEngine.metrics();
    const liq = LiquidityVisibilityEngine.snapshot();
    const quality = ExecutionQualityEngine.metrics();
    const micro = MicrostructureEngine.analyze();

    const passiveBlocks = store.participants.filter((p) => p.kind === "passive_absorption").length;
    const toxicCount = store.participants.filter((p) => p.kind === "toxic_flow").length;
    const totalVol = store.cvd.buyVolume + store.cvd.sellVolume;

    const spoofScore = liq.spoofingScore;
    const wash = washScore(
      flow.aggressiveBuyPct,
      flow.aggressiveSellPct,
      store.cvd.delta,
      totalVol,
      passiveBlocks,
    );
    const layering = layeringScore(spoofScore, liq.voidCount, micro.depthShiftPct, passiveBlocks);
    const toxic = toxicFlowScore(toxicCount, flow.sweepCount, quality.slippageBps);

    const compositeRisk = Math.min(
      100,
      Math.round(
        spoofScore * 0.28 +
          wash * 0.18 +
          layering * 0.22 +
          toxic * 0.22 +
          (flow.sweepCount >= 3 ? 10 : 0),
      ),
    );

    return {
      coin: store.coin || coin,
      spoofScore,
      washScore: wash,
      layeringScore: layering,
      toxicFlowScore: toxic,
      sweepCount: flow.sweepCount,
      icebergScore: liq.icebergScore,
      slippageBps: quality.slippageBps,
      spreadBps: quality.spreadBps,
      compositeRisk,
      pipelineActive: store.pipelineActive,
      participantCount: store.participants.length,
      updatedAt: Date.now(),
    };
  }
}
