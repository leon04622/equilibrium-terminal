import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { CollateralLiquidityMetrics } from "@/types/portfolio-risk-treasury";

export class CollateralLiquidityEngine {
  static metrics(): CollateralLiquidityMetrics {
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const risk = RiskEngine.metrics();
    const state = useTerminalStore.getState();

    const marginUsed = state.webData?.margin?.totalMarginUsed ?? 0;
    const availableCollateralUsd = Math.max(0, portfolio.withdrawableUsd + portfolio.accountValueUsd - marginUsed);
    const utilizationPct = risk.marginUtilizationPct;
    const borrowingExposureUsd = Math.max(0, marginUsed - portfolio.withdrawableUsd);
    const fundingCostBps = Math.round(4 + risk.leverageRatio * 2.5);
    const liquidationProximityPct = Math.min(100, risk.liquidationRiskScore);

    const crossPositions = state.positions.filter((p) => p.marginType === "Cross").length;
    const crossMarginDependency = state.positions.length
      ? Math.round((crossPositions / state.positions.length) * 100)
      : 0;

    return {
      availableCollateralUsd,
      utilizationPct,
      marginHealthScore: risk.collateralHealthScore,
      borrowingExposureUsd,
      fundingCostBps,
      liquidationProximityPct,
      crossMarginDependency,
    };
  }
}
