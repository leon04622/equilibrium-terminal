import { ExchangeConnectivityEngine } from "@/lib/integrations/ExchangeConnectivityEngine";
import { DataPartnershipEngine } from "@/lib/integrations/DataPartnershipEngine";
import { ExternalApiEngine } from "@/lib/integrations/ExternalApiEngine";
import { EmbeddableInfrastructureEngine } from "@/lib/integrations/EmbeddableInfrastructureEngine";
import { ScalabilityReadinessEngine } from "@/lib/integrations/ScalabilityReadinessEngine";
import type { IndustryTrustSignals } from "@/types/industry-integrations";

export class IndustryTrustEngine {
  static signals(): IndustryTrustSignals {
    const exchanges = ExchangeConnectivityEngine.integrations();
    const partners = DataPartnershipEngine.partnerships();
    const apis = ExternalApiEngine.endpoints();
    const embeds = EmbeddableInfrastructureEngine.widgets();
    const scale = ScalabilityReadinessEngine.vitals();

    const liveCount = exchanges.filter((e) => e.status === "live").length;
    const liveApis = apis.filter((a) => a.status === "live").length;

    return {
      infrastructureGrade: scale.deploymentReady ? "mission_critical" : scale.uptimePct > 99 ? "production" : "development",
      institutionalCredibilityScore: Math.round(
        Math.min(
          100,
          liveCount * 6 +
            partners.filter((p) => p.contractStatus === "active").length * 10 +
            liveApis * 5 +
            embeds.filter((e) => e.status === "live").length * 8 +
            scale.uptimePct * 0.2,
        ),
      ),
      stressTestPassed: scale.redundancyActive,
      partnerCount: partners.length,
      apiUptimePct: scale.uptimePct,
      embedDeployments: embeds.filter((e) => e.status === "live" || e.status === "connected").length,
    };
  }
}
