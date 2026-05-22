import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { CrossMarketInsight } from "@/types/market-knowledge-graph";

export class CrossMarketEngine {
  static analyze(): CrossMarketInsight[] {
    const atmosphere = useMarketAtmosphereStore.getState();
    const terminal = useTerminalStore.getState();
    const insights: CrossMarketInsight[] = [];
    const now = Date.now();

    const sectors = marketKnowledgeGraph.findByKind("sector");
    if (sectors.length > 0) {
      insights.push({
        id: "cm-sector",
        category: "sector_rotation",
        headline: "SECTOR CLUSTERS INDEXED",
        detail: `${sectors.length} sector nodes linked to assets — review graph for rotation.`,
        coins: [],
        priority: 55,
      });
    }

    const mids = terminal.mids.mids;
    const btc = mids.BTC;
    const eth = mids.ETH;
    if (btc && eth) {
      const ratio = eth / btc;
      insights.push({
        id: "cm-eth-btc",
        category: "btc_dominance",
        headline: "ETH/BTC RELATIVE",
        detail: `Synthetic ratio ${ratio.toFixed(6)} from mids snapshot`,
        coins: ["BTC", "ETH"],
        priority: 60,
      });
    }

    if (atmosphere.stress.velocityRatio > 1.3) {
      insights.push({
        id: "cm-liq-mig",
        category: "liquidity_migration",
        headline: "LIQUIDITY MIGRATION RISK",
        detail: `Velocity ${atmosphere.stress.velocityRatio.toFixed(2)}x — capital may be reallocating.`,
        coins: [terminal.selectedCoin],
        priority: 78,
      });
    }

    const narratives = marketKnowledgeGraph.findByKind("narrative").slice(0, 5);
    if (narratives.length >= 2) {
      insights.push({
        id: "cm-narr-spread",
        category: "narrative_spread",
        headline: "NARRATIVE SPREAD ACTIVE",
        detail: narratives.map((n) => n.label).join(" · "),
        coins: narratives.map((n) => n.coin).filter(Boolean) as string[],
        priority: 72,
      });
    }

    const topMacro = [...atmosphere.macro].sort(
      (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct),
    )[0];
    if (topMacro) {
      insights.push({
        id: "cm-macro",
        category: "macro_correlation",
        headline: `MACRO: ${topMacro.label}`,
        detail: `${topMacro.changePct >= 0 ? "+" : ""}${topMacro.changePct.toFixed(2)}% — cross-asset sensitivity`,
        coins: [],
        priority: 65,
      });
    }

    insights.push({
      id: "cm-exchange",
      category: "exchange_divergence",
      headline: "SINGLE-VENUE FOCUS",
      detail: "Hyperliquid-primary graph — multi-venue divergence feed planned (18b).",
      coins: [],
      priority: 40,
    });

    return insights.sort((a, b) => b.priority - a.priority);
  }
}
