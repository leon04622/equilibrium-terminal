import { AdminPlatformEngine } from "@/lib/commercial/AdminPlatformEngine";
import { CustomerOperationsEngine } from "@/lib/commercial/CustomerOperationsEngine";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { PRODUCT_TIERS, tierPackage } from "@/lib/commercial/ProductCatalog";
import { ProductAnalyticsEngine } from "@/lib/commercial/ProductAnalyticsEngine";
import { ReleaseManagementEngine } from "@/lib/commercial/ReleaseManagementEngine";
import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { useReliabilityStore } from "@/store/useReliabilityStore";
import type { CommercialProductSnapshot, WorkspaceTemplate } from "@/types/commercial-product";

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "hl-desk",
    label: "HL Execution Desk",
    description: "Default wedge — L2, chart, ticket, surveillance.",
    deskFocus: true,
    panelIds: ["hyperbook", "chart", "ticket", "positions", "alerts", "surveillance"],
  },
  {
    id: "full-terminal",
    label: "Full Terminal",
    description: "Expanded institutional workspace with ops modules.",
    deskFocus: false,
    panelIds: ["hyperbook", "chart", "reliability", "enterpriseops", "globalstrategy"],
  },
  {
    id: "research-desk",
    label: "Research Desk",
    description: "Coverage, journal, decision center — information-first.",
    deskFocus: false,
    panelIds: ["chart", "research", "decision", "marketcoverage", "intelengine"],
  },
];

export class CommercialOrchestrator {
  static snapshot(): CommercialProductSnapshot {
    const productTier = SubscriptionEntitlementEngine.currentTier();
    const subscription = SubscriptionEntitlementEngine.subscription();
    const analytics = ProductAnalyticsEngine.snapshot();
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const reliability = useReliabilityStore.getState().snapshot;

    const trustScore = Math.round(
      ((reliability?.trustScore ?? 90) + ops.operationalScore + analytics.featureAdoptionScore) / 3,
    );

    const marketReadinessScore = Math.round(
      (analytics.onboardingCompletionPct * 0.25 +
        analytics.featureAdoptionScore * 0.25 +
        trustScore * 0.3 +
        (ops.cicdStatus === "pass" ? 20 : 10)) *
        0.85,
    );

    return {
      productTier,
      subscription,
      tiers: PRODUCT_TIERS,
      onboarding: OnboardingEngine.steps(),
      usageMeters: SubscriptionEntitlementEngine.usageMeters(),
      templates: WORKSPACE_TEMPLATES,
      release: ReleaseManagementEngine.snapshot(),
      analytics,
      supportTickets: CustomerOperationsEngine.listTickets(),
      adminRows: AdminPlatformEngine.rows(),
      marketReadinessScore: Math.min(100, marketReadinessScore),
      trustScore,
      updatedAt: Date.now(),
    };
  }

  static currentPackage() {
    return tierPackage(SubscriptionEntitlementEngine.currentTier());
  }
}
