import type { DerivativesIntelligenceSnapshot } from "@/types/derivatives-intelligence";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  /** Phase 12 — what matters now */
  alertLine: string;
}

export interface PreRiskItem {
  id: string;
  label: string;
  note: string;
}

export const LiveLiquidationsCoach = {
  todayReadout(s: DerivativesIntelligenceSnapshot | null): string {
    if (!s) return "Open the derivatives desk to read liquidation pressure and leverage risk.";
    const liq = s.funding.liquidationPressureScore;
    const crowd = s.funding.crowdingBias;
    return `Liq pressure ${liq}/100 · crowding ${crowd.toUpperCase()} · leverage saturation ${s.marketState.leverageSaturation}. Ask: would I survive normal volatility?`;
  },

  liqPressure(s: DerivativesIntelligenceSnapshot | null): { state: CoachState; line: string } {
    if (!s) return { state: "neutral", line: "Liquidation pressure not loaded." };
    const score = s.funding.liquidationPressureScore;
    if (score >= 70)
      return {
        state: "danger",
        line: `Liquidation activity is increasing — pressure at ${score}. High leverage positions may be vulnerable.`,
      };
    if (score >= 45)
      return {
        state: "warn",
        line: `Liquidation pressure is moderate (${score}) — watch for forced exits on sharp moves.`,
      };
    return { state: "good", line: `Liquidation pressure is low (${score}) — fewer forced exits expected.` };
  },

  crowdingRisk(s: DerivativesIntelligenceSnapshot | null): string {
    if (!s) return "Crowding data unavailable.";
    if (s.funding.crowdingBias === "long")
      return "Crowding is elevated on the long side — a drop can trigger long liquidations and accelerate selling.";
    if (s.funding.crowdingBias === "short")
      return "Crowding is elevated on the short side — a rally can trigger short liquidations and accelerate buying.";
    return "Positioning looks relatively balanced — less one-sided cascade fuel.";
  },

  leverageRisk(s: DerivativesIntelligenceSnapshot | null): string {
    if (!s) return "Leverage metrics unavailable.";
    const sat = s.marketState.leverageSaturation;
    const conc = s.funding.leverageConcentration;
    if (sat >= 70 || conc >= 70)
      return `Leverage is saturated (sat ${sat}, conc ${conc}) — high leverage positions may be vulnerable.`;
    return `Leverage saturation ${sat} — know your liquidation distance before sizing up.`;
  },

  alertLine(s: DerivativesIntelligenceSnapshot | null): string {
    if (!s) return "Awaiting market data for liquidation conditions.";
    const liq = s.funding.liquidationPressureScore;
    const crowd = s.funding.crowdingBias;
    if (liq >= 70) return "Liquidation activity is increasing — reduce leverage and avoid crowded entries.";
    if (crowd !== "neutral" && liq >= 45)
      return `Crowding is elevated (${crowd.toUpperCase()}) — cascades are possible on adverse moves.`;
    if (s.marketState.leverageSaturation >= 65)
      return "Leverage saturation is high — smaller moves can force liquidations.";
    if (s.volatility.regime === "expansion" || s.volatility.regime === "stress")
      return "Volatility is elevated — liquidation distance is effectively shorter.";
    return "Conditions are moderate — still check leverage, stops, and liq distance before entry.";
  },

  operatorCoach(s: DerivativesIntelligenceSnapshot | null): CoachCard {
    const liq = LiveLiquidationsCoach.liqPressure(s);
    const alert = LiveLiquidationsCoach.alertLine(s);
    return {
      state: liq.state,
      liveNow: s
        ? `Liq ${s.funding.liquidationPressureScore} · ${s.funding.crowdingBias} crowd · lev sat ${s.marketState.leverageSaturation}`
        : "Awaiting derivatives snapshot",
      lookHere: "Ticket (leverage, size) · Derivatives desk (liq, crowding, vol) · Portfolio (liq proximity)",
      whyItMatters: "Liquidations are forced market orders — they move price and can cascade violently.",
      whatToWatch: alert,
      alertLine: alert,
    };
  },

  preRiskChecklist(): PreRiskItem[] {
    return [
      { id: "leverage", label: "Leverage", note: "Lower leverage = more room before forced exit." },
      { id: "stop", label: "Stop loss", note: "Exit on your terms before the exchange liquidates you." },
      { id: "liq-dist", label: "Liquidation distance", note: "Know how far price can move before margin runs out." },
      { id: "crowding", label: "Crowding", note: "Crowded positioning increases cascade risk." },
      { id: "volatility", label: "Volatility", note: "High vol shrinks effective liquidation distance." },
    ];
  },
};
