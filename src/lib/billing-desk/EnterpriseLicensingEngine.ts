import { EnterpriseOrchestrator } from "@/lib/enterprise/EnterpriseOrchestrator";
import type { EnterpriseLicenseRow } from "@/types/billing-commercial";

export class EnterpriseLicensingEngine {
  static licenses(): EnterpriseLicenseRow[] {
    const ent = EnterpriseOrchestrator.snapshot();
    const now = Date.now();

    return [
      {
        id: "lic-primary",
        orgName: ent.organization.name,
        contractType: ent.organization.tier === "enterprise" ? "Enterprise MSA" : "Desk agreement",
        negotiatedUsd: ent.organization.tier === "enterprise" ? null : 1299,
        dedicatedInfra: ent.reliability.failoverReady,
        expiresAt: now + 365 * 86_400_000,
      },
      {
        id: "lic-infra",
        orgName: "STAGING — INFRA CUSTOMER",
        contractType: "Dedicated infrastructure",
        negotiatedUsd: null,
        dedicatedInfra: true,
        expiresAt: now + 180 * 86_400_000,
      },
    ];
  }
}
