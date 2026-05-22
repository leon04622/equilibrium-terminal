import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { SectorNarrativeRow } from "@/types/market-intelligence";

const SECTORS: Array<{ id: string; sector: string; keywords: string[]; coins: string[] }> = [
  { id: "l1", sector: "L1 ROTATION", keywords: ["l1", "ethereum", "solana"], coins: ["ETH", "SOL", "AVAX"] },
  { id: "meme", sector: "MEME ACTIVITY", keywords: ["meme", "dog", "pepe"], coins: ["DOGE", "PEPE", "WIF"] },
  { id: "ai", sector: "AI SECTOR", keywords: ["ai", "agent", "compute"], coins: ["FET", "RNDR", "TAO"] },
  { id: "stable", sector: "STABLECOIN ECOSYSTEM", keywords: ["usdt", "usdc", "stable"], coins: ["USDT", "USDC"] },
  { id: "etf", sector: "ETF NARRATIVE", keywords: ["etf", "flow", "institutional"], coins: ["BTC", "ETH"] },
  { id: "gov", sector: "GOVERNANCE", keywords: ["governance", "proposal", "vote"], coins: ["UNI", "AAVE"] },
];

export class NarrativeSectorEngine {
  static track(): SectorNarrativeRow[] {
    const atmosphere = useMarketAtmosphereStore.getState();
    const surveillance = useInformationDiscoveryStore.getState().surveillance;
    const baseVelocity = Math.abs(atmosphere.regime.narrativeAcceleration);

    return SECTORS.map((s) => {
      const headlineHits =
        surveillance?.headlines.filter((h) =>
          s.keywords.some((k) => h.headline.toLowerCase().includes(k)),
        ).length ?? 0;
      const velocity = Math.min(
        100,
        Math.round(baseVelocity * 0.4 + headlineHits * 22 + atmosphere.stress.velocityRatio * 12),
      );
      const direction: SectorNarrativeRow["direction"] =
        velocity > 65 ? "accelerating" : velocity > 35 ? "stable" : "fading";

      return {
        id: s.id,
        sector: s.sector,
        velocity,
        direction,
        leaders: s.coins,
        summary:
          direction === "accelerating"
            ? `Narrative velocity elevated · ${headlineHits} headline hits`
            : direction === "fading"
              ? "Rotation fading · monitor for next sector lead"
              : "Stable sector attention",
      };
    }).sort((a, b) => b.velocity - a.velocity);
  }
}
