import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { WEDGE_ADVANCED_PANEL_IDS } from "@/lib/wedge/WedgeManifest";
import type { ProductIntelRow } from "@/types/ops-command";

export class ProductIntelligenceEngine {
  static metrics(): ProductIntelRow[] {
    const commercial = CommercialOrchestrator.snapshot();

    return [
      {
        metric: "Market readiness",
        value: String(commercial.marketReadinessScore),
        trend: commercial.marketReadinessScore >= 75 ? "up" : "flat",
      },
      {
        metric: "Advanced panels",
        value: String(WEDGE_ADVANCED_PANEL_IDS.size),
        trend: "up",
      },
      {
        metric: "Onboarding completion",
        value: `${Math.round((commercial.onboarding.filter((s) => s.completed).length / Math.max(1, commercial.onboarding.length)) * 100)}%`,
        trend: "up",
      },
      {
        metric: "Workflow retention",
        value: commercial.analytics.retentionSignal,
        trend: commercial.analytics.retentionSignal === "strong" ? "up" : "flat",
      },
      {
        metric: "Feature adoption",
        value: `${commercial.analytics.featureAdoptionScore}/100`,
        trend: commercial.analytics.featureAdoptionScore >= 60 ? "up" : "flat",
      },
    ];
  }
}
