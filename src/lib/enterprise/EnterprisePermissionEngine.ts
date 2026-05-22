import type { TeamRole } from "@/types/production-platform";
import type { EnterprisePermissionSet, EnterpriseRole } from "@/types/enterprise-operations";

const MATRIX: Record<EnterpriseRole, EnterprisePermissionSet> = {
  admin: {
    role: "admin",
    canManageOrg: true,
    canManageDesks: true,
    canPlaceOrders: true,
    canPublishResearch: true,
    canManageAlerts: true,
    canViewPortfolio: true,
    canViewAudit: true,
    canManageCompliance: true,
    canDeployInfra: true,
  },
  portfolio_manager: {
    role: "portfolio_manager",
    canManageOrg: false,
    canManageDesks: true,
    canPlaceOrders: true,
    canPublishResearch: true,
    canManageAlerts: true,
    canViewPortfolio: true,
    canViewAudit: true,
    canManageCompliance: false,
    canDeployInfra: false,
  },
  trader: {
    role: "trader",
    canManageOrg: false,
    canManageDesks: false,
    canPlaceOrders: true,
    canPublishResearch: false,
    canManageAlerts: true,
    canViewPortfolio: true,
    canViewAudit: false,
    canManageCompliance: false,
    canDeployInfra: false,
  },
  analyst: {
    role: "analyst",
    canManageOrg: false,
    canManageDesks: false,
    canPlaceOrders: false,
    canPublishResearch: true,
    canManageAlerts: true,
    canViewPortfolio: true,
    canViewAudit: false,
    canManageCompliance: false,
    canDeployInfra: false,
  },
  researcher: {
    role: "researcher",
    canManageOrg: false,
    canManageDesks: false,
    canPlaceOrders: false,
    canPublishResearch: true,
    canManageAlerts: false,
    canViewPortfolio: false,
    canViewAudit: false,
    canManageCompliance: false,
    canDeployInfra: false,
  },
  read_only: {
    role: "read_only",
    canManageOrg: false,
    canManageDesks: false,
    canPlaceOrders: false,
    canPublishResearch: false,
    canManageAlerts: false,
    canViewPortfolio: true,
    canViewAudit: false,
    canManageCompliance: false,
    canDeployInfra: false,
  },
  compliance: {
    role: "compliance",
    canManageOrg: false,
    canManageDesks: false,
    canPlaceOrders: false,
    canPublishResearch: false,
    canManageAlerts: false,
    canViewPortfolio: true,
    canViewAudit: true,
    canManageCompliance: true,
    canDeployInfra: false,
  },
  operations: {
    role: "operations",
    canManageOrg: true,
    canManageDesks: true,
    canPlaceOrders: false,
    canPublishResearch: false,
    canManageAlerts: true,
    canViewPortfolio: true,
    canViewAudit: true,
    canManageCompliance: false,
    canDeployInfra: true,
  },
};

export class EnterprisePermissionEngine {
  static fromPlatformRole(role: TeamRole | null, tier: string): EnterprisePermissionSet {
    if (tier !== "enterprise") return MATRIX.read_only;
    if (!role) return MATRIX.read_only;
    if (role === "admin") return MATRIX.admin;
    if (role === "trader") return MATRIX.trader;
    return MATRIX.analyst;
  }

  static resolve(
    role: TeamRole | null,
    tier: string,
    canManageTeam: boolean,
    canDeployInfra: boolean,
  ): EnterprisePermissionSet {
    const base = EnterprisePermissionEngine.fromPlatformRole(role, tier);
    if (canDeployInfra && base.role !== "admin") {
      return { ...MATRIX.operations, canManageOrg: canManageTeam };
    }
    if (canManageTeam && base.role === "trader") {
      return MATRIX.portfolio_manager;
    }
    return base;
  }
}
