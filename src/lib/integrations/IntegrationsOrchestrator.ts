import { ExchangeConnectivityEngine } from "@/lib/integrations/ExchangeConnectivityEngine";
import { DataPartnershipEngine } from "@/lib/integrations/DataPartnershipEngine";
import { ExecutionRoutingEngine } from "@/lib/integrations/ExecutionRoutingEngine";
import { ExternalApiEngine } from "@/lib/integrations/ExternalApiEngine";
import { EmbeddableInfrastructureEngine } from "@/lib/integrations/EmbeddableInfrastructureEngine";
import { InstitutionalReportingEngine } from "@/lib/integrations/InstitutionalReportingEngine";
import { WhiteLabelDeploymentEngine } from "@/lib/integrations/WhiteLabelDeploymentEngine";
import { PublicMarketPresenceEngine } from "@/lib/integrations/PublicMarketPresenceEngine";
import { ScalabilityReadinessEngine } from "@/lib/integrations/ScalabilityReadinessEngine";
import { IndustryTrustEngine } from "@/lib/integrations/IndustryTrustEngine";
import type { IndustryIntegrationsSnapshot } from "@/types/industry-integrations";

export class IntegrationsOrchestrator {
  static snapshot(): IndustryIntegrationsSnapshot {
    const exchanges = ExchangeConnectivityEngine.integrations();
    const dataPartnerships = DataPartnershipEngine.partnerships();
    const executionRoutes = ExecutionRoutingEngine.routes();
    const apiEndpoints = ExternalApiEngine.endpoints();
    const embeddables = EmbeddableInfrastructureEngine.widgets();
    const reports = InstitutionalReportingEngine.reports();
    const deployments = WhiteLabelDeploymentEngine.deployments();
    const publicBriefs = PublicMarketPresenceEngine.briefs();
    const scalability = ScalabilityReadinessEngine.vitals();
    const trust = IndustryTrustEngine.signals();

    const integrationScore = Math.round(
      Math.min(
        100,
        exchanges.filter((e) => e.status === "live").length * 5 +
          dataPartnerships.filter((p) => p.contractStatus === "active").length * 8 +
          executionRoutes.filter((r) => r.active).length * 10 +
          apiEndpoints.filter((a) => a.status === "live").length * 4 +
          embeddables.filter((e) => e.status === "live").length * 6 +
          trust.institutionalCredibilityScore * 0.25,
      ),
    );

    return {
      exchanges,
      dataPartnerships,
      executionRoutes,
      apiEndpoints,
      embeddables,
      reports,
      deployments,
      publicBriefs,
      scalability,
      trust,
      integrationScore,
      updatedAt: Date.now(),
    };
  }
}
