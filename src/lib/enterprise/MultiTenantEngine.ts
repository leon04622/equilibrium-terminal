import { OrganizationWorkspaceEngine } from "@/lib/enterprise/OrganizationWorkspaceEngine";
import type { TenantPartition } from "@/types/enterprise-operations";

export class MultiTenantEngine {
  static partitions(): TenantPartition[] {
    const org = OrganizationWorkspaceEngine.organization();
    return [
      {
        tenantId: org.tenantId,
        orgName: org.name,
        isolationLevel: org.isolationLevel,
        deskCount: org.deskCount,
        dataBoundary: "tenant-scoped",
        syncRegion: "us-east-1",
      },
      {
        tenantId: "tenant-eq-sandbox",
        orgName: "EQ SANDBOX (ISOLATED)",
        isolationLevel: "strict",
        deskCount: 1,
        dataBoundary: "air-gapped",
        syncRegion: "local",
      },
    ];
  }
}
