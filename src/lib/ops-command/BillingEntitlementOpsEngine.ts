import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { BillingOpsRow } from "@/types/ops-command";

export class BillingEntitlementOpsEngine {
  static rows(): BillingOpsRow[] {
    const commercial = CommercialOrchestrator.snapshot();
    const prod = useProductionConfigStore.getState();
    const tier = prod.session?.tier ?? prod.entitlements.tier;

    return [
      {
        label: "Active plan",
        value: tier,
        status: "operational",
      },
      {
        label: "Market readiness",
        value: `${commercial.marketReadinessScore}/100`,
        status: commercial.marketReadinessScore >= 70 ? "operational" : "degraded",
      },
      {
        label: "Onboarding",
        value: `${commercial.onboarding.filter((s) => s.completed).length}/${commercial.onboarding.length} steps`,
        status: "operational",
      },
      {
        label: "API consumption",
        value: "Within quota",
        status: "operational",
      },
      {
        label: "Entitlements",
        value: [
          prod.entitlements.alphaLabEnabled && "alpha",
          prod.entitlements.enterpriseOpsEnabled && "enterprise",
          prod.entitlements.ecosystemEnabled && "ecosystem",
        ]
          .filter(Boolean)
          .join(", ") || "desk core",
        status: "operational",
      },
    ];
  }
}
