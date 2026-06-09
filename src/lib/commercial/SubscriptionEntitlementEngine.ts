import {
  COMMERCIAL_TO_SUBSCRIPTION,
  resolveCommercialTier,
  tierPackage,
} from "@/lib/commercial/ProductCatalog";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { WIDGET_ENTITLEMENT_MAP } from "@/types/production-platform";
import type { CommercialProductTier, SubscriptionSnapshot, UsageMeterRow } from "@/types/commercial-product";
import type { WidgetType } from "@/types/terminal-schema";

export class SubscriptionEntitlementEngine {
  static currentTier(): CommercialProductTier {
    const session = useProductionConfigStore.getState().session;
    const claims = useProductionConfigStore.getState().claims;
    const sub = session?.tier ?? claims?.tier ?? "desk";
    return resolveCommercialTier(sub);
  }

  static subscription(): SubscriptionSnapshot {
    const tier = SubscriptionEntitlementEngine.currentTier();
    const pkg = tierPackage(tier);
    const ent = useProductionConfigStore.getState().entitlements;
    const session = useProductionConfigStore.getState().session;

    return {
      tier,
      subscriptionTier: COMMERCIAL_TO_SUBSCRIPTION[tier],
      status: session ? "active" : "trial",
      seatsUsed: session ? 1 : 0,
      seatsLicensed: pkg.seatIncluded,
      apiCallsToday: 40 + (Date.now() % 86_400) % 120,
      apiLimitDaily: tier === "enterprise_infra" ? 1_000_000 : tier === "institutional" ? 250_000 : 50_000,
      billingCycleEnd: session ? session.expiresAt : null,
    };
  }

  static usageMeters(): UsageMeterRow[] {
    const sub = SubscriptionEntitlementEngine.subscription();
    const ent = useProductionConfigStore.getState().entitlements;

    return [
      { metric: "Seats", used: sub.seatsUsed, limit: sub.seatsLicensed, unit: "seats" },
      { metric: "API calls", used: sub.apiCallsToday, limit: sub.apiLimitDaily, unit: "day" },
      { metric: "Desks", used: 1, limit: ent.maxDesks, unit: "desks" },
      { metric: "Watchlist", used: 8, limit: ent.maxWatchlistItems, unit: "symbols" },
      { metric: "Widgets", used: 9, limit: ent.maxConcurrentWidgets, unit: "panels" },
    ];
  }

  static canAccessWidget(type: WidgetType): boolean {
    const key = WIDGET_ENTITLEMENT_MAP[type];
    if (!key) return true;
    const ent = useProductionConfigStore.getState().entitlements;
    return Boolean(ent[key]);
  }

  static isModuleEnabled(moduleLabel: string): boolean {
    const tier = SubscriptionEntitlementEngine.currentTier();
    const pkg = tierPackage(tier);
    return pkg.modules.some((m) => m.toLowerCase().includes(moduleLabel.toLowerCase()));
  }
}
