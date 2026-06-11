import type { PortfolioDeskSnapshot } from "@/types/portfolio-risk-treasury";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  alertLine: string;
}

export interface PreRiskItem {
  id: string;
  label: string;
  note: string;
}

function riskState(s: PortfolioDeskSnapshot | null): CoachState {
  if (!s) return "neutral";
  const tier = s.risk.riskTier;
  if (tier === "critical") return "danger";
  if (tier === "elevated" || tier === "moderate") return "warn";
  return "good";
}

export const LiveRiskManagementCoach = {
  todayReadout(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Open the portfolio desk and trade ticket to read live risk before every entry.";
    return `Risk tier ${s.risk.riskTier.toUpperCase()} · margin util ${s.risk.marginUtilizationPct}% · max drawdown ${s.analytics.maxDrawdownPct}%. Ask: how much can I lose on this trade?`;
  },

  sizingAdvice(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Set position size on the trade ticket before you submit.";
    const util = s.risk.marginUtilizationPct;
    if (util >= 75) return `Margin util is ${util}% — reduce size or stand aside. You are already exposed.`;
    if (util >= 50) return `Margin util ${util}% — size conservatively. Leave room for adverse moves.`;
    return `Margin util ${util}% — you have headroom, but still risk only 1–2% per trade.`;
  },

  stopAdvice(): string {
    return "Set a stop trigger on the ticket. Exit on your terms before a small loss becomes account damage.";
  },

  drawdownAdvice(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Check max drawdown on the portfolio PnL tab.";
    const dd = s.analytics.maxDrawdownPct;
    if (dd >= 30) return `Max drawdown ${dd}% — recovery is brutal. Reduce risk and protect remaining capital.`;
    if (dd >= 15) return `Drawdown ${dd}% — tighten size and stops until you stabilize.`;
    return `Drawdown ${dd}% — stay disciplined. Small risk per trade keeps recovery manageable.`;
  },

  alertLine(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Before entry: size, stop, and risk percent — then check portfolio risk.";
    const util = s.risk.marginUtilizationPct;
    const dd = s.analytics.maxDrawdownPct;
    if (util >= 80) return "Margin util critical — do not add size. Stand aside or reduce exposure.";
    if (dd >= 25) return "Drawdown elevated — cap risk at 1% per trade until you recover.";
    if (s.risk.leverageRatio >= 5) return "Leverage is high — smaller size and tighter stops required.";
    return "Conditions allow trading — still ask: how much can I lose, not how much can I make?";
  },

  operatorCoach(s: PortfolioDeskSnapshot | null): CoachCard {
    const state = riskState(s);
    const alert = LiveRiskManagementCoach.alertLine(s);
    return {
      state,
      liveNow: s
        ? `Tier ${s.risk.riskTier} · util ${s.risk.marginUtilizationPct}% · lev ${s.risk.leverageRatio}x · DD ${s.analytics.maxDrawdownPct}%`
        : "Awaiting portfolio snapshot",
      lookHere: "Ticket (size, stop, leverage) · Portfolio desk (risk tier, margin util, max drawdown)",
      whyItMatters: "Protecting capital is more important than finding entries. You cannot compound if you are out of the game.",
      whatToWatch: alert,
      alertLine: alert,
    };
  },

  preRiskChecklist(): PreRiskItem[] {
    return [
      { id: "size", label: "Position size", note: "Small size on the same bad trade loses less." },
      { id: "stop", label: "Stop loss", note: "Cap downside before emotion or liquidation takes over." },
      { id: "risk-pct", label: "Risk per trade", note: "Risk 1–2% of account — survive strings of losses." },
      { id: "rr", label: "Reward / risk", note: "Target 2:1+ so you can win less and still grow." },
      { id: "drawdown", label: "Drawdown", note: "Deep holes need disproportionate gains to recover." },
    ];
  },
};
