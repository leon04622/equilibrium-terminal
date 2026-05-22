import { PlatformLayerEngine } from "@/lib/ecosystem/PlatformLayerEngine";
import { PortfolioOperatingEngine } from "@/lib/ecosystem/PortfolioOperatingEngine";
import { RiskSurveillanceEngine } from "@/lib/ecosystem/RiskSurveillanceEngine";
import { ExecutionAnalyticsEngine } from "@/lib/ecosystem/ExecutionAnalyticsEngine";
import { ResearchSuiteEngine } from "@/lib/ecosystem/ResearchSuiteEngine";
import { OperationalAutomationEngine } from "@/lib/ecosystem/OperationalAutomationEngine";
import { ComplianceGovernanceEngine } from "@/lib/ecosystem/ComplianceGovernanceEngine";
import { DeveloperEcosystemEngine } from "@/lib/ecosystem/DeveloperEcosystemEngine";
import { MarketMemoryEngine } from "@/lib/ecosystem/MarketMemoryEngine";
import type { CryptoEcosystemSnapshot } from "@/types/crypto-ecosystem";

export class CryptoEcosystemOrchestrator {
  static snapshot(): CryptoEcosystemSnapshot {
    const layers = PlatformLayerEngine.layers();
    const portfolio = PortfolioOperatingEngine.exposures();
    const treasury = PortfolioOperatingEngine.treasury();
    const { totalAumUsd, netPnlUsd } = PortfolioOperatingEngine.summary();
    const riskAlerts = RiskSurveillanceEngine.alerts();
    const executionAnalytics = ExecutionAnalyticsEngine.analytics();
    const researchSuite = ResearchSuiteEngine.items();
    const automations = OperationalAutomationEngine.tasks();
    const compliance = ComplianceGovernanceEngine.controls();
    const developerModules = DeveloperEcosystemEngine.modules();
    const marketMemory = MarketMemoryEngine.graph();

    const operationalLayers = layers.filter((l) => l.health === "operational").length;
    const ecosystemScore = Math.round(
      Math.min(
        100,
        operationalLayers * 14 +
          portfolio.length * 3 +
          (compliance.filter((c) => c.status === "pass").length / Math.max(compliance.length, 1)) * 25 +
          developerModules.filter((m) => m.status === "operational").length * 4,
      ),
    );

    const operatingReadiness = Math.round(
      Math.min(
        100,
        ecosystemScore * 0.5 +
          (automations.filter((a) => a.active && a.humanInLoop).length / automations.length) * 20 +
          (riskAlerts.filter((a) => a.severity !== "critical").length / Math.max(riskAlerts.length, 1)) * 15,
      ),
    );

    return {
      layers,
      portfolio,
      treasury,
      totalAumUsd,
      netPnlUsd,
      riskAlerts,
      executionAnalytics,
      researchSuite,
      automations,
      compliance,
      developerModules,
      marketMemory,
      ecosystemScore,
      operatingReadiness,
      updatedAt: Date.now(),
    };
  }
}
