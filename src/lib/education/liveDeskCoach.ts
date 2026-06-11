import { LiveDeskClockEngine } from "@/lib/daily/LiveDeskClockEngine";
import type { DailyOperationsSnapshot } from "@/types/daily-operations";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface LDCoachContext {
  snap: DailyOperationsSnapshot | null;
  pulse: ReturnType<typeof LiveDeskClockEngine.pulse> | null;
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
  region: "session" | "funding" | "desk-tone" | "market-state";
  note: string;
}

function coachState(ctx: LDCoachContext): CoachState {
  const ms = ctx.snap?.marketState;
  if (!ms) return "neutral";
  if (ms.volatilityState === "extreme") return "danger";
  if (ms.volatilityState === "elevated" || ms.liquidityState === "thin" || ms.liquidityState === "stressed") {
    return "warn";
  }
  if (ctx.pulse?.funding.urgent) return "warn";
  if (ms.volatilityState === "compressed" && ms.liquidityState === "deep") return "good";
  return "neutral";
}

export const LiveDeskCoach = {
  contextFromStore(snap: DailyOperationsSnapshot | null): LDCoachContext {
    if (!snap) return { snap: null, pulse: null };
    const pulse = LiveDeskClockEngine.pulse(snap.clock, snap.marketState);
    return { snap, pulse };
  },

  todayReadout(ctx: LDCoachContext): string {
    const { snap, pulse } = ctx;
    if (!snap || !pulse) return "Live Desk loads in the terminal header — session, funding, and desk tone in one strip.";
    return `${snap.clock.label} · FND ${pulse.funding.formatted} · ${pulse.deskTone}. Your real-time desk heartbeat.`;
  },

  sessionAdvice(ctx: LDCoachContext): string {
    const clock = ctx.snap?.clock;
    if (!clock) return "Session label shows which market hours are active — Asian, European, US, or overlap.";
    return `${clock.label} · liquidity ${clock.liquidityPhase} · next ${clock.nextTransitionLabel}. Behavior shifts at session transitions.`;
  },

  fundingAdvice(ctx: LDCoachContext): string {
    const f = ctx.pulse?.funding;
    if (!f) return "FND countdown — time to the next hourly funding window on Hyperliquid.";
    if (f.urgent) return `Funding window in ${f.formatted} — slow new entries, review carry exposure, watch for squeeze risk.`;
    return `Next funding in ${f.formatted} — carry accrues on the UTC hour.`;
  },

  sessionCountdownAdvice(ctx: LDCoachContext): string {
    const s = ctx.pulse?.nextSession;
    if (!s) return "Session countdown — time until the next session transition changes participation.";
    if (s.urgent) return `${s.label} transition in ${s.formatted} — liquidity and volatility often shift here.`;
    return `${s.label} in ${s.formatted} — plan behavior before the transition.`;
  },

  deskToneAdvice(ctx: LDCoachContext): string {
    const tone = ctx.pulse?.deskTone;
    if (!tone) return "Desk tone summarizes current conditions — CALM, ACTIVE, THIN, FUNDING WINDOW, or STRESS.";
    if (tone.includes("STRESS")) return "STRESS — defensive posture. Reduce size, widen stops, or stand aside.";
    if (tone.includes("THIN")) return "THIN — execution caution. Favor limits and smaller size.";
    if (tone.includes("FUNDING")) return "FUNDING WINDOW — watch carry and positioning near the hourly print.";
    if (tone.includes("ACTIVE")) return "ACTIVE — volatility expanding. Read faster and tighten risk.";
    return "CALM — normal conditions. Standard execution discipline applies.";
  },

  marketStateAdvice(ctx: LDCoachContext): string {
    const ms = ctx.snap?.marketState;
    if (!ms) return "Volatility, liquidity, and risk-on-off show current market state at a glance.";
    return `${ms.volatilityState.toUpperCase()} vol · ${ms.liquidityState.toUpperCase()} liq · ${ms.riskOnOff.toUpperCase()}. Context before every entry.`;
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Open terminal", region: "session", note: "Glance Live Desk strip in header" },
      { order: 2, label: "Check desk tone", region: "desk-tone", note: "Match behavior to CALM / ACTIVE / STRESS" },
      { order: 3, label: "Watch countdowns", region: "funding", note: "Funding window and session transition" },
      { order: 4, label: "Plan execution", region: "market-state", note: "Then trade with context" },
    ];
  },

  alertLine(ctx: LDCoachContext): string {
    const state = coachState(ctx);
    const pulse = ctx.pulse;
    if (state === "danger") return "Conditions unstable — STRESS posture. Reduce exposure before new entries.";
    if (pulse?.funding.urgent) return "Funding window nearing — review carry and slow aggressive entries.";
    if (pulse?.nextSession.urgent) return "Session transition approaching — liquidity conditions may shift.";
    if (state === "warn") return "Liquidity or volatility deteriorating — execution quality at risk.";
    if (state === "good") return "Conditions calm — maintain awareness throughout the session.";
    return "Glance Live Desk before every trade — context beats reaction.";
  },

  operatorCoach(ctx: LDCoachContext): CoachCard {
    const state = coachState(ctx);
    return {
      state,
      liveNow: this.todayReadout(ctx),
      lookHere: "Header strip → SESSION · VOL · LIQ · RISK · FND · DESK TONE.",
      whyItMatters: "Live Desk is Equilibrium Terminal's real-time awareness layer — unique to this platform.",
      whatToWatch: "Funding window · session transitions · desk tone shifts to STRESS or THIN.",
      alertLine: this.alertLine(ctx),
    };
  },
};
