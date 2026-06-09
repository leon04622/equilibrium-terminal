import { DerivativesMarketStateEngine } from "@/lib/derivatives/DerivativesMarketStateEngine";
import { GammaPositioningEngine } from "@/lib/derivatives/GammaPositioningEngine";
import { PerpFundingAnalyticsEngine } from "@/lib/derivatives/PerpFundingAnalyticsEngine";
import { VolatilityEngine } from "@/lib/derivatives/VolatilityEngine";
import type { DerivativesAlert, DerivativesAlertKind } from "@/types/derivatives-intelligence";

function alert(
  kind: DerivativesAlertKind,
  severity: DerivativesAlert["severity"],
  headline: string,
  detail: string,
): DerivativesAlert {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    severity,
    headline,
    detail,
    timestamp: Date.now(),
  };
}

export class DerivativesAlertEngine {
  static evaluate(asset: string): DerivativesAlert[] {
    const alerts: DerivativesAlert[] = [];
    const vol = VolatilityEngine.metrics(asset);
    const funding = PerpFundingAnalyticsEngine.metrics(asset);
    const gamma = GammaPositioningEngine.analyze(asset);
    const state = DerivativesMarketStateEngine.classify(asset);

    if (vol.regime === "expansion" || vol.regime === "stress" || vol.volSpread > 10) {
      alerts.push(
        alert(
          "iv_expansion",
          vol.regime === "stress" ? "critical" : "watch",
          "IV expansion",
          `ATM ${vol.impliedVolAtm}% · spread ${vol.volSpread}`,
        ),
      );
    }

    if (Math.abs(funding.hlFundingBps) >= 8 || funding.fundingDivergenceBps >= 12) {
      alerts.push(
        alert(
          "funding_spike",
          Math.abs(funding.hlFundingBps) >= 15 ? "critical" : "watch",
          "Funding dislocation",
          `HL ${funding.hlFundingBps} bps · div ${funding.fundingDivergenceBps} bps`,
        ),
      );
    }

    if (funding.oiGrowthPct >= 25) {
      alerts.push(
        alert(
          "oi_explosion",
          funding.oiGrowthPct >= 40 ? "critical" : "watch",
          "OI growth spike",
          `${funding.oiGrowthPct}% cross-venue`,
        ),
      );
    }

    if (gamma.squeezeRiskScore >= 60) {
      alerts.push(
        alert(
          "gamma_squeeze",
          gamma.squeezeRiskScore >= 80 ? "critical" : "watch",
          "Gamma squeeze environment",
          `Risk ${gamma.squeezeRiskScore} · ${gamma.dealerGammaBias}`,
        ),
      );
    }

    if (vol.skew25d > 8 || vol.skew25d < -8) {
      alerts.push(
        alert(
          "positioning_dislocation",
          "watch",
          "Options skew dislocation",
          `25Δ skew ${vol.skew25d}`,
        ),
      );
    }

    if (vol.regime !== "neutral" && state.fragilityScore >= 50) {
      alerts.push(
        alert(
          "vol_regime_shift",
          state.fragilityScore >= 75 ? "critical" : "watch",
          "Volatility regime shift",
          `${vol.regime} · fragility ${state.fragilityScore}`,
        ),
      );
    }

    if (funding.liquidationPressureScore >= 65) {
      alerts.push(
        alert(
          "liquidation_pressure",
          funding.liquidationPressureScore >= 85 ? "critical" : "watch",
          "Liquidation pressure escalation",
          `Score ${funding.liquidationPressureScore}`,
        ),
      );
    }

    return alerts.slice(0, 12);
  }
}
