import type { CommercialProductTier, ProductTierPackage } from "@/types/commercial-product";
import type { SubscriptionTier } from "@/types/production-platform";

export const COMMERCIAL_TO_SUBSCRIPTION: Record<CommercialProductTier, SubscriptionTier> = {
  professional: "desk",
  desk: "team",
  institutional: "enterprise",
  enterprise_infra: "enterprise",
};

export const PRODUCT_TIERS: ProductTierPackage[] = [
  {
    id: "professional",
    label: "Professional",
    headline: "Solo operator · execution desk · core intelligence",
    subscriptionTier: "desk",
    monthlyUsd: 299,
    seatIncluded: 1,
    modules: ["HL Execution Desk", "L2 + Chart", "Alerts", "OmniBar", "Diagnostics"],
    positioning: "Independent traders and PMs requiring institutional workflow without team overhead.",
  },
  {
    id: "desk",
    label: "Desk",
    headline: "Multi-trader desk · collaboration · quant modules",
    subscriptionTier: "team",
    monthlyUsd: 1299,
    seatIncluded: 8,
    modules: ["Team Net", "Alpha Lab", "Infra Diagnostics", "Telemetry Export", "Proprietary Intel"],
    positioning: "Trading desks needing shared context, surveillance, and coordinated execution.",
  },
  {
    id: "institutional",
    label: "Institutional",
    headline: "Enterprise ops · integrations · global strategy",
    subscriptionTier: "enterprise",
    monthlyUsd: null,
    seatIncluded: 64,
    modules: ["Enterprise Ops", "Industry Integrations", "Ecosystem", "Global Strategy", "RBAC"],
    positioning: "Funds and market makers adopting Equilibrium as primary operating environment.",
  },
  {
    id: "enterprise_infra",
    label: "Enterprise Infrastructure",
    headline: "Dedicated deployment · SLA · custom regions",
    subscriptionTier: "enterprise",
    monthlyUsd: null,
    seatIncluded: 256,
    modules: ["Private regions", "Vault secrets", "Dedicated SRE", "Custom entitlements", "White-label"],
    positioning: "Organizations requiring isolated infrastructure and contractual operational guarantees.",
  },
];

export function tierPackage(id: CommercialProductTier): ProductTierPackage {
  return PRODUCT_TIERS.find((t) => t.id === id) ?? PRODUCT_TIERS[0];
}

export function resolveCommercialTier(
  subscriptionTier: SubscriptionTier | undefined,
): CommercialProductTier {
  if (subscriptionTier === "enterprise") return "institutional";
  if (subscriptionTier === "team") return "desk";
  return "professional";
}
