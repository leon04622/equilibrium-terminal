import { ComplianceAuditEngine } from "@/lib/enterprise/ComplianceAuditEngine";
import { OrganizationWorkspaceEngine } from "@/lib/enterprise/OrganizationWorkspaceEngine";
import type { ComplianceControl } from "@/types/crypto-ecosystem";

export class ComplianceGovernanceEngine {
  static controls(): ComplianceControl[] {
    const org = OrganizationWorkspaceEngine.organization();
    const audit = ComplianceAuditEngine.trail(org.tenantId, true);
    const now = Date.now();

    const fromAudit: ComplianceControl[] = audit.slice(0, 6).map((a) => ({
      id: `ctrl-${a.id}`,
      control: a.action,
      status: a.allowed ? "pass" : "fail",
      category: a.category === "execution" ? "governance" : "audit",
      lastCheckedAt: a.timestamp,
    }));

    const seeded: ComplianceControl[] = [
      {
        id: "ctrl-policy-01",
        control: "No autonomous order execution",
        status: "pass",
        category: "policy",
        lastCheckedAt: now,
      },
      {
        id: "ctrl-report-01",
        control: "Institutional reporting schedule",
        status: "pass",
        category: "reporting",
        lastCheckedAt: now - 86_400_000,
      },
      {
        id: "ctrl-gov-01",
        control: "Desk permission matrix enforced",
        status: org.isolationLevel === "strict" ? "pass" : "watch",
        category: "governance",
        lastCheckedAt: now - 3600_000,
      },
    ];

    return [...fromAudit, ...seeded];
  }
}
