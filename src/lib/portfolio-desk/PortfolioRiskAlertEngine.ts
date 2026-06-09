import { CollateralLiquidityEngine } from "@/lib/portfolio-desk/CollateralLiquidityEngine";
import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { TreasuryVisibilityEngine } from "@/lib/portfolio-desk/TreasuryVisibilityEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import type { PortfolioRiskAlert, PortfolioRiskAlertKind } from "@/types/portfolio-risk-treasury";

function alert(
  kind: PortfolioRiskAlertKind,
  severity: PortfolioRiskAlert["severity"],
  headline: string,
  detail: string,
): PortfolioRiskAlert {
  return {
    id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    severity,
    headline,
    detail,
    timestamp: Date.now(),
  };
}

export class PortfolioRiskAlertEngine {
  static evaluate(): PortfolioRiskAlert[] {
    const alerts: PortfolioRiskAlert[] = [];
    const risk = RiskEngine.metrics();
    const treasury = TreasuryVisibilityEngine.snapshot();
    const collateral = CollateralLiquidityEngine.metrics();
    const portfolio = UnifiedPortfolioEngine.snapshot();

    if (risk.liquidationRiskScore >= 60 || collateral.liquidationProximityPct >= 65) {
      alerts.push(
        alert(
          "liquidation_risk",
          risk.liquidationRiskScore >= 80 ? "critical" : "watch",
          "Liquidation proximity elevated",
          `Risk ${risk.liquidationRiskScore} · margin ${risk.marginUtilizationPct}%`,
        ),
      );
    }

    if (risk.leverageRatio >= 2.5) {
      alerts.push(
        alert(
          "leverage_spike",
          risk.leverageRatio >= 4 ? "critical" : "watch",
          "Leverage elevated",
          `Ratio ${risk.leverageRatio.toFixed(2)}x`,
        ),
      );
    }

    if (risk.collateralHealthScore < 45) {
      alerts.push(
        alert(
          "collateral_deterioration",
          risk.collateralHealthScore < 30 ? "critical" : "watch",
          "Collateral health deteriorating",
          `Health ${risk.collateralHealthScore} · util ${collateral.utilizationPct}%`,
        ),
      );
    }

    if (treasury.flowVelocity === "stressed" || treasury.stablecoinPct < 15) {
      alerts.push(
        alert(
          "treasury_imbalance",
          treasury.flowVelocity === "stressed" ? "critical" : "watch",
          "Treasury stress",
          `Stable ${treasury.stablecoinPct}% · flow ${treasury.flowVelocity}`,
        ),
      );
    }

    if (risk.stablecoinDependencyPct > 70) {
      alerts.push(
        alert(
          "stablecoin_risk",
          "watch",
          "Stablecoin concentration",
          `${risk.stablecoinDependencyPct}% portfolio stable exposure`,
        ),
      );
    }

    if (risk.concentrationScore >= 55) {
      alerts.push(
        alert(
          "concentration_risk",
          risk.concentrationScore >= 75 ? "critical" : "watch",
          "Exposure concentration",
          `Top holding ${portfolio.holdings[0]?.pctPortfolio ?? 0}% · score ${risk.concentrationScore}`,
        ),
      );
    }

    const hlPct = portfolio.holdings
      .filter((h) => h.venue === "Hyperliquid")
      .reduce((s, h) => s + h.pctPortfolio, 0);
    if (hlPct >= 65 && portfolio.venueCount <= 2) {
      alerts.push(
        alert(
          "venue_dependency",
          hlPct >= 80 ? "critical" : "watch",
          "Exchange dependency",
          `${hlPct.toFixed(0)}% on Hyperliquid`,
        ),
      );
    }

    return alerts.slice(0, 12);
  }
}
