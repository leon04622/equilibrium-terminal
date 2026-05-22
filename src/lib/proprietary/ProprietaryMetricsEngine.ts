import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { useTerminalStore } from "@/store/terminalStore";
import type { ProprietaryMetric } from "@/types/proprietary-intelligence";

function bandFromScore(score: number): ProprietaryMetric["band"] {
  if (score >= 80) return "critical";
  if (score >= 60) return "elevated";
  if (score >= 35) return "moderate";
  return "low";
}

export class ProprietaryMetricsEngine {
  static metrics(): ProprietaryMetric[] {
    const intel = IntelligenceOrchestrator.snapshot();
    const book = useTerminalStore.getState().book;
    const spreadBps = book?.spreadBps ?? 6;
    const now = Date.now();
    const ms = intel.marketState;

    const liquidityStress = Math.round(
      (ms.liquidityEnvironment === "stressed" ? 85 : ms.liquidityEnvironment === "thin" ? 62 : 28) +
        spreadBps * 2,
    );
    const exchangeRisk = ms.macroRiskLevel === "event" ? 78 : ms.macroRiskLevel === "elevated" ? 55 : 32;
    const leverageSat =
      ms.leverageEnvironment === "extreme" ? 88 : ms.leverageEnvironment === "long_crowded" ? 68 : 40;
    const stableConf = ms.sentimentState === "liquidation" ? 42 : ms.sentimentState === "risk-off" ? 58 : 82;
    const volRegime =
      ms.volatilityEnvironment === "extreme" ? 90 : ms.volatilityEnvironment === "elevated" ? 65 : 35;
    const narrativeAccel = Math.min(100, intel.sectorNarratives[0]?.velocity ?? 45);
    const execQuality = Math.max(20, 100 - spreadBps * 4 - (intel.anomalyCount > 2 ? 15 : 0));
    const breadth = ms.marketBreadth;
    const fragmentation = Math.round(35 + spreadBps * 3 + (ms.liquidityEnvironment === "thin" ? 20 : 0));

    const defs: Omit<ProprietaryMetric, "id" | "updatedAt">[] = [
      {
        kind: "liquidity_stress",
        label: "EQ Liquidity Stress Index",
        value: liquidityStress,
        unit: "EQ-LSI",
        band: bandFromScore(liquidityStress),
        trend: liquidityStress > 60 ? "deteriorating" : "stable",
        description: "Composite liquidity pressure across active venues and depth.",
      },
      {
        kind: "exchange_risk",
        label: "EQ Exchange Risk Index",
        value: exchangeRisk,
        unit: "EQ-ERI",
        band: bandFromScore(exchangeRisk),
        trend: exchangeRisk > 55 ? "deteriorating" : "improving",
        description: "Cross-venue operational and market-structure risk composite.",
      },
      {
        kind: "leverage_saturation",
        label: "EQ Leverage Saturation",
        value: leverageSat,
        unit: "EQ-LSAT",
        band: bandFromScore(leverageSat),
        trend: leverageSat > 65 ? "deteriorating" : "stable",
        description: "Crowding and positioning saturation across perp markets.",
      },
      {
        kind: "stablecoin_confidence",
        label: "EQ Stablecoin Confidence",
        value: stableConf,
        unit: "EQ-SCI",
        band: stableConf < 50 ? "critical" : stableConf < 70 ? "elevated" : "low",
        trend: stableConf > 75 ? "improving" : "deteriorating",
        description: "Stablecoin system confidence and depeg risk proxy.",
      },
      {
        kind: "volatility_regime",
        label: "EQ Volatility Regime Index",
        value: volRegime,
        unit: "EQ-VRI",
        band: bandFromScore(volRegime),
        trend: volRegime > 70 ? "deteriorating" : "stable",
        description: "Regime classification for institutional vol positioning.",
      },
      {
        kind: "narrative_acceleration",
        label: "EQ Narrative Acceleration",
        value: narrativeAccel,
        unit: "EQ-NAR",
        band: bandFromScore(narrativeAccel),
        trend: narrativeAccel > 70 ? "deteriorating" : "stable",
        description: "Sector narrative velocity and attention concentration.",
      },
      {
        kind: "execution_quality",
        label: "EQ Execution Quality Index",
        value: execQuality,
        unit: "EQ-EQI",
        band: execQuality < 45 ? "critical" : execQuality < 65 ? "elevated" : "low",
        trend: execQuality > 70 ? "improving" : "deteriorating",
        description: "Slippage, spread, and fill quality composite for active asset.",
      },
      {
        kind: "market_breadth",
        label: "EQ Market Breadth",
        value: breadth,
        unit: "EQ-BRD",
        band: breadth < 35 ? "critical" : breadth < 55 ? "elevated" : "low",
        trend: "stable",
        description: "Participation breadth across tracked crypto beta universe.",
      },
      {
        kind: "liquidity_fragmentation",
        label: "EQ Liquidity Fragmentation",
        value: fragmentation,
        unit: "EQ-LFR",
        band: bandFromScore(fragmentation),
        trend: fragmentation > 55 ? "deteriorating" : "stable",
        description: "Order flow and depth fragmentation across venues.",
      },
    ];

    return defs.map((d, i) => ({
      ...d,
      id: `eq-metric-${d.kind}`,
      updatedAt: now - i * 1000,
    }));
  }
}
