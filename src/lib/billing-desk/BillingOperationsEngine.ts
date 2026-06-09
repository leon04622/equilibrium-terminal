import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import type { InvoiceRow } from "@/types/billing-commercial";

export class BillingOperationsEngine {
  static invoices(): InvoiceRow[] {
    const sub = SubscriptionEntitlementEngine.subscription();
    const now = Date.now();
    const cycleEnd = sub.billingCycleEnd ?? now + 30 * 86_400_000;

    const base: InvoiceRow[] = [
      {
        id: "inv-current",
        orgName: "EQUILIBRIUM INSTITUTIONAL",
        amountUsd: sub.tier === "professional" ? 299 : sub.tier === "desk" ? 1299 : 0,
        status: sub.status === "past_due" ? "failed" : "paid",
        dueAt: cycleEnd,
      },
      {
        id: "inv-prev",
        orgName: "EQUILIBRIUM INSTITUTIONAL",
        amountUsd: 299,
        status: "paid",
        dueAt: cycleEnd - 30 * 86_400_000,
      },
    ];

    if (sub.status === "past_due") {
      base.unshift({
        id: "inv-retry",
        orgName: "EQUILIBRIUM INSTITUTIONAL",
        amountUsd: 299,
        status: "open",
        dueAt: now + 3 * 86_400_000,
      });
    }

    return base;
  }
}
