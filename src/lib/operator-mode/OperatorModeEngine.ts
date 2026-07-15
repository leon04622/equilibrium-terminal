import type { OperatorProCapabilities } from "@/lib/operator-mode/operatorModePro";
import {
  visiblePhases,
  visibleReviewTaskIds,
  visibleTradingTaskIds,
} from "@/lib/operator-mode/operatorModePro";

/**
 * OPERATOR MODE — Lite (Day 1) + Pro (Academy-enhanced).
 * Lite: morning workflow only. Pro: progressive trading/review capabilities.
 */

export type OperatorPhase = "morning" | "trading" | "review";

export type MorningTaskId =
  | "daily-briefing"
  | "market-state"
  | "daily-operations"
  | "live-desk"
  | "execution-plan";

export type TradingTaskId =
  | "liquidity"
  | "spread"
  | "volatility"
  | "position-size"
  | "market-state";

export type ReviewTaskId =
  | "journal-updated"
  | "session-reviewed"
  | "mistakes-reviewed"
  | "lessons-recorded";

export interface OperatorTaskDef {
  id: string;
  label: string;
  detail: string;
  panelId?: string;
  phase: OperatorPhase;
}

export const MORNING_TASKS: OperatorTaskDef[] = [
  {
    id: "daily-briefing",
    label: "Read Daily Briefing",
    detail: "What deserves attention today — outlook, vol, liquidity, session.",
    panelId: "dailybriefing",
    phase: "morning",
  },
  {
    id: "market-state",
    label: "Check Market State",
    detail: "CALM · ACTIVE · THIN · STRESS — match behavior to conditions.",
    panelId: "marketstate",
    phase: "morning",
  },
  {
    id: "daily-operations",
    label: "Review Daily Operations",
    detail: "Morning routine — state, volatility, risk, session context.",
    panelId: "dailyops",
    phase: "morning",
  },
  {
    id: "live-desk",
    label: "Review Live Desk",
    detail: "Funding timer, session timer, desk tone — mission control glance.",
    panelId: "header-strip",
    phase: "morning",
  },
  {
    id: "execution-plan",
    label: "Create execution plan",
    detail: "Define entries, size, and stand-aside rules before clicking.",
    panelId: "ticket",
    phase: "morning",
  },
];

/** Fast path: briefing → market state → trade ticket (core morning loop). */
export const MORNING_TRADING_PATH_IDS: MorningTaskId[] = [
  "daily-briefing",
  "market-state",
  "execution-plan",
];

export const TRADING_TASKS: OperatorTaskDef[] = [
  {
    id: "liquidity",
    label: "Liquidity checked",
    detail: "Depth and book quality reviewed on Hyperbook.",
    panelId: "hyperbook",
    phase: "trading",
  },
  {
    id: "spread",
    label: "Spread checked",
    detail: "Spread acceptable for intended size and urgency.",
    panelId: "hyperbook",
    phase: "trading",
  },
  {
    id: "volatility",
    label: "Volatility checked",
    detail: "Vol regime acceptable — size adjusted if expanding.",
    panelId: "marketstate",
    phase: "trading",
  },
  {
    id: "position-size",
    label: "Position size checked",
    detail: "Risk per trade within plan — not impulse sizing.",
    panelId: "ticket",
    phase: "trading",
  },
  {
    id: "market-state",
    label: "Market state checked",
    detail: "Desk state still supports the intended entry.",
    panelId: "marketstate",
    phase: "trading",
  },
];

export const REVIEW_TASKS: OperatorTaskDef[] = [
  {
    id: "journal-updated",
    label: "Journal updated",
    detail: "Log decisions and context while memory is fresh.",
    panelId: "operatorjournal",
    phase: "review",
  },
  {
    id: "session-reviewed",
    label: "Session reviewed",
    detail: "What kind of desk day was this — regime and behavior.",
    panelId: "operatorjournal",
    phase: "review",
  },
  {
    id: "mistakes-reviewed",
    label: "Mistakes reviewed",
    detail: "Identify execution errors without self-judgment theater.",
    panelId: "operatorjournal",
    phase: "review",
  },
  {
    id: "lessons-recorded",
    label: "Lessons learned recorded",
    detail: "Compare today with Market Memory — one takeaway for tomorrow.",
    panelId: "memorydesk",
    phase: "review",
  },
];

