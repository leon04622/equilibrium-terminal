import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ProprietaryMetric } from "@/types/market-coverage";

function metric(
  id: string,
  label: string,
  value: number,
  unit: string,
  trend: ProprietaryMetric["trend"],
  description: string,
): ProprietaryMetric {
  return { id, label, value, unit, trend, description, updatedAt: Date.now() };
}

export class ProprietaryMetricsEngine {
  static compute(): ProprietaryMetric[] {
    const stress = useMarketAtmosphereStore.getState().stress;
    const regime = useMarketAtmosphereStore.getState().regime;
    const surv = useInformationDiscoveryStore.getState().surveillance;
    const book = useTerminalStore.getState().book;
    const exec = useExecutionIntelligenceStore.getState();

    const eqLiquidity =
      book?.spreadBps != null ? Math.max(0, 100 - book.spreadBps * 4) : 55;
    const fragmentation = Math.min(
      100,
      Math.round((stress.bookImbalance + 1) * 35 + (surv?.stressScore ?? 40) * 0.25),
    );
    const narrativeVelocity = Math.min(
      100,
      Math.round(Math.abs(regime.narrativeAcceleration) + 20),
    );
    const volScore = Math.min(
      100,
      Math.round(stress.velocityRatio * 45 + (surv?.stressScore ?? 0) * 0.35),
    );
    const exchangeStress = Math.min(100, Math.round(stress.score * 0.9));
    const execQuality = exec.executionConfidence;
    const regimeIndex =
      regime.regime === "risk-on"
        ? 72
        : regime.regime === "risk-off"
          ? 28
          : regime.regime === "liquidation"
            ? 12
            : 50;

    return [
      metric(
        "eq-liq",
        "EQ LIQUIDITY INDEX",
        eqLiquidity,
        "/100",
        eqLiquidity > 60 ? "up" : "down",
        "Proprietary depth/spread composite on active venue",
      ),
      metric(
        "eq-frag",
        "FRAGMENTATION",
        fragmentation,
        "/100",
        fragmentation > 55 ? "down" : "flat",
        "Cross-venue liquidity dispersion proxy",
      ),
      metric(
        "eq-narr",
        "NARRATIVE VELOCITY",
        narrativeVelocity,
        "/100",
        regime.narrativeAcceleration > 0 ? "up" : "down",
        "Rate of narrative regime shift — not trade advice",
      ),
      metric(
        "eq-vol",
        "VOLATILITY SCORE",
        volScore,
        "/100",
        volScore > 55 ? "up" : "flat",
        "Tape velocity + surveillance stress blend",
      ),
      metric(
        "eq-stress",
        "EXCHANGE STRESS",
        exchangeStress,
        "/100",
        exchangeStress > 50 ? "up" : "flat",
        "Order book + microstructure pressure",
      ),
      metric(
        "eq-exec",
        "EXEC QUALITY",
        execQuality,
        "/100",
        execQuality > 55 ? "up" : "down",
        "Execution readiness on selected asset",
      ),
      metric(
        "eq-regime",
        "REGIME INDEX",
        regimeIndex,
        "/100",
        "flat",
        `Market regime: ${regime.regime}`,
      ),
    ];
  }
}
