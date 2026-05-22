import { ExternalDistributionEngine } from "@/lib/distribution/ExternalDistributionEngine";
import { useInformationDistributionStore } from "@/store/useInformationDistributionStore";
import type { PublicMarketBrief } from "@/types/industry-integrations";

export class PublicMarketPresenceEngine {
  static briefs(): PublicMarketBrief[] {
    const newswire = useInformationDistributionStore.getState().snapshot?.newswire ?? [];
    const meta = ExternalDistributionEngine.meta(newswire);
    const now = Date.now();

    const fromWire: PublicMarketBrief[] = newswire.slice(0, 4).map((item) => ({
      id: `pub-${item.id}`,
      headline: item.headline,
      category:
        item.category === "macro"
          ? "commentary"
          : item.severity === "critical"
            ? "incident"
            : "briefing",
      severity: item.severity,
      publishedAt: item.timestamp,
      reachEstimate: Math.round(item.compositeScore * 120),
    }));

    const seeded: PublicMarketBrief[] = [
      {
        id: "pub-vol-01",
        headline: "Weekly volatility report published — elevated alt beta",
        category: "volatility",
        severity: "watch",
        publishedAt: now - 86_400_000,
        reachEstimate: 4200,
      },
      {
        id: "pub-eco-01",
        headline: "Equilibrium Terminal ecosystem — institutional API v1 live",
        category: "ecosystem",
        severity: "info",
        publishedAt: now - 172_800_000,
        reachEstimate: 8900,
      },
    ];

    void meta;
    return [...fromWire, ...seeded].sort((a, b) => b.publishedAt - a.publishedAt);
  }
}
