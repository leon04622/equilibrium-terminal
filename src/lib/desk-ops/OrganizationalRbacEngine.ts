import type { EnterpriseRole } from "@/types/enterprise-operations";
import type { OrgRoleRow } from "@/types/desk-operations";

const ROLES: Array<{ role: EnterpriseRole; label: string }> = [
  { role: "trader", label: "Trader" },
  { role: "analyst", label: "Analyst" },
  { role: "portfolio_manager", label: "Portfolio / PM" },
  { role: "researcher", label: "Researcher" },
  { role: "operations", label: "Operations" },
  { role: "compliance", label: "Compliance" },
  { role: "read_only", label: "Read-only" },
  { role: "admin", label: "Administrator" },
];

export class OrganizationalRbacEngine {
  static roles(): OrgRoleRow[] {
    return ROLES.map((r) => ({
      role: r.role,
      label: r.label,
      canTrade: r.role === "trader" || r.role === "portfolio_manager" || r.role === "admin",
      canResearch:
        r.role === "analyst" ||
        r.role === "researcher" ||
        r.role === "portfolio_manager" ||
        r.role === "admin",
      canAudit: r.role === "compliance" || r.role === "admin",
      canOps: r.role === "operations" || r.role === "admin",
    }));
  }
}
