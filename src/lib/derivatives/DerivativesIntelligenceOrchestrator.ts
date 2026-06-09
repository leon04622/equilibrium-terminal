import { CrossMarketDerivativesEngine } from "@/lib/derivatives/CrossMarketDerivativesEngine";
import { DerivativesAlertEngine } from "@/lib/derivatives/DerivativesAlertEngine";
import { DERIVATIVES_DASHBOARD_MODES } from "@/lib/derivatives/DerivativesDashboardModes";
import { DerivativesMarketStateEngine } from "@/lib/derivatives/DerivativesMarketStateEngine";
import { DerivativesTelemetry } from "@/lib/derivatives/DerivativesTelemetry";
import { GammaPositioningEngine } from "@/lib/derivatives/GammaPositioningEngine";
import { OptionsAnalyticsEngine } from "@/lib/derivatives/OptionsAnalyticsEngine";
import { OptionsIngestionEngine } from "@/lib/derivatives/OptionsIngestionEngine";
import { PerpFundingAnalyticsEngine } from "@/lib/derivatives/PerpFundingAnalyticsEngine";
import { VolatilityEngine } from "@/lib/derivatives/VolatilityEngine";
import type {
  DerivativesDashboardModeId,
  DerivativesIntelligenceSnapshot,
} from "@/types/derivatives-intelligence";

const MODE_STORAGE = "eq-deriv-mode-v1";

function readMode(): DerivativesDashboardModeId {
  if (typeof window === "undefined") return "vol_trader";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && DERIVATIVES_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as DerivativesDashboardModeId;
    }
  } catch {
    /* ignore */
  }
  return "vol_trader";
}

export class DerivativesIntelligenceOrchestrator {
  static snapshot(asset: string): DerivativesIntelligenceSnapshot {
    DerivativesTelemetry.begin();

    const chain = OptionsIngestionEngine.chain(asset);
    const volatility = VolatilityEngine.metrics(asset);
    const options = OptionsAnalyticsEngine.analyze(asset);
    const gamma = GammaPositioningEngine.analyze(asset);
    const funding = PerpFundingAnalyticsEngine.metrics(asset);
    const marketState = DerivativesMarketStateEngine.classify(asset);
    const crossMarket = CrossMarketDerivativesEngine.analyze(asset);
    const alerts = DerivativesAlertEngine.evaluate(asset);
    const telemetry = DerivativesTelemetry.snapshot(chain.length);

    const derivativesScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          telemetry.feedQualityScore * 0.2 +
            (100 - marketState.fragilityScore) * 0.3 +
            (100 - funding.liquidationPressureScore) * 0.2 +
            (100 - gamma.squeezeRiskScore) * 0.15 +
            volatility.compressionScore * 0.15,
        ),
      ),
    );

    return {
      asset,
      volatility,
      options,
      gamma,
      funding,
      marketState,
      crossMarket,
      chain: chain.slice(0, 32),
      alerts,
      dashboardModes: DERIVATIVES_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      derivativesScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: DerivativesDashboardModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
