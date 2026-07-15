import { DailyBriefingOutlookEngine } from "@/lib/daily/DailyBriefingOutlookEngine";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface DBCoachContext {
  outlook: ReturnType<typeof DailyBriefingOutlookEngine.build>;
}

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  alertLine: string;
}

export interface WorkflowStep {
  order: number;
  label: string;
  region: "summary" | "market-outlook" | "risk-outlook" | "opportunity-outlook" | "guidance";
  note: string;
}

function coachState(ctx: DBCoachContext): CoachState {
  const tone = ctx.outlook.marketOutlook.tone;
  const risk = ctx.outlook.riskOutlook.level;
  if (tone === "stressed" || risk === "high") return "danger";
  if (tone === "active" || risk === "elevated") return "warn";
  if (tone === "calm" && risk === "low") return "good";
  return "neutral";
}

export const DailyBriefingCoach = {
  contextLive(): DBCoachContext {
    return { outlook: DailyBriefingOutlookEngine.build() };
  },

  todayReadout(ctx: DBCoachContext): string {
    const { briefing, marketOutlook } = ctx.outlook;
    return `Here's your briefing. ${briefing.headline} Tape looks ${marketOutlook.tone} with ${briefing.macroEventsToday} macro events on deck.`;
  },

  summaryAdvice(ctx: DBCoachContext): string {
    const b = ctx.outlook.briefing;
    return `${b.headline}. Alert pressure is ${b.alertPressure.toFixed(0)} with ${b.bullets.length} items loaded — start every session here.`;
  },

  marketOutlookAdvice(ctx: DBCoachContext): string {
    const m = ctx.outlook.marketOutlook;
    return `Tape is ${m.tone} today. ${m.summary}`;
  },

  riskOutlookAdvice(ctx: DBCoachContext): string {
    const r = ctx.outlook.riskOutlook;
    return `Risk is ${r.level}. ${r.summary}`;
  },

  opportunityOutlookAdvice(ctx: DBCoachContext): string {
    const o = ctx.outlook.opportunityOutlook;
    return `Opportunity looks ${o.level}. ${o.summary}`;
  },

  guidanceAdvice(ctx: DBCoachContext): string {
    return ctx.outlook.guidance;
  },

  recommendationsAdvice(ctx: DBCoachContext): string {
    return ctx.outlook.recommendations.join(". ");
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Read summary", region: "summary", note: "Headline and session context" },
      { order: 2, label: "Check market outlook", region: "market-outlook", note: "Calm · active · stressed" },
      { order: 3, label: "Review risk outlook", region: "risk-outlook", note: "What could hurt today" },
      { order: 4, label: "Scan opportunity", region: "opportunity-outlook", note: "Press or wait" },
      { order: 5, label: "Follow guidance", region: "guidance", note: "Then build plan and execute" },
    ];
  },

  alertLine(ctx: DBCoachContext): string {
    const tone = ctx.outlook.marketOutlook.tone;
    const risk = ctx.outlook.riskOutlook.level;
    if (tone === "stressed" || risk === "high") return "Risk conditions elevated — reduce exposure before new entries.";
    if (tone === "active") return "Volatility expected to expand — tighten risk and read faster.";
    if (ctx.outlook.opportunityOutlook.level === "limited") return "Today's environment favors patience.";
    if (ctx.outlook.briefing.bullets.some((b) => b.category === "liquidity")) return "Liquidity healthy — still confirm execution quality.";
    return "Market currently calm — maintain awareness as conditions evolve.";
  },

  operatorCoach(ctx: DBCoachContext): CoachCard {
    return {
      state: coachState(ctx),
      liveNow: this.todayReadout(ctx),
      lookHere: "DAILY BRIEFING → summary · market outlook · risk · opportunity · guidance.",
      whyItMatters: "The briefing answers what should I pay attention to today — before you hunt for trades.",
      whatToWatch: "When risk outlook rises or opportunity outlook falls — your preparation must change.",
      alertLine: this.alertLine(ctx),
    };
  },
};
