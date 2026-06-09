import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import { ResearchSearchEngine } from "@/lib/research-desk/ResearchSearchEngine";
import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import type { RetrievalHitRow } from "@/types/operator-ai";

export class NaturalLanguageRetrievalEngine {
  static retrieve(asset: string, query: string): RetrievalHitRow[] {
    const q = query.trim().toLowerCase();
    const hits: RetrievalHitRow[] = [];

    for (const h of ResearchSearchEngine.search(asset, q).slice(0, 5)) {
      hits.push({
        id: `res-${h.id}`,
        source: "research",
        snippet: `${h.title} — ${h.snippet}`,
        relevance: h.score,
      });
    }

    const memory = MarketMemoryOrchestrator.snapshot(asset);
    if (q.includes("regime") || q.includes("replay") || !q) {
      hits.push({
        id: "mem-regime",
        source: "market_memory",
        snippet: `Regime ${memory.currentRegime.label} · macro ${memory.currentRegime.macro}`,
        relevance: 70,
      });
    }

    const global = GlobalIntelOrchestrator.snapshot();
    for (const e of global.macroEvents.filter((ev) => !q || ev.summary.toLowerCase().includes(q)).slice(0, 4)) {
      hits.push({
        id: e.id,
        source: "global_intel",
        snippet: e.summary.slice(0, 90),
        relevance: e.severity,
      });
    }

    const dist = InformationDistributionOrchestrator.snapshot();
    for (const n of dist.newswire
      .filter((w) => !q || w.headline.toLowerCase().includes(q) || w.detail.toLowerCase().includes(q))
      .slice(0, 4)) {
      hits.push({
        id: `wire-${n.id}`,
        source: "newswire",
        snippet: n.headline,
        relevance: n.compositeScore,
      });
    }

    return hits.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }
}
