import { ContextualEnrichmentEngine } from "@/lib/systemic-intelligence/ContextualEnrichmentEngine";
import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";

/** Phase 10 — AI-assisted organization of systemic context (human review required). */
export class AiContextualizationEngine {
  static summary(asset: string): string {
    const risk = SystemicRiskEngine.metrics(asset);
    const enrichments = ContextualEnrichmentEngine.enrich(asset);
    const snap = marketKnowledgeGraph.snapshot();
    const top = enrichments.sort((a, b) => b.systemicImportance - a.systemicImportance)[0];

    const parts = [
      `${asset} systemic tier ${risk.riskTier} · contagion ${risk.contagionRisk}.`,
      `Graph ${snap.entityCount} entities / ${snap.linkCount} links.`,
    ];

    if (top) {
      parts.push(
        `Top event context: ${top.relatedAssets.join(", ")} · ${top.dependencyContext}.`,
      );
    }

    parts.push("AI-organized relationship context — trader remains decision authority.");

    return parts.join(" ");
  }
}
