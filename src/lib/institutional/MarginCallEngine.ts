import { CollateralLiquidityEngine } from "@/lib/portfolio-desk/CollateralLiquidityEngine";
import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  CollateralOptimizationHint,
  MarginCallPositionRow,
  MarginCallRiskBand,
  MarginCallSnapshot,
} from "@/types/institutional-capabilities";

function positionSeverity(bufferPct: number): MarginCallPositionRow["severity"] {
  if (bufferPct <= 15) return "critical";
  if (bufferPct <= 35) return "watch";
  return "ok";
}

function riskBand(
  marginUtilPct: number,
  liquidationProximityPct: number,
  distancePct: number,
): MarginCallRiskBand {
  if (marginUtilPct >= 88 || liquidationProximityPct >= 80 || distancePct <= 8) {
    return "imminent";
  }
  if (marginUtilPct >= 72 || liquidationProximityPct >= 55 || distancePct <= 18) {
    return "watch";
  }
  return "clear";
}

export class MarginCallEngine {
  static snapshot(): MarginCallSnapshot {
    const state = useTerminalStore.getState();
    const risk = RiskEngine.metrics();
    const collateral = CollateralLiquidityEngine.metrics();
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const accountValue = Math.max(state.accountValue ?? 0, 1);
    const marginUsed = state.webData?.margin?.totalMarginUsed ?? 0;

    const freeBufferUsd = Math.max(0, accountValue - marginUsed);
    const distanceToMarginCallPct =
      Math.round((freeBufferUsd / accountValue) * 1000) / 10;

    const marginCallRisk = riskBand(
      risk.marginUtilizationPct,
      collateral.liquidationProximityPct,
      distanceToMarginCallPct,
    );

    const positions: MarginCallPositionRow[] = state.positions
      .map((p) => {
        const notionalUsd = Math.abs(p.size * p.markPrice);
        const initialMargin = notionalUsd / Math.max(p.leverage, 1);
        const loss = Math.max(0, -p.unrealizedPnl);
        const bufferPct =
          initialMargin > 0
            ? Math.max(0, Math.round(((initialMargin - loss) / initialMargin) * 1000) / 10)
            : 100;

        return {
          coin: p.coin,
          notionalUsd: Math.round(notionalUsd),
          leverage: p.leverage,
          unrealizedPnlUsd: Math.round(p.unrealizedPnl * 100) / 100,
          bufferPct,
          severity: positionSeverity(bufferPct),
        };
      })
      .sort((a, b) => a.bufferPct - b.bufferPct);

    const hints: CollateralOptimizationHint[] = [];
    const top = portfolio.holdings[0];

    if (risk.marginUtilizationPct >= 70) {
      hints.push({
        id: "trim-or-collateral",
        action: "Trim exposure or add collateral",
        rationale: `Margin util ${risk.marginUtilizationPct}% — buffer ${distanceToMarginCallPct}%`,
        priority: risk.marginUtilizationPct >= 85 ? "high" : "medium",
      });
    }

    if (top && top.pctPortfolio >= 50 && risk.marginUtilizationPct >= 55) {
      hints.push({
        id: "concentration-trim",
        action: `Reduce ${top.asset} concentration`,
        rationale: `${top.pctPortfolio}% of book in one name with elevated util`,
        priority: top.pctPortfolio >= 65 ? "high" : "medium",
      });
    }

    const criticalPos = positions.find((p) => p.severity === "critical");
    if (criticalPos) {
      hints.push({
        id: `delever-${criticalPos.coin}`,
        action: `De-lever ${criticalPos.coin} (${criticalPos.leverage}x)`,
        rationale: `Buffer ${criticalPos.bufferPct}% to estimated margin call`,
        priority: "high",
      });
    }

    if (portfolio.withdrawableUsd < marginUsed * 0.12 && marginUsed > 0) {
      hints.push({
        id: "thin-operational-buffer",
        action: "Pause new risk — operational buffer thin",
        rationale: `Withdrawable $${Math.round(portfolio.withdrawableUsd)} vs margin $${Math.round(marginUsed)}`,
        priority: "high",
      });
    }

    if (hints.length === 0 && marginCallRisk === "clear") {
      hints.push({
        id: "clear",
        action: "Collateral headroom adequate",
        rationale: `Free buffer ${distanceToMarginCallPct}% · util ${risk.marginUtilizationPct}%`,
        priority: "low",
      });
    }

    return {
      accountValueUsd: accountValue,
      marginUtilPct: risk.marginUtilizationPct,
      withdrawableUsd: portfolio.withdrawableUsd,
      freeBufferUsd: Math.round(freeBufferUsd),
      distanceToMarginCallPct,
      marginCallRisk,
      positions,
      hints: hints.slice(0, 5),
      computedAt: Date.now(),
    };
  }

  static wouldBreachMarginCall(projectedMarginUtilPct: number): boolean {
    return projectedMarginUtilPct >= 82;
  }
}
