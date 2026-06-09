import { SubscriptionEntitlementEngine } from "@/lib/commercial/SubscriptionEntitlementEngine";
import type { ApiMeterRow } from "@/types/billing-commercial";

export class ApiUsageMeteringEngine {
  static meters(): ApiMeterRow[] {
    const rows = SubscriptionEntitlementEngine.usageMeters();
    const api = rows.find((r) => r.metric === "API calls");

    return rows.map((r) => {
      const pct = r.limit > 0 ? (r.used / r.limit) * 100 : 0;
      const overageRisk =
        pct >= 90 ? ("critical" as const) : pct >= 70 ? ("watch" as const) : ("none" as const);
      return {
        metric: r.metric,
        used: r.used,
        limit: r.limit,
        unit: r.unit,
        overageRisk,
      };
    }).concat([
      {
        metric: "WebSocket streams",
        used: 2,
        limit: api && api.limit > 100_000 ? 12 : 4,
        unit: "connections",
        overageRisk: "none",
      },
      {
        metric: "Webhook deliveries",
        used: 18,
        limit: 500,
        unit: "day",
        overageRisk: "none",
      },
    ]);
  }
}
