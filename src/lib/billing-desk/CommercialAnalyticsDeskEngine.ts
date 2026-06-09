import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import type { CommercialMetricRow } from "@/types/billing-commercial";

export class CommercialAnalyticsDeskEngine {
  static metrics(): CommercialMetricRow[] {
    const commercial = CommercialOrchestrator.snapshot();
    const sub = SubscriptionEntitlementEngine.subscription();
    const seatPct =
      sub.seatsLicensed > 0 ? Math.round((sub.seatsUsed / sub.seatsLicensed) * 100) : 0;
    const apiPct =
      sub.apiLimitDaily > 0 ? Math.round((sub.apiCallsToday / sub.apiLimitDaily) * 100) : 0;

    return [
      {
        metric: "Retention signal",
        value: commercial.analytics.retentionSignal,
        signal: commercial.analytics.retentionSignal,
      },
      {
        metric: "Workspace depth",
        value: `${commercial.analytics.workspaceDepthScore}/100`,
        signal: commercial.analytics.workspaceDepthScore >= 70 ? "strong" : "moderate",
      },
      {
        metric: "Feature adoption",
        value: `${commercial.analytics.featureAdoptionScore}/100`,
        signal: commercial.analytics.featureAdoptionScore >= 60 ? "strong" : "moderate",
      },
      {
        metric: "API consumption",
        value: `${apiPct}% of daily quota`,
        signal: apiPct >= 85 ? "at_risk" : apiPct >= 60 ? "moderate" : "strong",
      },
      {
        metric: "Seat growth",
        value: `${seatPct}% utilized`,
        signal: seatPct >= 90 ? "at_risk" : "strong",
      },
      {
        metric: "Sessions (7d)",
        value: String(commercial.analytics.sessions7d),
        signal: commercial.analytics.sessions7d >= 5 ? "strong" : "moderate",
      },
    ];
  }
}
