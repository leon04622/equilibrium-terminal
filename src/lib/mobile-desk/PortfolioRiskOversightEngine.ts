import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import type { PortfolioOversightRow } from "@/types/mobile-operational";

export class PortfolioRiskOversightEngine {
  static rows(asset: string): PortfolioOversightRow[] {
    const snap = PortfolioDeskOrchestrator.snapshot(asset);
    const risk = snap.risk;
    const treasury = snap.treasury;
    const portfolio = snap.portfolio;
    const collateral = snap.collateral;

    const liqStatus =
      collateral.liquidationProximityPct >= 75
        ? "critical"
        : collateral.liquidationProximityPct >= 45
          ? "watch"
          : "ok";

    return [
      {
        label: "Net exposure",
        value: `${portfolio.netExposureUsd >= 0 ? "+" : ""}$${Math.round(Math.abs(portfolio.netExposureUsd)).toLocaleString()}`,
        status: risk.leverageRatio > 4 ? "watch" : "ok",
      },
      {
        label: "Leverage",
        value: `${risk.leverageRatio.toFixed(2)}x`,
        status: risk.leverageRatio > 5 ? "critical" : risk.leverageRatio > 3 ? "watch" : "ok",
      },
      {
        label: "Liquidation proximity",
        value: `${collateral.liquidationProximityPct}%`,
        status: liqStatus,
      },
      {
        label: "Collateral health",
        value: `${risk.collateralHealthScore}/100`,
        status: risk.collateralHealthScore < 50 ? "critical" : risk.collateralHealthScore < 70 ? "watch" : "ok",
      },
      {
        label: "Treasury stablecoins",
        value: `$${Math.round(treasury.stablecoinBalanceUsd).toLocaleString()}`,
        status: treasury.flowVelocity === "stressed" ? "watch" : "ok",
      },
      {
        label: "Cross-venue",
        value: `${portfolio.venueCount} venues`,
        status: "ok",
      },
    ];
  }
}
