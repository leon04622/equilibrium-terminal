import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import type { IntelSummaryRow } from "@/types/operator-ai";

export class IntelligenceSummarizationDeskEngine {
  static summaries(asset: string): IntelSummaryRow[] {
    const upper = asset.toUpperCase();
    const global = GlobalIntelOrchestrator.snapshot();
    const dist = InformationDistributionOrchestrator.snapshot();

    const fromGlobal = global.macroEvents.slice(0, 4).map((e) => ({
      id: e.id,
      category: e.category,
      headline: e.summary.slice(0, 48),
      severity: e.severity >= 70 ? "critical" : e.severity >= 45 ? "watch" : "info",
    }));

    const fromWire = dist.newswire
      .filter((n) => !upper || !n.coin || n.coin.toUpperCase() === upper)
      .slice(0, 6)
      .map((n) => ({
        id: n.id,
        category: n.category,
        headline: n.headline.slice(0, 48),
        severity: n.severity,
      }));

    return [...fromGlobal, ...fromWire].slice(0, 12);
  }
}
