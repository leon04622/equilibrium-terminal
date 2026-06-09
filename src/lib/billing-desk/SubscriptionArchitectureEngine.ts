import { PRODUCT_TIERS } from "@/lib/commercial/ProductCatalog";
import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import type { BillingStatus, SubscriptionPlanRow } from "@/types/billing-commercial";

export class SubscriptionArchitectureEngine {
  static plans(): SubscriptionPlanRow[] {
    const sub = SubscriptionEntitlementEngine.subscription();
    const activeTier = sub.tier;

    return PRODUCT_TIERS.map((t) => ({
      id: t.id,
      label: t.label,
      monthlyUsd: t.monthlyUsd,
      seats: t.seatIncluded,
      billingCycle:
        t.id === "enterprise_infra" || t.id === "institutional"
          ? ("contract" as const)
          : ("monthly" as const),
      trialDays: t.id === "professional" ? 14 : 0,
      status: (t.id === activeTier ? sub.status : "active") as BillingStatus,
    }));
  }
}
