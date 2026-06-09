import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { ScalingPhaseRow } from "@/types/global-infrastructure";

export class ScalingArchitectureEngine {
  static phases(): ScalingPhaseRow[] {
    const tier = useProductionConfigStore.getState().entitlements.tier;

    const base: ScalingPhaseRow[] = [
      {
        segment: "active_traders",
        label: "Active Traders",
        phase: 1,
        readinessPct: 88,
        priority: "now",
      },
      {
        segment: "professional_traders",
        label: "Professional Traders",
        phase: 1,
        readinessPct: 82,
        priority: "now",
      },
      {
        segment: "crypto_teams",
        label: "Crypto Teams",
        phase: 2,
        readinessPct: tier !== "desk" ? 76 : 42,
        priority: tier !== "desk" ? "now" : "next",
      },
      {
        segment: "funds",
        label: "Funds",
        phase: 2,
        readinessPct: tier === "enterprise" ? 74 : 38,
        priority: "next",
      },
      {
        segment: "institutions",
        label: "Institutions",
        phase: 3,
        readinessPct: tier === "enterprise" ? 68 : 28,
        priority: "next",
      },
      {
        segment: "market_makers",
        label: "Market Makers",
        phase: 3,
        readinessPct: tier === "enterprise" ? 62 : 22,
        priority: "future",
      },
      {
        segment: "treasury_ops",
        label: "Treasury Operations",
        phase: 3,
        readinessPct: tier === "enterprise" ? 70 : 30,
        priority: "next",
      },
      {
        segment: "enterprise_orgs",
        label: "Enterprise Organizations",
        phase: 4,
        readinessPct: tier === "enterprise" ? 58 : 18,
        priority: "future",
      },
    ];

    return base;
  }
}
