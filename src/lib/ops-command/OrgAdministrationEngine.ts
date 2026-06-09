import { EnterpriseOrchestrator } from "@/lib/enterprise/EnterpriseOrchestrator";
import { MultiTenantEngine } from "@/lib/enterprise/MultiTenantEngine";
import type { OpsDomainStatus, OrgAdminRow } from "@/types/ops-command";

export class OrgAdministrationEngine {
  static organizations(): OrgAdminRow[] {
    const ent = EnterpriseOrchestrator.snapshot();
    const tenants = MultiTenantEngine.partitions();

    const primary: OrgAdminRow = {
      id: ent.organization.tenantId,
      name: ent.organization.name,
      tier: ent.organization.tier,
      seats: ent.organization.memberCount,
      status: ent.reliability.uptimePct >= 99 ? "operational" : "degraded",
    };

    const extra = tenants.slice(1, 5).map((t) => ({
      id: t.tenantId,
      name: t.orgName,
      tier: t.isolationLevel,
      seats: t.deskCount * 4,
      status: (t.isolationLevel === "strict" ? "staged" : "operational") as OpsDomainStatus,
    }));

    return [primary, ...extra];
  }
}
