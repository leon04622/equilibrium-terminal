import type { DailyOperationsSnapshot, MarketConditionLayer } from "@/types/daily-operations";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface DOCoachContext {
  snap: DailyOperationsSnapshot | null;
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
  tab: "brief" | "state" | "session" | "ops" | "routines";
  note: string;
}

function coachState(ms: MarketConditionLayer | null): CoachState {
  if (!ms) return "neutral";
  if (ms.volatilityState === "extreme" || ms.liquidityState === "stressed" || ms.macroRiskLevel === "event") {
    return "danger";
  }
  if (ms.volatilityState === "elevated" || ms.liquidityState === "thin" || ms.macroRiskLevel === "elevated") {
    return "warn";
  }
  if (ms.volatilityState === "compressed" && ms.liquidityState === "deep") return "good";
  return "neutral";
}

function envPhrase(ms: MarketConditionLayer | null): string {
  if (!ms) return "conditions loading";
  if (ms.volatilityState === "compressed" && ms.liquidityState === "deep") return "Conditions are calm";
  if (ms.volatilityState === "elevated" || ms.volatilityState === "extreme") return "Volatility is expanding";
  if (ms.liquidityState === "thin" || ms.liquidityState === "stressed") return "Liquidity is poor";
  if (ms.macroRiskLevel === "elevated" || ms.macroRiskLevel === "event") return "Risk conditions elevated";
  return ms.compositeLabel || "Review market state";
}

export const LiveDailyOperationsCoach = {
  contextFromStore(snap: DailyOperationsSnapshot | null): DOCoachContext {
    return { snap };
  },

  todayReadout(ctx: DOCoachContext): string {
    const ms = ctx.snap?.marketState;
    const session = ctx.snap?.clock.label ?? "—";
    if (!ms) return "Open Daily Operations — your session briefing and market state load here.";
    return `${envPhrase(ms)} · Session ${session} · ${ms.compositeLabel}. Answer: what kind of day is today?`;
  },

  briefAdvice(ctx: DOCoachContext): string {
    const b = ctx.snap?.briefing;
    if (!b) return "Brief tab — headline and bullets summarize what matters before today's session.";
    return `${b.headline} · ${b.macroEventsToday} macro events · alert pressure ${b.alertPressure.toFixed(0)}. Read this before you scan for trades.`;
  },

  volatilityAdvice(ctx: DOCoachContext): string {
    const v = ctx.snap?.marketState.volatilityState;
    if (!v) return "State tab — volatility row shows compression, normal, elevated, or extreme.";
    if (v === "extreme" || v === "elevated") return `Volatility is ${v.replace(/_/g, " ")} — execution quality likely to deteriorate. Reduce size or wait.`;
    if (v === "compressed") return "Volatility compressed — breakouts may follow; still confirm before chasing.";
    return `Volatility ${v.replace(/_/g, " ")} — standard execution discipline applies.`;
  },

  liquidityAdvice(ctx: DOCoachContext): string {
    const l = ctx.snap?.marketState.liquidityState;
    if (!l) return "State tab — liquidity row shows depth across the session.";
    if (l === "stressed" || l === "thin") return `Liquidity ${l} — spreads widen and fills worsen. Favor limits and smaller size.`;
    return `Liquidity ${l} — book quality supports planned execution.`;
  },

  riskAdvice(ctx: DOCoachContext): string {
    const ms = ctx.snap?.marketState;
    if (!ms) return "State tab — macro risk and risk mode show whether conditions favor risk-on or risk-off behavior.";
    return `Risk mode ${ms.riskOnOff.replace(/_/g, " ")} · macro ${ms.macroRiskLevel} · funding ${ms.fundingEnvironment.replace(/_/g, " ")}.`;
  },

  sessionAdvice(ctx: DOCoachContext): string {
    const c = ctx.snap?.clock;
    if (!c) return "Session tab — clock and presets align your workflow to Asia, London, NY, or event sessions.";
    return `${c.label} · liquidity ${c.liquidityPhase} · next ${c.nextTransitionLabel}. Session context changes how you size and pace entries.`;
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Daily brief", tab: "brief", note: "What matters today?" },
      { order: 2, label: "Market state", tab: "state", note: "Volatility, liquidity, risk" },
      { order: 3, label: "Session clock", tab: "session", note: "Where are we in the day?" },
      { order: 4, label: "Personal ops", tab: "ops", note: "Checklist and alerts" },
      { order: 5, label: "Execution plan", tab: "routines", note: "Launch prep routine" },
    ];
  },

  alertLine(ctx: DOCoachContext): string {
    const ms = ctx.snap?.marketState ?? null;
    const state = coachState(ms);
    if (state === "danger") return "Dangerous day profile — minimize size until Daily Operations improves.";
    if (state === "warn") return "Elevated conditions — confirm execution quality before entries.";
    if (state === "good") return "Favorable environment — still follow your routine before trading.";
    return envPhrase(ms);
  },

  operatorCoach(ctx: DOCoachContext): CoachCard {
    const ms = ctx.snap?.marketState ?? null;
    const state = coachState(ms);
    return {
      state,
      liveNow: this.todayReadout(ctx),
      lookHere: "BRIEF tab → STATE tab → SESSION → MY OPS → ROUTINES.",
      whyItMatters: "Equilibrium Terminal is built for prepared operators — Daily Operations is the front door.",
      whatToWatch: "When volatility, liquidity, or risk labels change — your behavior should change.",
      alertLine: this.alertLine(ctx),
    };
  },
};
