import { ProprietaryMetricsEngine } from "@/lib/proprietary/ProprietaryMetricsEngine";
import type { SignatureFeature } from "@/types/proprietary-intelligence";

export class SignatureFeaturesEngine {
  static features(): SignatureFeature[] {
    const metrics = ProprietaryMetricsEngine.metrics();
    const byKind = (k: string) => metrics.find((m) => m.kind === k);

    return [
      {
        id: "sig-liq-radar",
        name: "UNIFIED LIQUIDITY RADAR",
        status: "active",
        primaryMetric: "EQ-LSI",
        value: byKind("liquidity_stress")?.value ?? 0,
        description: "Cross-venue liquidity stress and fragmentation composite.",
      },
      {
        id: "sig-stress-monitor",
        name: "CRYPTO MARKET STRESS MONITOR",
        status: (byKind("volatility_regime")?.value ?? 0) > 70 ? "watch" : "active",
        primaryMetric: "EQ-VRI",
        value: byKind("volatility_regime")?.value ?? 0,
        description: "Regime + breadth + leverage saturation stress dashboard.",
      },
      {
        id: "sig-stable-map",
        name: "STABLECOIN SYSTEM MAP",
        status: "active",
        primaryMetric: "EQ-SCI",
        value: byKind("stablecoin_confidence")?.value ?? 0,
        description: "Stablecoin confidence and circulation system view.",
      },
      {
        id: "sig-narrative",
        name: "NARRATIVE ACCELERATION ENGINE",
        status: "active",
        primaryMetric: "EQ-NAR",
        value: byKind("narrative_acceleration")?.value ?? 0,
        description: "Sector narrative velocity and attention concentration.",
      },
      {
        id: "sig-exec-monitor",
        name: "INSTITUTIONAL EXECUTION MONITOR",
        status: "active",
        primaryMetric: "EQ-EQI",
        value: byKind("execution_quality")?.value ?? 0,
        description: "Execution quality and slippage surveillance.",
      },
      {
        id: "sig-intel-graph",
        name: "CROSS-MARKET INTELLIGENCE GRAPH",
        status: "active",
        primaryMetric: "EQ-BRD",
        value: byKind("market_breadth")?.value ?? 0,
        description: "Entity-linked market intelligence graph (knowledge + events).",
      },
    ];
  }
}
