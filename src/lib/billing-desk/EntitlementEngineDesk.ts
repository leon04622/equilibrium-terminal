import { tierPackage } from "@/lib/commercial/ProductCatalog";
import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { EntitlementMatrix } from "@/types/production-platform";
import type { EntitlementModuleRow } from "@/types/billing-commercial";
import type { WidgetType } from "@/types/terminal-schema";

const MODULE_DEFS: Array<{
  id: string;
  module: string;
  scope: EntitlementModuleRow["scope"];
  widget?: WidgetType;
  entitlementKey?: keyof EntitlementMatrix;
}> = [
  { id: "ent-exec", module: "HL Execution Desk", scope: "workspace" },
  { id: "ent-team", module: "Team Net / Collab", scope: "workspace", widget: "teamdesk", entitlementKey: "teamNetEnabled" },
  { id: "ent-alpha", module: "Alpha Lab", scope: "intel", widget: "alphalab", entitlementKey: "alphaLabEnabled" },
  { id: "ent-infra", module: "Infra Diagnostics", scope: "enterprise", widget: "infra", entitlementKey: "infraDiagnosticsEnabled" },
  { id: "ent-enterprise", module: "Enterprise Ops", scope: "enterprise", widget: "enterpriseops", entitlementKey: "enterpriseOpsEnabled" },
  { id: "ent-api", module: "Institutional API", scope: "api" },
  { id: "ent-intel", module: "Proprietary Intel", scope: "intel", widget: "propintel", entitlementKey: "proprietaryIntelEnabled" },
];

export class EntitlementEngineDesk {
  static modules(): EntitlementModuleRow[] {
    const tier = SubscriptionEntitlementEngine.currentTier();
    const pkg = tierPackage(tier);
    const ent = useProductionConfigStore.getState().entitlements;
    const sub = SubscriptionEntitlementEngine.subscription();

    return MODULE_DEFS.map((m) => {
      let enabled = pkg.modules.some((mod) =>
        m.module.toLowerCase().includes(mod.split(" ")[0]!.toLowerCase().slice(0, 4)),
      );
      if (m.entitlementKey) enabled = Boolean(ent[m.entitlementKey]);
      if (m.widget) enabled = SubscriptionEntitlementEngine.canAccessWidget(m.widget);
      if (m.id === "ent-exec") enabled = true;
      if (m.id === "ent-api") enabled = sub.apiLimitDaily > 10_000;
      return { id: m.id, module: m.module, enabled, scope: m.scope };
    });
  }
}
