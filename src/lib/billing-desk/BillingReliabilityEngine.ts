import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import type { BillingReliabilityRow } from "@/types/billing-commercial";

export class BillingReliabilityEngine {
  static rows(): BillingReliabilityRow[] {
    const sub = SubscriptionEntitlementEngine.subscription();

    return [
      {
        label: "Payment retry queue",
        value: sub.status === "past_due" ? "2 pending" : "idle",
        status: sub.status === "past_due" ? "critical" : "ok",
      },
      {
        label: "Entitlement cache",
        value: "synchronized",
        status: "ok",
      },
      {
        label: "Billing fault tolerance",
        value: "grace period active",
        status: "ok",
      },
      {
        label: "Stripe webhook",
        value: "staged",
        status: "watch",
      },
    ];
  }
}
