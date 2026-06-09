import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { MobileIntelRow } from "@/types/mobile-operational";

export class MobileIntelligenceFeedEngine {
  static feed(asset: string): MobileIntelRow[] {
    const upper = asset.toUpperCase();
    const dist = InformationDistributionOrchestrator.snapshot();
    const intel = useTerminalStore.getState().intelligence;

    const fromWire = dist.newswire.slice(0, 8).map((n) => ({
      id: n.id,
      headline: n.headline,
      category: n.category,
      severity: n.severity,
      coin: n.coin,
      timestamp: n.timestamp,
    }));

    const fromIntel = intel
      .filter((i) => !upper || i.coin?.toUpperCase() === upper)
      .slice(0, 4)
      .map((i) => ({
        id: i.id,
        headline: i.title,
        category: i.channel,
        severity: i.severity,
        coin: i.coin ?? null,
        timestamp: i.timestamp,
      }));

    return [...fromWire, ...fromIntel]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 12);
  }
}
