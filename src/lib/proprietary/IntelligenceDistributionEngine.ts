import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { ProprietaryMetricsEngine } from "@/lib/proprietary/ProprietaryMetricsEngine";
import type { IntelligenceDistributionItem } from "@/types/proprietary-intelligence";

export class IntelligenceDistributionEngine {
  static items(): IntelligenceDistributionItem[] {
    const intel = IntelligenceOrchestrator.snapshot();
    const metrics = ProprietaryMetricsEngine.metrics();
    const lsi = metrics.find((m) => m.kind === "liquidity_stress");
    const now = Date.now();

    const items: IntelligenceDistributionItem[] = [
      {
        id: "dist-state-01",
        kind: "market_state",
        title: "EQ Market State Dashboard",
        summary: `${intel.marketState.compositeLabel} · EQ score ${intel.intelligenceScore}/100`,
        channels: ["terminal", "api", "embed"],
        publishedAt: now,
      },
      {
        id: "dist-vol-01",
        kind: "volatility",
        title: "Volatility Regime Monitor",
        summary: `Environment: ${intel.marketState.volatilityEnvironment} · EQ-VRI ${metrics.find((m) => m.kind === "volatility_regime")?.value ?? "—"}`,
        channels: ["api", "public"],
        publishedAt: now - 3600_000,
      },
      {
        id: "dist-liq-01",
        kind: "liquidity",
        title: "Liquidity Summary — Institutional",
        summary: `EQ-LSI ${lsi?.value ?? "—"} · ${intel.marketState.liquidityEnvironment} liquidity environment`,
        channels: ["email", "api", "enterprise"],
        publishedAt: now - 7200_000,
      },
      {
        id: "dist-eco-01",
        kind: "ecosystem",
        title: "Ecosystem Health Monitor",
        summary: `Breadth ${intel.marketState.marketBreadth} · Sentiment ${intel.marketState.sentimentState}`,
        channels: ["public", "embed"],
        publishedAt: now - 14_400_000,
      },
      {
        id: "dist-ops-01",
        kind: "operational",
        title: "Operational Market Briefing",
        summary: intel.aiBrief?.summary ?? "Desk operational briefing — regime and risk posture.",
        channels: ["enterprise", "collab", "newswire"],
        publishedAt: now - 1800_000,
      },
    ];

    return items.sort((a, b) => b.publishedAt - a.publishedAt);
  }
}
