import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { RelationshipEngine } from "@/lib/systemic-intelligence/RelationshipEngine";
import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { ContextualEnrichment } from "@/types/systemic-intelligence";

export class ContextualEnrichmentEngine {
  static enrich(asset: string): ContextualEnrichment[] {
    const intel = useTerminalStore.getState().intelligence.slice(0, 12);
    const risk = SystemicRiskEngine.metrics(asset);
    const rel = RelationshipEngine.metrics(asset);
    const center = `asset:${asset.toUpperCase()}`;
    const { entities } = marketKnowledgeGraph.getNeighbors(center, 1);

    return intel.map((item) => {
      const relatedAssets = [
        item.coin,
        ...entities.filter((e) => e.kind === "asset" && e.coin).map((e) => e.coin!),
      ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

      const relatedSectors = entities
        .filter((e) => e.sector)
        .map((e) => e.sector!)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 4);

      const relatedExchanges = entities
        .filter((e) => e.kind === "exchange" || e.kind === "derivatives_venue")
        .map((e) => e.label)
        .slice(0, 4);

      const systemicImportance = Math.min(
        100,
        Math.round(
          risk.contagionRisk * 0.4 +
            rel.macroSensitivity * 0.3 +
            (item.severity === "critical" ? 25 : item.severity === "watch" ? 12 : 0),
        ),
      );

      return {
        eventId: item.id,
        relatedAssets,
        relatedSectors,
        relatedExchanges,
        systemicImportance,
        dependencyContext: `Exchange dep ${rel.exchangeDependencyPct}% · stable ${rel.stablecoinLinkage}%`,
        historicalAnalog:
          item.severity === "critical" ? "2024-08 yen carry unwind analog (structure only)" : null,
      };
    });
  }
}
