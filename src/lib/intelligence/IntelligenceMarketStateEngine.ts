import { MarketStateLayer } from "@/lib/daily/MarketStateLayer";
import { StreamProcessingEngine } from "@/lib/ingest/StreamProcessingEngine";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { IntelligenceMarketState } from "@/types/market-intelligence";

export class IntelligenceMarketStateEngine {
  static classify(): IntelligenceMarketState {
    const layer = MarketStateLayer.build();
    const processing = StreamProcessingEngine.compute();
    const atmosphere = useMarketAtmosphereStore.getState();

    const leverageEnvironment: IntelligenceMarketState["leverageEnvironment"] =
      layer.fundingEnvironment === "extreme"
        ? "extreme"
        : layer.fundingEnvironment === "long_pays"
          ? "long_crowded"
          : layer.fundingEnvironment === "short_pays"
            ? "short_crowded"
            : processing.fundingBias === "long_pays"
              ? "long_crowded"
              : processing.fundingBias === "short_pays"
                ? "short_crowded"
                : "neutral";

    const sentimentState: IntelligenceMarketState["sentimentState"] =
      layer.regime === "liquidation"
        ? "liquidation"
        : layer.sentimentEnvironment;

    return {
      volatilityEnvironment: layer.volatilityState,
      liquidityEnvironment: layer.liquidityState,
      leverageEnvironment,
      marketBreadth: processing.marketBreadth,
      sentimentState,
      macroRiskLevel: layer.macroRiskLevel,
      compositeLabel: layer.compositeLabel,
      regime: atmosphere.regime.regime,
      updatedAt: Date.now(),
    };
  }
}
