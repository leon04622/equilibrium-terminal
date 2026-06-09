import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { ProductTierRow } from "@/types/global-infrastructure";

export class ProductTierStrategyEngine {
  static tiers(): ProductTierRow[] {
    const tier = useProductionConfigStore.getState().entitlements.tier;

    const tiers: ProductTierRow[] = [
      {
        id: "professional",
        label: "PROFESSIONAL",
        mappedSubscription: "desk",
        workflowDepth: 45,
        operationalCapability: 40,
        headline: "Solo pro trader — charts, intel, execution, surveillance",
      },
      {
        id: "desk",
        label: "DESK",
        mappedSubscription: "team",
        workflowDepth: 68,
        operationalCapability: 62,
        headline: "Crypto desk — team net, propintel, ecosystem OS",
      },
      {
        id: "institutional",
        label: "INSTITUTIONAL",
        mappedSubscription: "enterprise",
        workflowDepth: 85,
        operationalCapability: 80,
        headline: "Fund ops — enterprise, integrations, compliance surfaces",
      },
      {
        id: "enterprise_infrastructure",
        label: "ENTERPRISE INFRASTRUCTURE",
        mappedSubscription: "enterprise",
        workflowDepth: 98,
        operationalCapability: 95,
        headline: "Embeddable infra — APIs, white-label, global strategy",
      },
    ];

    const activeIdx =
      tier === "enterprise" ? 3 : tier === "team" ? 2 : tier === "desk" ? 1 : 0;

    return tiers.map((t, i) => ({
      ...t,
      workflowDepth: i <= activeIdx ? t.workflowDepth : Math.round(t.workflowDepth * 0.6),
      operationalCapability:
        i <= activeIdx ? t.operationalCapability : Math.round(t.operationalCapability * 0.5),
    }));
  }
}
