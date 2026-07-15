import { DailyBriefingEngine } from "@/lib/daily/DailyBriefingEngine";
import { MarketStateLayer } from "@/lib/daily/MarketStateLayer";
import { SessionClockEngine } from "@/lib/daily/SessionClockEngine";
import type { DailyBriefing } from "@/types/daily-operations";

export type BriefingOutlookTone = "calm" | "active" | "stressed" | "mixed";

export interface DailyBriefingOutlook {
  briefing: DailyBriefing;
  marketOutlook: { tone: BriefingOutlookTone; summary: string };
  riskOutlook: { level: "low" | "moderate" | "elevated" | "high"; summary: string };
  opportunityOutlook: { level: "limited" | "selective" | "favorable"; summary: string };
  guidance: string;
  recommendations: string[];
}

function marketTone(vol: string, liq: string): BriefingOutlookTone {
  if (vol === "extreme" || liq === "stressed") return "stressed";
  if (vol === "elevated" || liq === "thin") return "active";
  if (vol === "compressed" && liq === "deep") return "calm";
  return "mixed";
}

export const DailyBriefingOutlookEngine = {
  build(): DailyBriefingOutlook {
    const briefing = DailyBriefingEngine.build();
    const marketState = MarketStateLayer.build();
    const clock = SessionClockEngine.snapshot();

    const tone = marketTone(marketState.volatilityState, marketState.liquidityState);
    const marketSummary =
      tone === "calm"
        ? "Calm tape — planned execution and standard discipline supported."
        : tone === "active"
          ? "Active tape — volatility expanding; read faster and tighten risk."
          : tone === "stressed"
            ? "Stressed tape — defensive posture; protect capital first."
            : `Mixed tape — ${marketState.compositeLabel}`;

    const riskLevel =
      marketState.macroRiskLevel === "event" || marketState.volatilityState === "extreme"
        ? "high"
        : marketState.macroRiskLevel === "elevated" || briefing.alertPressure > 55
          ? "elevated"
          : marketState.macroRiskLevel === "moderate"
            ? "moderate"
            : "low";

    const riskSummary =
      riskLevel === "high"
        ? "Risk conditions elevated — macro events or stress dominate today's profile."
        : riskLevel === "elevated"
          ? "Elevated risk — widen confirmation and reduce size on new entries."
          : riskLevel === "moderate"
            ? "Moderate risk — standard preparation; watch for regime shifts."
            : "Risk contained — maintain awareness as sessions transition.";

    const oppLevel =
      tone === "calm" && riskLevel === "low"
        ? "favorable"
        : tone === "stressed" || riskLevel === "high"
          ? "limited"
          : "selective";

    const oppSummary =
      oppLevel === "favorable"
        ? "Favorable conditions for planned setups — not every day offers this profile."
        : oppLevel === "limited"
          ? "Limited opportunity — patience and capital preservation take priority."
          : "Selective opportunity — demand stronger confirmation before committing size.";

    const guidance =
      tone === "stressed"
        ? "Stand aside or reduce exposure until briefing pressure eases."
        : tone === "active"
          ? "Prepare faster reads; favor limits and defined risk on entries."
          : "Read briefing fully, align with market state, then build today's plan.";

    const recommendations = [
      `Session: ${clock.label} · ${clock.liquidityPhase} liquidity`,
      `Market: ${marketState.volatilityState.replace(/_/g, " ")} vol · ${marketState.liquidityState} liq`,
      `${briefing.macroEventsToday} macro events today · alert pressure ${briefing.alertPressure.toFixed(0)}`,
      briefing.bullets
        .filter((b) => b.severity === "watch" || b.severity === "critical")
        .slice(0, 2)
        .map((b) => b.headline)
        .join(" · ") || "No elevated bullet alerts — maintain standard prep.",
    ];

    return {
      briefing,
      marketOutlook: { tone, summary: marketSummary },
      riskOutlook: { level: riskLevel, summary: riskSummary },
      opportunityOutlook: { level: oppLevel, summary: oppSummary },
      guidance,
      recommendations,
    };
  },
};