const LITE_GUIDANCE: Record<string, string> = {
  "daily-briefing": "Review today's briefing.",
  "market-state": "Check current market state.",
  "daily-operations": "Review your daily operations routine.",
  "live-desk": "Review Live Desk — session and funding timers.",
  "execution-plan": "Create an execution plan before trading.",
};

const PRO_GUIDANCE: Record<string, string> = {
  "daily-briefing": "You have not reviewed today's briefing.",
  "market-state": "Market State not reviewed.",
  "daily-operations": "Daily Operations morning routine not complete.",
  "live-desk": "Live Desk not reviewed — check funding and session timers.",
  "execution-plan": "Execution plan not created — define entries before trading.",
  liquidity: "Liquidity conditions deteriorating — read the book before sizing.",
  spread: "Spread not checked — verify cost before entry.",
  volatility: "Volatility not checked — adjust size for conditions.",
  "position-size": "Position size not confirmed.",
  "market-state-trading": "Execution checklist incomplete — market state not re-checked.",
  "journal-updated": "Operator Journal not updated.",
  "session-reviewed": "Session review outstanding.",
  "mistakes-reviewed": "Mistakes not reviewed — close the loop.",
  "lessons-recorded": "Historical context not reviewed — check Market Memory.",
};

const WIDGET_TO_MORNING: Record<string, MorningTaskId> = {
  dailybriefing: "daily-briefing",
  marketstate: "market-state",
  dailyops: "daily-operations",
  "header-strip": "live-desk",
  ticket: "execution-plan",
};

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface OperatorDayTasks {
  dateKey: string;
  morning: Record<MorningTaskId, boolean>;
  trading: Record<TradingTaskId, boolean>;
  review: Record<ReviewTaskId, boolean>;
  executionPlanNote: string;
  updatedAt: number;
}

export function emptyDayTasks(dateKey = todayKey()): OperatorDayTasks {
  return {
    dateKey,
    morning: {
      "daily-briefing": false,
      "market-state": false,
      "daily-operations": false,
      "live-desk": false,
      "execution-plan": false,
    },
    trading: {
      liquidity: false,
      spread: false,
      volatility: false,
      "position-size": false,
      "market-state": false,
    },
    review: {
      "journal-updated": false,
      "session-reviewed": false,
      "mistakes-reviewed": false,
      "lessons-recorded": false,
    },
    executionPlanNote: "",
    updatedAt: Date.now(),
  };
}

export function morningTaskFromWidget(widgetId: string): MorningTaskId | null {
  return WIDGET_TO_MORNING[widgetId] ?? null;
}

function tradingIds(pro: OperatorProCapabilities): TradingTaskId[] {
  return visibleTradingTaskIds(pro);
}

function reviewIds(pro: OperatorProCapabilities): ReviewTaskId[] {
  return visibleReviewTaskIds(pro);
}

export function phaseComplete(day: OperatorDayTasks, phase: OperatorPhase, pro: OperatorProCapabilities): boolean {
  if (phase === "morning") return Object.values(day.morning).every(Boolean);
  if (phase === "trading") {
    const ids = tradingIds(pro);
    if (ids.length === 0) return true;
    return ids.every((id) => day.trading[id]);
  }
  const ids = reviewIds(pro);
  if (ids.length === 0) return true;
  return ids.every((id) => day.review[id]);
}

export function countComplete(day: OperatorDayTasks, pro: OperatorProCapabilities): { done: number; total: number } {
  const morningDone = Object.values(day.morning).filter(Boolean).length;
  const tradeIds = tradingIds(pro);
  const revIds = reviewIds(pro);
  const tradingDone = tradeIds.filter((id) => day.trading[id]).length;
  const reviewDone = revIds.filter((id) => day.review[id]).length;
  const done = morningDone + tradingDone + reviewDone;
  const total = MORNING_TASKS.length + tradeIds.length + revIds.length;
  return { done, total };
}

