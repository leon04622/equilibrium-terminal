import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { NarrativePropagation } from "@/types/systemic-intelligence";

export class NarrativePropagationEngine {
  static analyze(asset: string): NarrativePropagation {
    const atmosphere = useMarketAtmosphereStore.getState();
    const narratives = marketKnowledgeGraph.findByKind("narrative");
    const assetNarratives = narratives.filter(
      (n) => n.coin?.toUpperCase() === asset.toUpperCase() || !n.coin,
    );

    const sectorSpread = Array.from(
      new Set(assetNarratives.map((n) => n.sector).filter((s): s is string => Boolean(s))),
    ).slice(0, 6);

    const activeNarratives = assetNarratives.slice(0, 8).map((n) => ({
      id: n.id,
      label: n.label,
      coins: n.coin ? [n.coin] : [],
    }));

    return {
      emergenceScore: Math.min(100, assetNarratives.length * 8),
      accelerationScore: Math.min(100, Math.round(atmosphere.regime.narrativeAcceleration * 100)),
      sectorSpread,
      sentimentVelocity: Math.min(100, Math.round(atmosphere.stress.velocityRatio * 40)),
      socialAmplification: Math.min(100, atmosphere.wire.length * 5),
      governanceInfluence: Math.min(
        100,
        atmosphere.wire.filter((w) => w.channel === "macro").length * 15,
      ),
      activeNarratives,
    };
  }
}
