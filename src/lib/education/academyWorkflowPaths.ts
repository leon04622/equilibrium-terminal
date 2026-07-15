/**
 * Academy workflow guides — Day 1 operator path and graduation checklist.
 * Not full lesson modules; hub-launched panel tours.
 */

export type WorkflowStepKind = "panel-tour" | "lesson-bridge";

export interface AcademyWorkflowStep {
  id: string;
  phase: string;
  label: string;
  detail: string;
  panelId: string;
  /** Optional lesson bridge to launch instead of panel tour */
  lessonId?: string;
  bridgeMode?: "bridge" | "start";
  region?: string;
}

export interface AcademyWorkflow {
  id: string;
  title: string;
  subtitle: string;
  storageKey: string;
  steps: AcademyWorkflowStep[];
}

/** Priority 5 — available from Day 1, no curriculum gate. */
export const DAY_ONE_OPERATOR_WORKFLOW: AcademyWorkflow = {
  id: "day-one-operator",
  title: "DAY 1 OPERATOR WORKFLOW",
  subtitle: "Academy panel preview — use Operator Mode for your daily morning workflow.",
  storageKey: "eq-academy-day-one-workflow-v1",
  steps: [
    {
      id: "briefing",
      phase: "MORNING · 1",
      label: "Daily Briefing",
      detail: "Read what deserves attention today — outlook, volatility, liquidity, and session expectations.",
      panelId: "dailybriefing",
    },
    {
      id: "market-state",
      phase: "MORNING · 2",
      label: "Market State",
      detail: "Check CALM, ACTIVE, THIN, or STRESS — your behavior must match conditions.",
      panelId: "marketstate",
    },
    {
      id: "daily-ops",
      phase: "MORNING · 3",
      label: "Daily Operations",
      detail: "Run the morning routine — state, volatility, risk, and session context in one panel.",
      panelId: "dailyops",
    },
    {
      id: "live-desk",
      phase: "MORNING · 4",
      label: "Live Desk",
      detail: "Glance at funding timer, session timer, and desk tone throughout the day.",
      panelId: "header-strip",
    },
    {
      id: "execution",
      phase: "TRADING · 5",
      label: "Execution",
      detail: "Only after context — read the book, check spread, then use the ticket.",
      panelId: "ticket",
    },
    {
      id: "review-journal",
      phase: "REVIEW · 6",
      label: "Operator Journal",
      detail: "Log what you did and one takeaway before closing the session.",
      panelId: "operatorjournal",
    },
  ],
};

/** Priority 6 — graduation checklist after core curriculum. */
export const GRADUATION_DAILY_WORKFLOW: AcademyWorkflow = {
  id: "graduation-daily-workflow",
  title: "YOUR DAILY WORKFLOW",
  subtitle: "Academy graduation tour — Operator Mode is your daily operating system.",
  storageKey: "eq-academy-graduation-workflow-v1",
  steps: [
    {
      id: "am-briefing",
      phase: "MORNING",
      label: "Daily Briefing",
      detail: "Start here — what should I pay attention to today?",
      panelId: "dailybriefing",
      lessonId: "daily-briefing",
      bridgeMode: "bridge",
    },
    {
      id: "am-state",
      phase: "MORNING",
      label: "Market State",
      detail: "Read CALM / ACTIVE / THIN / STRESS before sizing up.",
      panelId: "marketstate",
      lessonId: "market-state",
      bridgeMode: "bridge",
    },
    {
      id: "am-ops",
      phase: "MORNING",
      label: "Daily Operations",
      detail: "Morning routine — volatility, liquidity, risk, session.",
      panelId: "dailyops",
      lessonId: "daily-operations",
      bridgeMode: "bridge",
    },
    {
      id: "trade-book",
      phase: "TRADING",
      label: "Order Book",
      detail: "Read spread and depth before every entry.",
      panelId: "hyperbook",
      lessonId: "order-book",
      bridgeMode: "bridge",
    },
    {
      id: "trade-exec",
      phase: "TRADING",
      label: "Execution",
      detail: "Patience, size, order type — then submit.",
      panelId: "ticket",
      lessonId: "execution",
      bridgeMode: "bridge",
    },
    {
      id: "review-journal",
      phase: "REVIEW",
      label: "Operator Journal",
      detail: "Log decisions and review session behavior.",
      panelId: "operatorjournal",
      lessonId: "operator-journal",
      bridgeMode: "bridge",
    },
    {
      id: "context-memory",
      phase: "CONTEXT",
      label: "Market Memory",
      detail: "Compare today with historical regimes and events.",
      panelId: "memorydesk",
      lessonId: "market-memory",
      bridgeMode: "bridge",
    },
  ],
};

export const ACADEMY_WORKFLOWS = [DAY_ONE_OPERATOR_WORKFLOW, GRADUATION_DAILY_WORKFLOW] as const;
