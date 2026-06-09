import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { PortfolioTreasuryEngine } from "@/lib/enterprise/PortfolioTreasuryEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { RiskMetrics } from "@/types/portfolio-risk-treasury";

export class RiskEngine {
  static metrics(): RiskMetrics {
    const state = useTerminalStore.getState();
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const treasury = PortfolioTreasuryEngine.treasury();

    const accountValue = Math.max(state.accountValue ?? 0, 1);
    const marginUsed = state.webData?.margin?.totalMarginUsed ?? 0;
    const totalNtl = state.webData?.margin?.totalNtlPos ?? 0;

    const leverageRatio = Math.round((totalNtl / accountValue) * 100) / 100;
    const marginUtilizationPct = Math.min(100, Math.round((marginUsed / accountValue) * 100));

    const topPct = portfolio.holdings[0]?.pctPortfolio ?? 0;
    const concentrationScore = Math.min(100, Math.round(topPct * 2.2));

    const longNotional = state.positions
      .filter((p) => p.size > 0)
      .reduce((s, p) => s + Math.abs(p.size * p.markPrice), 0);
    const shortNotional = state.positions
      .filter((p) => p.size < 0)
      .reduce((s, p) => s + Math.abs(p.size * p.markPrice), 0);
    const directionalBias: RiskMetrics["directionalBias"] =
      longNotional > shortNotional * 1.15
        ? "long"
        : shortNotional > longNotional * 1.15
          ? "short"
          : "neutral";

    const lossStress = state.positions.reduce((s, p) => s + Math.min(0, p.unrealizedPnl), 0);
    const liquidationRiskScore = Math.min(
      100,
      Math.round(marginUtilizationPct * 0.55 + concentrationScore * 0.25 + Math.abs(lossStress / accountValue) * 100 * 0.2),
    );

    const collateralHealthScore = Math.max(0, 100 - liquidationRiskScore * 0.85 - marginUtilizationPct * 0.15);
    const stablecoinDependencyPct = treasury.stablecoinPct;
    const volatilityExposureScore = Math.min(
      100,
      Math.round(state.positions.length * 12 + leverageRatio * 18 + concentrationScore * 0.3),
    );
    const correlationStress = Math.min(100, Math.round(concentrationScore * 0.6 + volatilityExposureScore * 0.4));

    let riskTier: RiskMetrics["riskTier"] = "low";
    if (liquidationRiskScore >= 75 || marginUtilizationPct >= 85) riskTier = "critical";
    else if (liquidationRiskScore >= 55 || marginUtilizationPct >= 65) riskTier = "elevated";
    else if (liquidationRiskScore >= 35 || marginUtilizationPct >= 45) riskTier = "moderate";

    return {
      leverageRatio,
      marginUtilizationPct,
      liquidationRiskScore,
      collateralHealthScore: Math.round(collateralHealthScore),
      concentrationScore,
      stablecoinDependencyPct,
      volatilityExposureScore,
      directionalBias,
      correlationStress,
      riskTier,
    };
  }
}
