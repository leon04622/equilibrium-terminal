import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { PerpFundingAnalyticsEngine } from "@/lib/derivatives/PerpFundingAnalyticsEngine";
import { VolatilityEngine } from "@/lib/derivatives/VolatilityEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { CrossMarketDerivatives } from "@/types/derivatives-intelligence";

export class CrossMarketDerivativesEngine {
  static analyze(asset: string): CrossMarketDerivatives {
    const vol = VolatilityEngine.metrics(asset);
    const funding = PerpFundingAnalyticsEngine.metrics(asset);
    const spot = useTerminalStore.getState().book?.mid ?? null;
    const quotes = multiExchangeMarketState.forAsset(asset);
    const perpMid =
      quotes.find((q) => q.exchange === "deribit")?.mid ??
      quotes.find((q) => q.exchange === "binance")?.mid ??
      null;

    const spotPerpBasisBps =
      spot != null && perpMid != null && spot > 0
        ? Math.round(((perpMid - spot) / spot) * 10_000 * 10) / 10
        : 0;

    const volPriceCorrelation = Math.round((vol.volSpread / 20) * 100) / 100;
    const leverageLiquidityGap = Math.min(100, funding.leverageConcentration + funding.liquidationPressureScore * 0.3);
    const optionsSpotSkew = vol.skew25d;
    const venues = new Set(quotes.map((q) => q.exchange)).size;
    const crossVenueFragmentation = Math.min(100, Math.round((venues / 6) * 100 - funding.fundingDivergenceBps * 0.5));

    return {
      spotPerpBasisBps,
      volPriceCorrelation,
      leverageLiquidityGap,
      optionsSpotSkew,
      crossVenueFragmentation,
    };
  }
}
