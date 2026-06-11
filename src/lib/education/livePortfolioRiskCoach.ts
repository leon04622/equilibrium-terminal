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

export interface PrePortfolioItem {
  id: string;
  label: string;
  note: string;
}

function portfolioState(s: PortfolioDeskSnapshot | null): CoachState {
  if (!s) return "neutral";
  const conc = s.risk.concentrationScore;
  const corr = s.risk.correlationStress;
  const heat = s.analytics.exposureHeat;
  if (conc >= 75 || corr >= 75 || heat >= 80) return "danger";
  if (conc >= 55 || corr >= 55 || heat >= 60) return "warn";
  return "good";
}

export const LivePortfolioRiskCoach = {
  todayReadout(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Open the portfolio desk to read concentration, correlation, and exposure before adding any trade.";
    return `Concentration ${s.risk.concentrationScore} · correlation stress ${s.risk.correlationStress} · exposure heat ${s.analytics.exposureHeat} · ${s.portfolio.positionCount} positions. Your account is one portfolio.`;
  },

  concentrationAdvice(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Portfolio desk → RISK tab → concentration score.";
    const c = s.risk.concentrationScore;
    if (c >= 70) return `Concentration ${c} — portfolio is heavily tilted. Reduce size or rebalance before adding exposure.`;
    if (c >= 45) return `Concentration ${c} — monitor before stacking more into the same theme.`;
    return `Concentration ${c} — exposure is reasonably spread. Still check correlation before adding.`;
  },

  correlationAdvice(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Check correlation stress on the portfolio RISK tab.";
    const c = s.risk.correlationStress;
    if (c >= 65) return `Correlation stress ${c} — positions likely move together. Diversification is weak.`;
    return `Correlation stress ${c} — verify new trades do not duplicate existing directional bets.`;
  },

  exposureAdvice(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Portfolio desk → PNL tab → exposure heat.";
    const heat = s.analytics.exposureHeat;
    const bias = s.risk.directionalBias;
    if (heat >= 70) return `Exposure heat ${heat} · bias ${bias.toUpperCase()} — total book is stretched. Size down or hedge.`;
    return `Exposure heat ${heat} · directional bias ${bias.toUpperCase()} — check sector and market exposure before adding.`;
  },

  alertLine(s: PortfolioDeskSnapshot | null): string {
    if (!s) return "Before adding a trade: total exposure, correlation, size, drawdown room, capital allocation.";
    const conc = s.risk.concentrationScore;
    const corr = s.risk.correlationStress;
    if (conc >= 70) return "Portfolio concentration elevated — rebalance before adding size.";
    if (corr >= 65) return "Correlation risk increasing — new longs may duplicate existing exposure.";
    if (s.analytics.exposureHeat >= 70) return "Exposure becoming unbalanced — reduce or hedge before expanding.";
    return "Capital allocation remains healthy — still verify each new trade fits the portfolio.";
  },

  operatorCoach(s: PortfolioDeskSnapshot | null): CoachCard {
    const state = portfolioState(s);
    const alert = LivePortfolioRiskCoach.alertLine(s);
    return {
      state,
      liveNow: s
        ? `Conc ${s.risk.concentrationScore} · corr ${s.risk.correlationStress} · heat ${s.analytics.exposureHeat} · ${s.portfolio.positionCount} pos`
        : "Awaiting portfolio snapshot",
      lookHere: "Portfolio desk (concentration, correlation, exposure heat) · Positions table",
      whyItMatters: "A good trade idea can fail if it breaks portfolio balance. Operators manage total exposure — not isolated tickets.",
      whatToWatch: "Concentration, correlation stress, directional bias, and exposure heat before every add.",
      alertLine: alert,
    };
  },

  prePortfolioChecklist(): PrePortfolioItem[] {
    return [
      { id: "exposure", label: "Total exposure", note: "How much of the book is already at risk?" },
      { id: "correlation", label: "Correlation", note: "Does this trade move with what you already hold?" },
      { id: "size", label: "Position size", note: "Does this allocation fit conviction and conditions?" },
      { id: "drawdown", label: "Drawdown risk", note: "Can the portfolio absorb several losses at once?" },
      { id: "allocation", label: "Capital allocation", note: "Not every idea deserves the same size." },
    ];
  },
};
