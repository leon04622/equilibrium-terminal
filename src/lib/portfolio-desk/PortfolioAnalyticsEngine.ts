import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { PortfolioHistoryEngine } from "@/lib/portfolio-desk/PortfolioHistoryEngine";
import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import type { PortfolioAnalytics } from "@/types/portfolio-risk-treasury";

export class PortfolioAnalyticsEngine {
  static metrics(): PortfolioAnalytics {
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const risk = RiskEngine.metrics();
    const history = PortfolioHistoryEngine.points();

    const unrealizedPnlUsd = portfolio.netPnlUsd;
    const realizedPnlUsd = history.length >= 2
      ? history[history.length - 1]!.netPnlUsd - history[0]!.netPnlUsd - unrealizedPnlUsd * 0.15
      : 0;
    const totalPnlUsd = unrealizedPnlUsd + realizedPnlUsd;

    let maxDrawdownPct = 0;
    if (history.length >= 2) {
      let peak = history[0]!.accountValueUsd;
      for (const pt of history) {
        peak = Math.max(peak, pt.accountValueUsd);
        const dd = peak > 0 ? ((peak - pt.accountValueUsd) / peak) * 100 : 0;
        maxDrawdownPct = Math.max(maxDrawdownPct, dd);
      }
    }

    const sharpeProxy = Math.max(
      0,
      Math.min(3, Math.round((totalPnlUsd / Math.max(portfolio.totalAumUsd, 1)) * 400) / 100),
    );
    const capitalEfficiencyScore = Math.max(
      0,
      Math.min(100, Math.round(100 - risk.marginUtilizationPct * 0.4 - risk.concentrationScore * 0.35)),
    );
    const exposureHeat = Math.min(100, Math.round(risk.volatilityExposureScore * 0.7 + risk.concentrationScore * 0.3));
    const riskAdjustedReturn =
      Math.round((totalPnlUsd / Math.max(portfolio.totalAumUsd, 1)) * 10_000) / 100 -
      risk.liquidationRiskScore * 0.05;

    return {
      realizedPnlUsd: Math.round(realizedPnlUsd),
      unrealizedPnlUsd: Math.round(unrealizedPnlUsd),
      totalPnlUsd: Math.round(totalPnlUsd),
      maxDrawdownPct: Math.round(maxDrawdownPct * 10) / 10,
      sharpeProxy,
      capitalEfficiencyScore,
      exposureHeat,
      riskAdjustedReturn: Math.round(riskAdjustedReturn * 10) / 10,
    };
  }
}
