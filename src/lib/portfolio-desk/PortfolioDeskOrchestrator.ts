import { CollateralLiquidityEngine } from "@/lib/portfolio-desk/CollateralLiquidityEngine";
import { CrossVenuePositionEngine } from "@/lib/portfolio-desk/CrossVenuePositionEngine";
import { PortfolioAnalyticsEngine } from "@/lib/portfolio-desk/PortfolioAnalyticsEngine";
import { PortfolioDeskTelemetry } from "@/lib/portfolio-desk/PortfolioDeskTelemetry";
import { PortfolioHistoryEngine } from "@/lib/portfolio-desk/PortfolioHistoryEngine";
import { PortfolioRiskAlertEngine } from "@/lib/portfolio-desk/PortfolioRiskAlertEngine";
import { PORTFOLIO_DASHBOARD_MODES } from "@/lib/portfolio-desk/PortfolioDashboardModes";
import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { TreasuryVisibilityEngine } from "@/lib/portfolio-desk/TreasuryVisibilityEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import type { PortfolioDashboardModeId, PortfolioDeskSnapshot } from "@/types/portfolio-risk-treasury";

const MODE_STORAGE = "eq-portfolio-mode-v1";

function readMode(): PortfolioDashboardModeId {
  if (typeof window === "undefined") return "portfolio_overview";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && PORTFOLIO_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as PortfolioDashboardModeId;
    }
  } catch {
    /* ignore */
  }
  return "portfolio_overview";
}

export class PortfolioDeskOrchestrator {
  static snapshot(asset: string): PortfolioDeskSnapshot {
    PortfolioDeskTelemetry.begin();
    PortfolioHistoryEngine.record();

    const portfolio = UnifiedPortfolioEngine.snapshot();
    const risk = RiskEngine.metrics();
    const treasury = TreasuryVisibilityEngine.snapshot();
    const analytics = PortfolioAnalyticsEngine.metrics();
    const collateral = CollateralLiquidityEngine.metrics();
    const crossVenue = CrossVenuePositionEngine.positions(asset);
    const alerts = PortfolioRiskAlertEngine.evaluate();
    const telemetry = PortfolioDeskTelemetry.snapshot();
    const history = PortfolioHistoryEngine.points();

    const portfolioHealthScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          risk.collateralHealthScore * 0.3 +
            analytics.capitalEfficiencyScore * 0.25 +
            (100 - risk.liquidationRiskScore) * 0.25 +
            telemetry.dataQualityScore * 0.1 +
            (100 - risk.concentrationScore) * 0.1,
        ),
      ),
    );

    return {
      asset,
      portfolio,
      risk,
      treasury,
      analytics,
      collateral,
      crossVenue,
      alerts,
      dashboardModes: PORTFOLIO_DASHBOARD_MODES,
      activeMode: readMode(),
      history,
      telemetry,
      portfolioHealthScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: PortfolioDashboardModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
