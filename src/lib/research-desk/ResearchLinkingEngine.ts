import { historicalEventArchive } from "@/lib/market-memory/historicalEventArchive";
import { useTerminalStore } from "@/store/terminalStore";
import { AnnotationInfrastructureEngine } from "@/lib/research-desk/AnnotationInfrastructureEngine";
import { ThesisTrackingEngine } from "@/lib/research-desk/ThesisTrackingEngine";
import type { ResearchLink } from "@/types/research-operating";

export class ResearchLinkingEngine {
  static links(asset: string): ResearchLink[] {
    const links: ResearchLink[] = [];
    const upper = asset.toUpperCase();

    for (const item of useTerminalStore.getState().intelligence.slice(0, 6)) {
      if (item.coin.toUpperCase() !== upper) continue;
      links.push({
        id: `link-intel-${item.id}`,
        sourceId: item.id,
        sourceKind: "intelligence",
        targetLabel: item.title.slice(0, 48),
        weight: item.severity === "critical" ? 0.9 : 0.6,
      });
    }

    for (const ev of historicalEventArchive.forAsset(asset).slice(0, 5)) {
      links.push({
        id: `link-hist-${ev.id}`,
        sourceId: ev.id,
        sourceKind: "historical_event",
        targetLabel: ev.headline,
        weight: ev.severity === "critical" ? 0.85 : 0.55,
      });
    }

    const thesis = ThesisTrackingEngine.theses(asset)[0];
    if (thesis) {
      links.push({
        id: `link-thesis-${thesis.id}`,
        sourceId: thesis.id,
        sourceKind: "narrative",
        targetLabel: thesis.thesis.slice(0, 48),
        weight: 0.75,
      });
    }

    const ann = AnnotationInfrastructureEngine.list(asset)[0];
    if (ann) {
      links.push({
        id: `link-ann-${ann.id}`,
        sourceId: ann.id,
        sourceKind: "liquidity",
        targetLabel: ann.label,
        weight: 0.5,
      });
    }

    return links.slice(0, 16);
  }
}
