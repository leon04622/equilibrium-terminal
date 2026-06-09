import { MultiTenantEngine } from "@/lib/enterprise/MultiTenantEngine";
import type { TenantIsolationRow } from "@/types/desk-operations";

export class EnterpriseIsolationDeskEngine {
  static tenants(): TenantIsolationRow[] {
    return MultiTenantEngine.partitions().map((p) => ({
      tenantId: p.tenantId,
      orgName: p.orgName,
      isolation: p.isolationLevel,
      dataBoundary: p.dataBoundary,
      encrypted: p.isolationLevel === "strict",
    }));
  }
}
