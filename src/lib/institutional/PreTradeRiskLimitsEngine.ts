import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { MarginCallEngine } from "@/lib/institutional/MarginCallEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { PreTradeRiskDecision, PreTradeRiskLimits } from "@/types/institutional-capabilities";

export interface PreTradeOrderInput {
  coin: string;
  side: "buy" | "sell";
  size: number;
  markPx: number;
  leverage?: number;
  isPerp: boolean;
}

export interface PreTradeRiskContext {
  accountValue: number;
  leverageRatio: number;
  marginUtilizationPct: number;
  coinNotionalUsd: number;
}

export class PreTradeRiskLimitsEngine {
  static evaluate(
    order: PreTradeOrderInput,
    limits: PreTradeRiskLimits,
  ): PreTradeRiskDecision {
    const risk = RiskEngine.metrics();
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const accountValue = Math.max(useTerminalStore.getState().accountValue ?? 0, 1);
    const holding = portfolio.holdings.find(
      (h) => h.asset.toUpperCase() === order.coin.toUpperCase(),
    );
    return PreTradeRiskLimitsEngine.evaluateFromContext(order, limits, {
      accountValue,
      leverageRatio: risk.leverageRatio,
      marginUtilizationPct: risk.marginUtilizationPct,
      coinNotionalUsd: holding?.notionalUsd ?? 0,
    });
  }

  static evaluateFromContext(
    order: PreTradeOrderInput,
    limits: PreTradeRiskLimits,
    context: PreTradeRiskContext,
  ): PreTradeRiskDecision {
    const accountValue = Math.max(context.accountValue, 1);
    const orderNotionalUsd = order.size * order.markPx;
    const projectedLeverage = order.isPerp
      ? Math.max(context.leverageRatio, order.leverage ?? context.leverageRatio)
      : context.leverageRatio;
    const projectedCoinNotional = context.coinNotionalUsd + orderNotionalUsd;
    const concentrationPct = Math.min(
      100,
      Math.round((projectedCoinNotional / accountValue) * 100),
    );
    const projectedMarginUtil = Math.min(
      100,
      context.marginUtilizationPct + Math.round((orderNotionalUsd / accountValue) * 100 * 0.35),
    );

    const reasons: string[] = [];
    let severity: PreTradeRiskDecision["severity"] = "ok";

    if (!limits.enabled) {
      return {
        allowed: true,
        severity: "ok",
        reasons: [],
        metrics: {
          leverage: projectedLeverage,
          marginUtilPct: projectedMarginUtil,
          orderNotionalUsd,
          concentrationPct,
        },
      };
    }

    if (order.isPerp && projectedLeverage > limits.maxLeverage) {
      reasons.push(`Leverage ${projectedLeverage}x exceeds limit ${limits.maxLeverage}x`);
      severity = "block";
    }

    if (projectedMarginUtil > limits.maxMarginUtilPct) {
      reasons.push(
        `Projected margin util ${projectedMarginUtil}% exceeds ${limits.maxMarginUtilPct}%`,
      );
      severity = "block";
    }

    if (orderNotionalUsd > limits.maxNotionalPerCoinUsd) {
      reasons.push(
        `Order notional $${orderNotionalUsd.toFixed(0)} exceeds per-coin cap $${limits.maxNotionalPerCoinUsd.toLocaleString()}`,
      );
      severity = "block";
    }

    if (MarginCallEngine.wouldBreachMarginCall(projectedMarginUtil)) {
      reasons.push(
        `Projected margin util ${projectedMarginUtil}% approaches margin call zone`,
      );
      severity = severity === "block" ? "block" : "warn";
    }

    if (concentrationPct > limits.maxConcentrationPct) {
      reasons.push(
        `Concentration ${concentrationPct}% in ${order.coin} exceeds ${limits.maxConcentrationPct}%`,
      );
      severity = severity === "block" ? "block" : "warn";
    }

    const allowed = severity !== "block" || !limits.blockOnBreach;

    return {
      allowed,
      severity,
      reasons,
      metrics: {
        leverage: projectedLeverage,
        marginUtilPct: projectedMarginUtil,
        orderNotionalUsd,
        concentrationPct,
      },
    };
  }
}
