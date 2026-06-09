import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { SystemicIntelligenceOrchestrator } from "@/lib/systemic-intelligence/SystemicIntelligenceOrchestrator";
import type { VolatilityCommandRow } from "@/types/market-command";

export class VolatilityCommandEngine {
  static dashboard(asset: string): VolatilityCommandRow[] {
    const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
    const systemic = SystemicIntelligenceOrchestrator.snapshot(asset);
    const atmosphere = useMarketAtmosphereStore.getState();

    return [
      {
        id: "vol-regime",
        indicator: "Market regime",
        value: atmosphere.regime.regime,
        severity: atmosphere.regime.regime === "liquidation" ? "critical" : "info",
      },
      {
        id: "vol-stress",
        indicator: "Stress gauge",
        value: `${atmosphere.stress.score.toFixed(0)}`,
        severity: atmosphere.stress.score > 70 ? "critical" : "watch",
      },
      {
        id: "vol-prop",
        indicator: "Vol propagation",
        value: `${systemic.systemicRisk.volPropagation}`,
        severity: systemic.systemicRisk.volPropagation >= 70 ? "critical" : "info",
      },
      {
        id: "vol-deriv",
        indicator: "Derivatives desk",
        value: `score ${deriv.derivativesScore}`,
        severity: deriv.derivativesScore < 50 ? "watch" : "info",
      },
      {
        id: "vol-narr",
        indicator: "Narrative acceleration",
        value: `${systemic.narratives.accelerationScore}`,
        severity: systemic.narratives.accelerationScore >= 75 ? "watch" : "info",
      },
    ];
  }
}
