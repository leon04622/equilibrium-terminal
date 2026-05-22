import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketConditionLayer } from "@/types/daily-operations";

export class MarketStateLayer {
  static build(): MarketConditionLayer {
    const atmosphere = useMarketAtmosphereStore.getState();
    const surveillance = useInformationDiscoveryStore.getState().surveillance;
    const terminal = useTerminalStore.getState();
    const stress = atmosphere.stress;
    const regime = atmosphere.regime.regime;

    const volatilityState: MarketConditionLayer["volatilityState"] =
      stress.velocityRatio > 1.6 || (surveillance?.stressScore ?? 0) > 75
        ? "extreme"
        : stress.velocityRatio > 1.25 || (surveillance?.stressScore ?? 0) > 55
          ? "elevated"
          : stress.velocityRatio < 0.75
            ? "compressed"
            : "normal";

    const spread = stress.spreadBps ?? terminal.book?.spreadBps ?? 8;
    const liquidityState: MarketConditionLayer["liquidityState"] =
      spread > 18 || stress.bookImbalance > 0.45
        ? "stressed"
        : spread > 12
          ? "thin"
          : spread > 6
            ? "adequate"
            : "deep";

    const fundingEnvironment: MarketConditionLayer["fundingEnvironment"] =
      regime === "liquidation"
        ? "extreme"
        : atmosphere.regime.narrativeAcceleration > 25
          ? "long_pays"
          : atmosphere.regime.narrativeAcceleration < -25
            ? "short_pays"
            : "neutral";

    const sentimentEnvironment: MarketConditionLayer["sentimentEnvironment"] =
      regime === "risk-on"
        ? "risk-on"
        : regime === "risk-off" || regime === "liquidation"
          ? "risk-off"
          : "mixed";

    const macroRiskLevel: MarketConditionLayer["macroRiskLevel"] =
      atmosphere.calendar.some((e) => e.impact === "high" && e.scheduledAt - Date.now() < 3_600_000 * 4)
        ? "event"
        : atmosphere.calendar.some((e) => e.impact === "high")
          ? "elevated"
          : stress.score > 60
            ? "moderate"
            : "low";

    const riskOnOff: MarketConditionLayer["riskOnOff"] =
      regime === "risk-on"
        ? "risk-on"
        : regime === "risk-off" || regime === "liquidation"
          ? "risk-off"
          : "neutral";

    const movers = surveillance?.movers ?? [];
    const breadthScore = movers.length
      ? Math.round(
          (movers.filter((m) => m.changePct > 0).length / movers.length) * 100,
        )
      : 50;

    const compositeLabel =
      volatilityState === "extreme"
        ? "HIGH STRESS — REDUCE FRICTION"
        : liquidityState === "stressed"
          ? "LIQUIDITY STRESSED"
          : riskOnOff === "risk-on"
            ? "RISK-ON TAPE"
            : riskOnOff === "risk-off"
              ? "RISK-OFF TAPE"
              : "BALANCED CONDITIONS";

    return {
      regime,
      volatilityState,
      liquidityState,
      fundingEnvironment,
      sentimentEnvironment,
      macroRiskLevel,
      riskOnOff,
      breadthScore,
      compositeLabel,
      updatedAt: Date.now(),
    };
  }
}
