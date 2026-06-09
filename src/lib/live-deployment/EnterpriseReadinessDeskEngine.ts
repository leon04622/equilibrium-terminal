import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import type { EnterpriseReadinessRow } from "@/types/live-deployment";

export class EnterpriseReadinessDeskEngine {
  static assets(): EnterpriseReadinessRow[] {
    const commercial = CommercialOrchestrator.snapshot();
    const hard = HardeningOrchestrator.snapshot();

    return [
      {
        id: "ent-demo",
        asset: "institutional_demo",
        readiness: commercial.marketReadinessScore >= 75 ? "ready" : "prep",
      },
      {
        id: "ent-onboard",
        asset: "desk_onboarding",
        readiness:
          commercial.onboarding.filter((s) => s.required && s.completed).length >= 4
            ? "ready"
            : "in_progress",
      },
      {
        id: "ent-runbook",
        asset: "operational_runbooks",
        readiness: hard.launchApproved ? "ready" : "draft",
      },
      {
        id: "ent-compliance",
        asset: "compliance_prep",
        readiness: "staged",
      },
      {
        id: "ent-sales",
        asset: "enterprise_sales_infra",
        readiness: `R${commercial.marketReadinessScore}`,
      },
    ];
  }
}
