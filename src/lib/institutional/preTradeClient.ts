import {
  PreTradeRiskLimitsEngine,
  type PreTradeOrderInput,
  type PreTradeRiskContext,
} from "@/lib/institutional/PreTradeRiskLimitsEngine";
import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { PreTradeRiskDecision, PreTradeRiskLimits } from "@/types/institutional-capabilities";

export function buildPreTradeContext(coin: string): PreTradeRiskContext {
  const risk = RiskEngine.metrics();
  const portfolio = UnifiedPortfolioEngine.snapshot();
  const accountValue = Math.max(useTerminalStore.getState().accountValue ?? 0, 1);
  const holding = portfolio.holdings.find((h) => h.asset.toUpperCase() === coin.toUpperCase());
  return {
    accountValue,
    leverageRatio: risk.leverageRatio,
    marginUtilizationPct: risk.marginUtilizationPct,
    coinNotionalUsd: holding?.notionalUsd ?? 0,
  };
}

export async function fetchServerPreTradeCheck(
  order: PreTradeOrderInput,
  limits: PreTradeRiskLimits,
  context: PreTradeRiskContext,
): Promise<PreTradeRiskDecision | null> {
  try {
    const res = await fetch("/api/security/pre-trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order, limits, context }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { decision?: PreTradeRiskDecision };
    return json.decision ?? null;
  } catch {
    return null;
  }
}

/** Client check first; server confirms when limits are enabled (best-effort). */
export async function evaluatePreTradeWithServer(
  order: PreTradeOrderInput,
  limits: PreTradeRiskLimits,
): Promise<PreTradeRiskDecision & { serverVerified: boolean }> {
  const client = PreTradeRiskLimitsEngine.evaluate(order, limits);
  if (!limits.enabled) {
    return { ...client, serverVerified: false };
  }

  const context = buildPreTradeContext(order.coin);
  const server = await fetchServerPreTradeCheck(order, limits, context);
  if (!server) {
    return { ...client, serverVerified: false };
  }

  const severity =
    client.severity === "block" || server.severity === "block"
      ? "block"
      : client.severity === "warn" || server.severity === "warn"
        ? "warn"
        : "ok";
  const reasons = Array.from(new Set([...client.reasons, ...server.reasons]));
  const allowed = client.allowed && server.allowed;

  return {
    allowed,
    severity,
    reasons,
    metrics: server.metrics,
    serverVerified: true,
  };
}
