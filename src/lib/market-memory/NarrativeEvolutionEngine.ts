import { historicalEventArchive } from "@/lib/market-memory/historicalEventArchive";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { NarrativeEvolutionRow } from "@/types/market-memory";

export class NarrativeEvolutionEngine {
  static timeline(asset: string): NarrativeEvolutionRow[] {
    const atmosphere = useMarketAtmosphereStore.getState();
    const fromWire: NarrativeEvolutionRow[] = atmosphere.wire.slice(0, 8).map((w) => ({
      id: w.id,
      phase: w.direction,
      sector: w.coin,
      acceleration: w.acceleration,
      timestamp: w.timestamp,
    }));

    const fromArchive: NarrativeEvolutionRow[] = historicalEventArchive
      .forAsset(asset)
      .filter((e) => e.kind === "narrative_rotation")
      .slice(0, 6)
      .map((e) => ({
        id: e.id,
        phase: e.headline.slice(0, 32),
        sector: e.asset,
        acceleration: e.severity === "critical" ? 90 : e.severity === "watch" ? 60 : 30,
        timestamp: e.timestamp,
      }));

    const seeded: NarrativeEvolutionRow[] = [
      {
        id: "nar-etf",
        phase: "ETF flow narrative",
        sector: "BTC",
        acceleration: 72,
        timestamp: Date.now() - 86_400_000 * 30,
      },
      {
        id: "nar-l1",
        phase: "L1 rotation",
        sector: "SOL",
        acceleration: 58,
        timestamp: Date.now() - 86_400_000 * 14,
      },
    ];

    return [...fromWire, ...fromArchive, ...seeded]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 16);
  }
}
