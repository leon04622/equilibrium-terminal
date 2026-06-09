import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { LiquidityHeatmapRow, LiquidityVisibility } from "@/types/execution-analytics";

export class LiquidityVisibilityEngine {
  static snapshot(): LiquidityVisibility {
    const { dom, liquidityVoids, icebergProbability, spoofingProbability } =
      useExecutionIntelligenceStore.getState();

    const heatmap: LiquidityHeatmapRow[] = (dom?.levels ?? [])
      .slice(0, 20)
      .map((l) => ({
        price: l.price,
        bidDepth: l.bidSize,
        askDepth: l.askSize,
        heat: l.heatIntensity,
        withdrawalRisk: l.voidScore,
      }));

    const restingBidUsd = heatmap.reduce((s, r) => s + r.bidDepth * r.price, 0);
    const restingAskUsd = heatmap.reduce((s, r) => s + r.askDepth * r.price, 0);

    const depthCollapseRisk =
      dom?.spreadBps != null && dom.spreadBps > 15
        ? Math.min(100, dom.spreadBps * 3)
        : liquidityVoids.length * 12;

    return {
      heatmap,
      restingBidUsd,
      restingAskUsd,
      depthCollapseRisk: Math.min(100, depthCollapseRisk),
      spoofingScore: Math.round(spoofingProbability * 100),
      icebergScore: Math.round(icebergProbability * 100),
      voidCount: liquidityVoids.length,
    };
  }
}
