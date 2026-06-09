import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import { tierPackage } from "@/lib/commercial/ProductCatalog";

export class CommercialBriefEngine {
  static brief(): string {
    const sub = SubscriptionEntitlementEngine.subscription();
    const pkg = tierPackage(sub.tier);

    return [
      "Commercial infrastructure · monetization core",
      `Plan ${pkg.label} · ${sub.status} · ${sub.seatsUsed}/${sub.seatsLicensed} seats`,
      `API ${sub.apiCallsToday}/${sub.apiLimitDaily} today`,
      "Human trader central — entitlements gate modules, not judgment.",
    ].join("\n");
  }
}
