import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { useEnterpriseOpsStore } from "@/store/useEnterpriseOpsStore";
import type { InstitutionalReport } from "@/types/industry-integrations";

export class InstitutionalReportingEngine {
  static reports(): InstitutionalReport[] {
    const now = Date.now();
    const intel = IntelligenceOrchestrator.snapshot();
    const enterprise = useEnterpriseOpsStore.getState().snapshot;

    const reports: InstitutionalReport[] = [
      {
        id: "rpt-portfolio-daily",
        kind: "portfolio",
        title: "Daily Portfolio Exposure Report",
        summary: enterprise
          ? `AUM ${(enterprise.treasury.totalAumUsd / 1_000_000).toFixed(1)}M · Net Δ tracked across ${enterprise.portfolio.length} assets`
          : "Portfolio exposure summary across connected venues",
        generatedAt: now - 3600_000,
        distributionChannels: ["email", "api", "embed"],
        status: "published",
      },
      {
        id: "rpt-intel-daily",
        kind: "intelligence",
        title: "Market Intelligence Brief",
        summary: `${intel.events.length} ranked events · EQ score ${intel.intelligenceScore}/100 · ${intel.marketState.compositeLabel}`,
        generatedAt: now - 7200_000,
        distributionChannels: ["newswire", "api", "webhook"],
        status: "published",
      },
      {
        id: "rpt-vol-weekly",
        kind: "volatility",
        title: "Weekly Volatility Report",
        summary: `Regime: ${intel.marketState.regime} · Vol environment: ${intel.marketState.volatilityEnvironment}`,
        generatedAt: now - 86_400_000,
        distributionChannels: ["api", "public"],
        status: "published",
      },
      {
        id: "rpt-liq-daily",
        kind: "liquidity",
        title: "Liquidity Conditions Report",
        summary: `Liquidity: ${intel.marketState.liquidityEnvironment} · Leverage: ${intel.marketState.leverageEnvironment}`,
        generatedAt: now - 14_400_000,
        distributionChannels: ["api", "embed"],
        status: "published",
      },
      {
        id: "rpt-treasury",
        kind: "treasury",
        title: "Treasury & Stablecoin Summary",
        summary: enterprise
          ? `Stablecoin allocation ${enterprise.treasury.stablecoinPct}% · Leverage ${enterprise.treasury.leverageRatio}x`
          : "Cross-exchange treasury visibility report",
        generatedAt: now - 43_200_000,
        distributionChannels: ["email", "api"],
        status: "scheduled",
      },
      {
        id: "rpt-ops-brief",
        kind: "operational_briefing",
        title: "Operational Market Briefing",
        summary: "Desk coordination, incident status, and execution routing summary",
        generatedAt: now - 1800_000,
        distributionChannels: ["newswire", "enterprise", "public"],
        status: "published",
      },
    ];

    return reports.sort((a, b) => b.generatedAt - a.generatedAt);
  }
}
