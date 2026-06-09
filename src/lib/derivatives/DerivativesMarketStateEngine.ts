import { GammaPositioningEngine } from "@/lib/derivatives/GammaPositioningEngine";
import { PerpFundingAnalyticsEngine } from "@/lib/derivatives/PerpFundingAnalyticsEngine";
import { VolatilityEngine } from "@/lib/derivatives/VolatilityEngine";
import type {
  DerivativesMarketRegime,
  DerivativesMarketState,
} from "@/types/derivatives-intelligence";

export class DerivativesMarketStateEngine {
  static classify(asset: string): DerivativesMarketState {
    const vol = VolatilityEngine.metrics(asset);
    const funding = PerpFundingAnalyticsEngine.metrics(asset);
    const gamma = GammaPositioningEngine.analyze(asset);

    const leverageSaturation = funding.leverageConcentration;
    const fundingStress = Math.min(100, Math.round(Math.abs(funding.hlFundingBps) * 4 + funding.fundingDivergenceBps));
    const optionsPressure = Math.min(100, gamma.squeezeRiskScore + gamma.expiryPressureScore * 0.3);
    const fragilityScore = Math.min(
      100,
      Math.round(
        funding.liquidationPressureScore * 0.35 +
          optionsPressure * 0.25 +
          (vol.regime === "stress" ? 25 : vol.regime === "expansion" ? 15 : 0) +
          leverageSaturation * 0.15,
      ),
    );

    let regime: DerivativesMarketRegime = "low_leverage";
    if (funding.liquidationPressureScore >= 70) regime = "liquidation_risk";
    else if (gamma.squeezeRiskScore >= 65) regime = "gamma_pin";
    else if (fundingStress >= 55) regime = "funding_stress";
    else if (vol.regime === "expansion" || vol.regime === "stress") regime = "vol_expansion";
    else if (fragilityScore >= 60) regime = "fragile";

    const dealerPositioning =
      gamma.dealerGammaBias === "short_gamma"
        ? "Dealers short gamma — vol expansion risk"
        : gamma.dealerGammaBias === "long_gamma"
          ? "Dealers long gamma — mean-reversion bias"
          : "Dealer gamma neutral";

    return {
      regime,
      leverageSaturation,
      volatilityRegime: vol.regime,
      optionsPressure,
      dealerPositioning,
      fundingStress,
      fragilityScore,
    };
  }
}
