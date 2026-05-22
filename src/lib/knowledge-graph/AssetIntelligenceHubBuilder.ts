import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { MarketSurveillanceEngine } from "@/lib/discovery/MarketSurveillanceEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { AssetHubSection, AssetIntelligenceHub } from "@/types/market-knowledge-graph";

export class AssetIntelligenceHubBuilder {
  static build(coin: string): AssetIntelligenceHub {
    const upper = coin.toUpperCase();
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const execution = useExecutionIntelligenceStore.getState();
    const asset = terminal.assets.find((a) => a.coin === upper);
    const symbol = asset?.symbol ?? upper;
    const neighbors = marketKnowledgeGraph.getNeighbors(`asset:${upper}`, 2);
    const timeline = MarketSurveillanceEngine.buildTimeline(upper, 16);
    const book =
      terminal.book?.coin === upper ? terminal.book : null;
    const mid = terminal.mids.mids[upper] ?? book?.mid ?? null;

    const sections: AssetHubSection[] = [
      {
        id: "structure",
        title: "PRICE & STRUCTURE",
        items: [
          { label: "MID", value: mid != null ? String(mid) : "—" },
          {
            label: "SPREAD",
            value: book?.spreadBps != null ? `${book.spreadBps.toFixed(1)} bps` : "—",
            emphasis:
              (book?.spreadBps ?? 0) > 12 ? ("warn" as const) : ("neutral" as const),
          },
        ],
      },
      {
        id: "flow",
        title: "ORDER FLOW & LIQUIDITY",
        items: [
          { label: "BOOK SKEW", value: execution.imbalance.skew.toUpperCase() },
          {
            label: "EXEC PIPE",
            value: `${execution.executionConfidence}%`,
            emphasis: execution.executionConfidence < 45 ? "warn" : "neutral",
          },
          {
            label: "SLIP TIER",
            value: execution.slippage.riskTier.toUpperCase(),
            emphasis:
              execution.slippage.riskTier === "high" ||
              execution.slippage.riskTier === "critical"
                ? "warn"
                : "neutral",
          },
        ],
      },
      {
        id: "macro",
        title: "MACRO & REGIME",
        items: [
          { label: "REGIME", value: atmosphere.regime.regime },
          { label: "STRESS", value: String(Math.round(atmosphere.stress.score)) },
          {
            label: "NARR ACCEL",
            value: String(atmosphere.regime.narrativeAcceleration),
            emphasis:
              Math.abs(atmosphere.regime.narrativeAcceleration) > 30
                ? "warn"
                : "neutral",
          },
        ],
      },
    ];

    const related = neighbors.entities.filter((e) => e.id !== `asset:${upper}`);
    const narratives = related.filter((e) => e.kind === "narrative");
    const events = related.filter((e) => e.kind === "event" || e.kind === "intelligence");

    const aiSummary =
      `${symbol}: ${atmosphere.regime.regime} regime · book skew ${execution.imbalance.skew}. ` +
      `${narratives.length} narrative link(s), ${events.length} recent event(s). ` +
      `Human review required — informational context only.`;

    return {
      coin: upper,
      symbol,
      headline: `${symbol} INTELLIGENCE HUB`,
      sections,
      relatedEntities: related.slice(0, 12),
      timeline: timeline.map((t) => ({
        id: t.id,
        timestamp: t.timestamp,
        headline: t.headline,
        channel: t.channel,
      })),
      graphLinks: neighbors.links.slice(0, 24),
      aiSummary,
      updatedAt: Date.now(),
    };
  }
}
