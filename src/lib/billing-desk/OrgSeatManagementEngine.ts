import { EnterpriseOrchestrator } from "@/lib/enterprise/EnterpriseOrchestrator";
import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import type { BillingStatus, OrgSeatRow } from "@/types/billing-commercial";

export class OrgSeatManagementEngine {
  static organizations(): OrgSeatRow[] {
    const ent = EnterpriseOrchestrator.snapshot();
    const sub = SubscriptionEntitlementEngine.subscription();

    return [
      {
        orgId: ent.organization.tenantId,
        orgName: ent.organization.name,
        seatsUsed: sub.seatsUsed,
        seatsLicensed: sub.seatsLicensed,
        adminEmail: "ops@equilibrium.institutional",
        status: sub.status as BillingStatus,
      },
      {
        orgId: "org-sandbox",
        orgName: "EQ SANDBOX DESK",
        seatsUsed: 2,
        seatsLicensed: 8,
        adminEmail: "sandbox@equilibrium.institutional",
        status: "trial",
      },
    ];
  }
}
