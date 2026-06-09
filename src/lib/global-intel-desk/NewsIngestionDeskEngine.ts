import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import type { NewsFeedRow } from "@/types/global-intelligence";

export class NewsIngestionDeskEngine {
  static feed(asset: string): NewsFeedRow[] {
    const upper = asset.toUpperCase();
    const snap = InformationDistributionOrchestrator.snapshot();
    return snap.newswire
      .filter((n) => !upper || !n.coin || n.coin.toUpperCase() === upper)
      .slice(0, 20)
      .map((n) => ({
        id: n.id,
        category: n.category,
        headline: n.headline,
        source: n.source,
        severity: n.severity,
        coin: n.coin,
        score: n.compositeScore,
      }));
  }
}
