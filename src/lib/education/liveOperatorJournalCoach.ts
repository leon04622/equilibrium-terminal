import type { OperatorJournalSnapshot } from "@/types/operator-journal";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface OJCoachContext {
  snap: OperatorJournalSnapshot | null;
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
  tab: "session" | "log" | "exec" | "behavior" | "review" | "patterns";
  note: string;
}

function coachState(snap: OperatorJournalSnapshot | null): CoachState {
  if (!snap) return "neutral";
  const flags = snap.behavioralFlags.length;
  const exec = snap.executionQuality.score;
  if (flags >= 2 || exec < 45) return "danger";
  if (flags >= 1 || exec < 60) return "warn";
  if (exec >= 75 && flags === 0) return "good";
  return "neutral";
}

export const LiveOperatorJournalCoach = {
  contextFromStore(snap: OperatorJournalSnapshot | null): OJCoachContext {
    return { snap };
  },

  todayReadout(ctx: OJCoachContext): string {
    const s = ctx.snap;
    if (!s) return "Open Operator Journal — your session scorecard and decision log load here.";
    const grade = s.scorecard.grade;
    const dec = s.session.decisionsCount;
    return `Session grade ${grade} · ${dec} decisions logged · execution ${s.scorecard.execution}. Your trading memory lives here.`;
  },

  sessionAdvice(ctx: OJCoachContext): string {
    const s = ctx.snap?.session;
    if (!s) return "Session tab — scorecard bars and live session stats track your desk day.";
    const mins = Math.round(s.durationMs / 60_000);
    return `${mins} minutes active · ${s.decisionsCount} decisions · regimes ${s.regimesParticipated.join(", ") || "building"}. End session to archive and trigger review.`;
  },

  logAdvice(ctx: OJCoachContext): string {
    const d = ctx.snap?.decisions[0];
    if (!d) return "Log tab — record entries, exits, adjustments, observations, and skipped trades with thesis and emotion.";
    return `Latest: ${d.kind.toUpperCase()} ${d.coin} · confidence ${d.confidence} · ${d.emotion}. ${d.thesis || "Add thesis next time — future you will thank you."}`;
  },

  execAdvice(ctx: OJCoachContext): string {
    const e = ctx.snap?.executionQuality;
    if (!e) return "Exec tab — chase rate, overtrading, and slippage bias score your fills.";
    if (e.score >= 75) return `Execution quality ${e.score} — disciplined fills. ${e.notes[0] ?? "Maintain patience."}`;
    return `Execution quality ${e.score} — chase ${Math.round(e.chaseRate * 100)}% · overtrade ${Math.round(e.overtradingPressure * 100)}%. Review before next entry.`;
  },

  behaviorAdvice(ctx: OJCoachContext): string {
    const flags = ctx.snap?.behavioralFlags ?? [];
    if (flags.length === 0) return "Behavior tab — no warnings. Disciplined operation detected.";
    const top = flags[0]!;
    return `${top.kind.replace(/_/g, " ")} flagged — ${top.message}`;
  },

  reviewAdvice(ctx: OJCoachContext): string {
    const r = ctx.snap?.review;
    if (!r) return "Review tab — debrief generates after you log decisions during the session.";
    return `Quality ${r.qualityScore} · best decision ${r.bestDecision?.kind ?? "—"} · weakest ${r.worstDecision?.kind ?? "—"}. Professionals review both.`;
  },

  patternsAdvice(ctx: OJCoachContext): string {
    const p = ctx.snap?.patterns ?? [];
    if (p.length === 0) return "Patterns tab — long-term strengths and weaknesses appear as you log more sessions.";
    const top = p[0]!;
    return `${top.label} (${top.polarity}) · ${top.confidence}% confidence. ${top.detail}`;
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Before trading", tab: "session", note: "Open journal · check scorecard · set intent" },
      { order: 2, label: "During trading", tab: "log", note: "Log every decision — including skips" },
      { order: 3, label: "After trading", tab: "review", note: "Review best/worst · read patterns" },
    ];
  },

  alertLine(ctx: OJCoachContext): string {
    const snap = ctx.snap;
    const state = coachState(snap);
    if (state === "danger") return "Decision quality deteriorating — pause and review Behavior + Exec tabs.";
    if (state === "warn") return "Overtrading or execution drift detected — log before next entry.";
    if (state === "good") return "Execution quality improving — keep logging decisions.";
    return "Log your next decision — the journal only helps if you use it.";
  },

  operatorCoach(ctx: OJCoachContext): CoachCard {
    const state = coachState(ctx.snap);
    return {
      state,
      liveNow: this.todayReadout(ctx),
      lookHere: "SESSION → LOG → EXEC → BEHAVIOR → REVIEW → PATTERNS.",
      whyItMatters: "Equilibrium Terminal's Operator Journal is your trading memory — unique to this platform.",
      whatToWatch: "Repeated mistakes in Patterns · behavioral flags before they compound.",
      alertLine: this.alertLine(ctx),
    };
  },
};
