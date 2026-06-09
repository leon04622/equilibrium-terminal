import { EnterpriseAlertGovernanceEngine } from "@/lib/enterprise/EnterpriseAlertGovernanceEngine";
import { TeamAlertEngine } from "@/lib/collaboration/TeamAlertEngine";
import type { OrgAlertRow } from "@/types/desk-operations";

export class OrganizationalAlertingEngine {
  static alerts(asset: string): OrgAlertRow[] {
    const upper = asset.toUpperCase();
    const team = TeamAlertEngine.alerts()
      .filter((a) => !upper || a.coin.toUpperCase() === upper)
      .map((a) => ({
        id: a.id,
        scope: a.scope,
        condition: a.condition,
        severity: a.severity,
        subscribers: a.subscriberCount,
      }));

    const ent = EnterpriseAlertGovernanceEngine.rules().slice(0, 4).map((r) => ({
      id: r.id,
      scope: r.scope,
      condition: r.name,
      severity: r.severity,
      subscribers: r.subscriberCount,
    }));

    return [...team, ...ent];
  }
}
