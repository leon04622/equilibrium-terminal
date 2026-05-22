import { EnterprisePermissionEngine } from "@/lib/enterprise/EnterprisePermissionEngine";
import { OrganizationWorkspaceEngine } from "@/lib/enterprise/OrganizationWorkspaceEngine";
import { MultiDeskOperationsEngine } from "@/lib/enterprise/MultiDeskOperationsEngine";
import { PortfolioTreasuryEngine } from "@/lib/enterprise/PortfolioTreasuryEngine";
import { EnterpriseAlertGovernanceEngine } from "@/lib/enterprise/EnterpriseAlertGovernanceEngine";
import { ComplianceAuditEngine } from "@/lib/enterprise/ComplianceAuditEngine";
import { EnterpriseCommunicationEngine } from "@/lib/enterprise/EnterpriseCommunicationEngine";
import { OrganizationalKnowledgeEngine } from "@/lib/enterprise/OrganizationalKnowledgeEngine";
import { MultiTenantEngine } from "@/lib/enterprise/MultiTenantEngine";
import { EnterpriseReliabilityEngine } from "@/lib/enterprise/EnterpriseReliabilityEngine";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { EnterpriseOperationsSnapshot } from "@/types/enterprise-operations";

export class EnterpriseOrchestrator {
  static snapshot(): EnterpriseOperationsSnapshot {
    const prod = useProductionConfigStore.getState();
    const role = prod.primaryRole();
    const tier = prod.session?.tier ?? prod.entitlements.tier;
    const permissions = EnterprisePermissionEngine.resolve(
      role,
      tier,
      prod.can("manageTeam"),
      prod.can("deployInfra"),
    );

    const organization = OrganizationWorkspaceEngine.organization();
    const templates = OrganizationWorkspaceEngine.templates();
    const desks = MultiDeskOperationsEngine.desks();
    const portfolio = PortfolioTreasuryEngine.exposures();
    const treasury = PortfolioTreasuryEngine.treasury();
    const alertGovernance = EnterpriseAlertGovernanceEngine.rules();
    const auditTrail = ComplianceAuditEngine.trail(organization.tenantId, permissions.canViewAudit);
    const notices = EnterpriseCommunicationEngine.notices();
    const knowledge = OrganizationalKnowledgeEngine.playbooks();
    const tenants = MultiTenantEngine.partitions();
    const reliability = EnterpriseReliabilityEngine.state();

    const operationalScore = Math.round(
      Math.min(
        100,
        reliability.uptimePct * 0.3 +
          (reliability.failoverReady ? 15 : 0) +
          desks.filter((d) => d.status === "operational").length * 8 +
          (permissions.canViewAudit ? 10 : 0) +
          (tier === "enterprise" ? 20 : 0),
      ),
    );

    return {
      organization,
      templates,
      desks,
      permissions,
      portfolio,
      treasury,
      alertGovernance,
      auditTrail,
      notices,
      knowledge,
      tenants,
      reliability,
      operationalScore,
      updatedAt: Date.now(),
    };
  }
}
