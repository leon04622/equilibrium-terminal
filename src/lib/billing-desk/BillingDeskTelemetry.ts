import { ApiUsageMeteringEngine } from "@/lib/billing-desk/ApiUsageMeteringEngine";
import { BillingOperationsEngine } from "@/lib/billing-desk/BillingOperationsEngine";
import { OrgSeatManagementEngine } from "@/lib/billing-desk/OrgSeatManagementEngine";
import { SubscriptionArchitectureEngine } from "@/lib/billing-desk/SubscriptionArchitectureEngine";
import type { BillingDeskTelemetrySnapshot } from "@/types/billing-commercial";

let startedAt = 0;

export class BillingDeskTelemetry {
  static begin(): void {
    startedAt = performance.now();
  }

  static snapshot(): BillingDeskTelemetrySnapshot {
    const plans = SubscriptionArchitectureEngine.plans();
    const orgs = OrgSeatManagementEngine.organizations();
    const api = ApiUsageMeteringEngine.meters().find((m) => m.metric === "API calls");
    const invoices = BillingOperationsEngine.invoices();

    const seatUtilizationPct =
      orgs[0] && orgs[0].seatsLicensed > 0
        ? Math.round((orgs[0].seatsUsed / orgs[0].seatsLicensed) * 100)
        : 0;
    const apiUtilizationPct =
      api && api.limit > 0 ? Math.round((api.used / api.limit) * 100) : 0;
    const pastDueCount = plans.filter((p) => p.status === "past_due").length;
    const failedInvoices = invoices.filter((i) => i.status === "failed").length;

    const commercialScore = Math.min(
      100,
      Math.max(
        0,
        70 -
          pastDueCount * 15 -
          failedInvoices * 10 +
          (100 - apiUtilizationPct) * 0.1,
      ),
    );

    return {
      activeSubscriptions: plans.filter((p) => p.status === "active" || p.status === "enterprise_contract").length,
      pastDueCount: pastDueCount + failedInvoices,
      apiUtilizationPct,
      seatUtilizationPct,
      computeLatencyMs: Math.round(performance.now() - startedAt),
      commercialScore,
    };
  }
}
