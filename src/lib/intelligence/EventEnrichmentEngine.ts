import type { IntelligenceEvent } from "@/types/market-intelligence";

export class EventEnrichmentEngine {
  static enrich(events: IntelligenceEvent[]): IntelligenceEvent[] {
    const entityIndex = new Map<string, string[]>();
    for (const e of events) {
      for (const asset of e.affectedAssets) {
        const list = entityIndex.get(asset) ?? [];
        list.push(e.id);
        entityIndex.set(asset, list);
      }
    }

    return events.map((e) => {
      const related = new Set(e.relatedEntities);
      for (const asset of e.affectedAssets) {
        for (const id of entityIndex.get(asset) ?? []) {
          if (id !== e.id) related.add(id);
        }
      }
      if (e.category === "liquidation") related.add("volatility");
      if (e.category === "liquidity") related.add("spread");
      if (e.category === "funding") related.add("positioning");

      const detail =
        e.detail +
        (related.size > 2 ? ` · linked to ${related.size - e.relatedEntities.length} related signals` : "");

      return {
        ...e,
        relatedEntities: Array.from(related).slice(0, 8),
        detail,
        enriched: true,
        confidence: Math.min(0.98, e.confidence + (related.size > 3 ? 0.06 : 0.02)),
      };
    });
  }
}
