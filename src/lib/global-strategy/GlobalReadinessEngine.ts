import { CryptoEcosystemOrchestrator } from "@/lib/ecosystem/CryptoEcosystemOrchestrator";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { GlobalReadinessRow } from "@/types/global-infrastructure";

export class GlobalReadinessEngine {
  static domains(): GlobalReadinessRow[] {
    const eco = CryptoEcosystemOrchestrator.snapshot();
    const tier = useProductionConfigStore.getState().entitlements.tier;

    return [
      {
        domain: "Enterprise Onboarding",
        readinessPct: tier === "enterprise" ? 72 : 35,
        status: tier === "enterprise" ? "preparing" : "gap",
      },
      {
        domain: "Institutional Support",
        readinessPct: tier === "enterprise" ? 78 : 42,
        status: tier === "enterprise" ? "preparing" : "gap",
      },
      {
        domain: "Global Scaling",
        readinessPct: Math.round(eco.operatingReadiness * 0.9),
        status: eco.operatingReadiness > 70 ? "ready" : "preparing",
      },
      {
        domain: "High-Volume Market Events",
        readinessPct: eco.ecosystemScore > 65 ? 74 : 48,
        status: "preparing",
      },
      {
        domain: "Operational Crisis Handling",
        readinessPct: 68,
        status: "preparing",
      },
      {
        domain: "Regulatory Adaptation",
        readinessPct: eco.compliance.filter((c) => c.status === "pass").length > 2 ? 62 : 40,
        status: "gap",
      },
    ];
  }
}