export function operatorScore(day: OperatorDayTasks, pro: OperatorProCapabilities): number {
  const { done, total } = countComplete(day, pro);
  return total > 0 ? Math.round((done / total) * 100) : 100;
}

export function phaseScore(day: OperatorDayTasks, phase: OperatorPhase, pro: OperatorProCapabilities): number {
  if (phase === "morning") {
    const n = Object.values(day.morning).filter(Boolean).length;
    return Math.round((n / MORNING_TASKS.length) * 100);
  }
  if (phase === "trading") {
    const ids = tradingIds(pro);
    if (ids.length === 0) return 0;
    const n = ids.filter((id) => day.trading[id]).length;
    return Math.round((n / ids.length) * 100);
  }
  const ids = reviewIds(pro);
  if (ids.length === 0) return 0;
  const n = ids.filter((id) => day.review[id]).length;
  return Math.round((n / ids.length) * 100);
}

export interface OperatorStepSnapshot {
  phase: OperatorPhase;
  taskId: string;
  label: string;
  panelId?: string;
}

export function currentStep(day: OperatorDayTasks, pro: OperatorProCapabilities): OperatorStepSnapshot | null {
  for (const t of MORNING_TASKS) {
    if (!day.morning[t.id as MorningTaskId]) {
      return { phase: "morning", taskId: t.id, label: t.label, panelId: t.panelId };
    }
  }
  for (const id of tradingIds(pro)) {
    const t = TRADING_TASKS.find((x) => x.id === id);
    if (t && !day.trading[id]) {
      return { phase: "trading", taskId: t.id, label: t.label, panelId: t.panelId };
    }
  }
  for (const id of reviewIds(pro)) {
    const t = REVIEW_TASKS.find((x) => x.id === id);
    if (t && !day.review[id]) {
      return { phase: "review", taskId: t.id, label: t.label, panelId: t.panelId };
    }
  }
  return null;
}

export function currentMorningTradingStep(day: OperatorDayTasks): OperatorStepSnapshot | null {
  for (const id of MORNING_TRADING_PATH_IDS) {
    if (!day.morning[id]) {
      const t = MORNING_TASKS.find((x) => x.id === id);
      if (t) return { phase: "morning", taskId: t.id, label: t.label, panelId: t.panelId };
    }
  }
  return null;
}

export function morningTradingPathProgress(day: OperatorDayTasks): { done: number; total: number } {
  const done = MORNING_TRADING_PATH_IDS.filter((id) => day.morning[id]).length;
  return { done, total: MORNING_TRADING_PATH_IDS.length };
}

export function liveGuidance(day: OperatorDayTasks, pro: OperatorProCapabilities): string {
  const step = currentStep(day, pro);
  if (!step) {
    const phases = visiblePhases(pro);
    if (phases.length === 1 && phaseComplete(day, "morning", pro)) {
      return "Morning workflow complete — ready to trade with discipline.";
    }
    return "All workflows complete — operator day closed.";
  }
  const useLite = step.phase === "morning";
  if (step.taskId === "market-state" && step.phase === "trading") {
    return PRO_GUIDANCE["market-state-trading"] ?? "Execution checklist incomplete.";
  }
  if (useLite && LITE_GUIDANCE[step.taskId]) return LITE_GUIDANCE[step.taskId]!;
  return PRO_GUIDANCE[step.taskId] ?? `Complete: ${step.label}`;
}

export function activePhase(day: OperatorDayTasks, pro: OperatorProCapabilities): OperatorPhase {
  if (!phaseComplete(day, "morning", pro)) return "morning";
  const phases = visiblePhases(pro);
  if (phases.includes("trading") && !phaseComplete(day, "trading", pro)) return "trading";
  if (phases.includes("review") && !phaseComplete(day, "review", pro)) return "review";
  return "morning";
}
