import type { PerpFundingAnalytics } from "@/types/derivatives-intelligence";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
}

export interface PreTradeItem {
  id: string;
  label: string;
  state: CoachState;
  note: string;
}

export type TradeEnvironment = "good" | "caution" | "avoid";

export const LiveFundingCoach = {
  hasFunding(f: PerpFundingAnalytics | null | undefined): f is PerpFundingAnalytics {
    return Boolean(f);
  },

  fundingRate(f: PerpFundingAnalytics | null): { state: CoachState; line: string } {
    if (!LiveFundingCoach.hasFunding(f)) {
      return { state: "neutral", line: "Funding rate isn't loaded yet." };
    }
    const bps = f.hlFundingBps;
    if (bps > 8)
      return {
        state: "danger",
        line: `Funding is strongly positive (${bps} bps) — longs are paying shorts heavily. Crowded long risk.`,
      };
    if (bps > 3)
      return {
        state: "warn",
        line: `Funding is positive (${bps} bps) — long traders pay short traders. Long side is crowded.`,
      };
    if (bps < -8)
      return {
        state: "danger",
        line: `Funding is strongly negative (${bps} bps) — shorts pay longs heavily. Crowded short / squeeze risk.`,
      };
    if (bps < -3)
      return {
        state: "warn",
        line: `Funding is negative (${bps} bps) — short traders pay long traders. Short side is crowded.`,
      };
    return {
      state: "good",
      line: `Funding is moderate (${bps} bps) — no extreme crowd pressure right now.`,
    };
  },

  crowding(f: PerpFundingAnalytics | null): { state: CoachState; line: string } {
    if (!LiveFundingCoach.hasFunding(f)) {
      return { state: "neutral", line: "Crowding data not available." };
    }
    if (f.crowdingBias === "long")
      return {
        state: "warn",
        line: "Positioning is crowded long — joining late increases squeeze risk on a pullback.",
      };
    if (f.crowdingBias === "short")
      return {
        state: "warn",
        line: "Positioning is crowded short — a rally can force short covering and accelerate price up.",
      };
    return { state: "good", line: "Positioning looks relatively balanced — no obvious one-sided crowd." };
  },

  squeezeRisk(f: PerpFundingAnalytics | null): { state: CoachState; line: string } {
    if (!LiveFundingCoach.hasFunding(f)) {
      return { state: "neutral", line: "Squeeze metrics not available." };
    }
    const score = f.liquidationPressureScore;
    if (score >= 70)
      return {
        state: "danger",
        line: `Liquidation pressure is elevated (${score}/100) — squeeze or cascade risk is high.`,
      };
    if (score >= 45)
      return {
        state: "warn",
        line: `Liquidation pressure is building (${score}/100) — watch for forced exits.`,
      };
    return { state: "good", line: `Liquidation pressure is moderate (${score}/100).` };
  },

  tradeEnvironment(f: PerpFundingAnalytics | null): TradeEnvironment {
    if (!LiveFundingCoach.hasFunding(f)) return "caution";
    const rate = LiveFundingCoach.fundingRate(f);
    const sq = LiveFundingCoach.squeezeRisk(f);
    if (rate.state === "danger" || sq.state === "danger") return "avoid";
    if (rate.state === "good" && sq.state === "good") return "good";
    return "caution";
  },

  todayReadout(f: PerpFundingAnalytics | null): string {
    if (!LiveFundingCoach.hasFunding(f)) return "Funding desk still loading — wait before using it to decide.";
    const rate = LiveFundingCoach.fundingRate(f);
    const crowd = LiveFundingCoach.crowding(f);
    const sq = LiveFundingCoach.squeezeRisk(f);
    return `${rate.line} ${crowd.line} ${sq.line}`;
  },

  operatorCoach(f: PerpFundingAnalytics | null): CoachCard {
    if (!LiveFundingCoach.hasFunding(f)) {
      return {
        state: "neutral",
        liveNow: "Funding data loading.",
        lookHere: "HL funding rate, crowding bias, and liquidation pressure on the FUNDING tab.",
        whyItMatters: "Funding tells you who is paying whom and whether positioning is crowded.",
        whatToWatch: "Wait for the derivatives desk to populate.",
      };
    }
    const rate = LiveFundingCoach.fundingRate(f);
    const crowd = LiveFundingCoach.crowding(f);
    const sq = LiveFundingCoach.squeezeRisk(f);
    const state: CoachState =
      rate.state === "danger" || sq.state === "danger"
        ? "danger"
        : rate.state === "warn" || crowd.state === "warn"
          ? "warn"
          : "good";
    return {
      state,
      liveNow: `${f.hlFundingBps > 0 ? "+" : ""}${f.hlFundingBps} bps · ${f.crowdingBias.toUpperCase()} crowd · liq ${f.liquidationPressureScore}`,
      lookHere: "FUNDING tab: rate, OI growth, crowding, liquidation pressure.",
      whyItMatters:
        rate.state === "danger" || rate.state === "warn"
          ? "Extreme funding means you're likely joining a crowded side — check before entering."
          : "Moderate funding — still check if you're joining the crowd late.",
      whatToWatch:
        sq.state === "danger"
          ? "Squeeze risk elevated — size down or wait."
          : f.crowdingBias === "long"
            ? "Crowded longs — watch for long squeeze on pullbacks."
            : f.crowdingBias === "short"
              ? "Crowded shorts — watch for short squeeze on rallies."
              : "Check OI growth — fast growth often means leverage building.",
    };
  },

  preTradeFundingCheck(f: PerpFundingAnalytics | null): PreTradeItem[] {
    const rate = LiveFundingCoach.fundingRate(f);
    const crowd = LiveFundingCoach.crowding(f);
    const sq = LiveFundingCoach.squeezeRisk(f);
    return [
      {
        id: "funding-extreme",
        label: "Is funding extreme?",
        state: rate.state === "danger" ? "danger" : rate.state,
        note: rate.line,
      },
      {
        id: "crowding",
        label: "Is positioning crowded?",
        state: crowd.state,
        note: crowd.line,
      },
      {
        id: "squeeze",
        label: "Is squeeze risk elevated?",
        state: sq.state,
        note: sq.line,
      },
      {
        id: "joining-late",
        label: "Am I joining the crowd late?",
        state:
          f && Math.abs(f.hlFundingBps) > 5 && f.crowdingBias !== "neutral" ? "warn" : "good",
        note:
          f && Math.abs(f.hlFundingBps) > 5
            ? "High funding + one-sided crowd — you may be late to the trade."
            : "No obvious late-crowd signal from funding alone.",
      },
    ];
  },
};
