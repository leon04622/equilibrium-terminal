import { LiveDailyOperationsCoach } from "@/lib/education/liveDailyOperationsCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";
import type { DailyOperationsState } from "@/store/useDailyOperationsStore";

export type DOBridgePanel = "dailyops";

export type DOBridgeTab = DailyOperationsState["activeTab"];

export type DOBridgeRegion =
  | "panel"
  | "brief"
  | "volatility"
  | "liquidity"
  | "risk-mode"
  | "composite"
  | "session"
  | "checklist"
  | "routines"
  | null;

export type DOBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface DORecognitionSpec {
  prompt: string;
  accept: Exclude<DOBridgeRegion, null>[];
  nudge: string;
}

export interface DOBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: DOBridgeMode;
  bridgePanel: DOBridgePanel;
  region: DOBridgeRegion;
  dailyTab?: DOBridgeTab;
  whyCare?: (ctx: ReturnType<typeof LiveDailyOperationsCoach.contextFromStore>) => string;
  coach: (ctx: ReturnType<typeof LiveDailyOperationsCoach.contextFromStore>) => string;
  recognize?: DORecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const DAILY_OPERATIONS_BRIDGE_PANEL = "dailyops";

export const DAILY_OPERATIONS_REQUIRED_CONCEPTS = [
  "identify-brief",
  "identify-volatility",
  "identify-liquidity",
  "identify-risk",
  "identify-checklist",
  "daily-ops-pretrade-ready",
  "daily-operations-certified",
];

const PREPARED: CompareSide = {
  id: "prepared",
  title: "PREPARED OPERATOR",
  good: true,
  traits: ["Opens Daily Operations first", "Reads state before trading", "Matches size to environment", "Uses routines"],
};

const REACTIVE: CompareSide = {
  id: "reactive",
  title: "REACTIVE TRADER",
  good: false,
  traits: ["Jumps straight to tickets", "Ignores volatility label", "Same size every day", "No session context"],
};

export const DAILY_OPERATIONS_BRIDGE_STEPS: DOBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Your Daily Operations panel",
    bridgePanel: "dailyops",
    region: "panel",
    dailyTab: "brief",
    coach: (ctx) => LiveDailyOperationsCoach.todayReadout(ctx),
    whyCare: () => "This is Equilibrium Terminal's daily operating system — not a generic trading course.",
  },
  {
    id: "brief",
    mode: "explain",
    chapter: "BRIEF TAB",
    title: "What matters today",
    bridgePanel: "dailyops",
    region: "brief",
    dailyTab: "brief",
    coach: (ctx) => LiveDailyOperationsCoach.briefAdvice(ctx),
    whyCare: () => "The brief answers what should I know before this session starts?",
  },
  {
    id: "volatility",
    mode: "explain",
    chapter: "STATE · VOLATILITY",
    title: "Volatility label",
    bridgePanel: "dailyops",
    region: "volatility",
    dailyTab: "state",
    coach: (ctx) => LiveDailyOperationsCoach.volatilityAdvice(ctx),
    whyCare: () => "When volatility expands, execution quality often deteriorates.",
  },
  {
    id: "liquidity",
    mode: "explain",
    chapter: "STATE · LIQUIDITY",
    title: "Liquidity label",
    bridgePanel: "dailyops",
    region: "liquidity",
    dailyTab: "state",
    coach: (ctx) => LiveDailyOperationsCoach.liquidityAdvice(ctx),
    whyCare: () => "Thin liquidity changes how orders fill on this terminal.",
  },
  {
    id: "risk",
    mode: "explain",
    chapter: "STATE · RISK",
    title: "Risk mode",
    bridgePanel: "dailyops",
    region: "risk-mode",
    dailyTab: "state",
    coach: (ctx) => LiveDailyOperationsCoach.riskAdvice(ctx),
    whyCare: () => "Risk-on and risk-off labels change how aggressively you should operate.",
  },
  {
    id: "composite",
    mode: "explain",
    chapter: "COMPOSITE READ",
    title: "What kind of day?",
    bridgePanel: "dailyops",
    region: "composite",
    dailyTab: "state",
    coach: (ctx) => {
      const ms = ctx.snap?.marketState;
      return ms ? `Composite: ${ms.compositeLabel} · regime ${ms.regime}. This is the platform's answer to what kind of day is today.` : "Composite label summarizes all state layers.";
    },
    whyCare: () => "One sentence — calm, active, volatile, or dangerous — before any trade.",
  },
  {
    id: "session",
    mode: "explain",
    chapter: "SESSION TAB",
    title: "Session context",
    bridgePanel: "dailyops",
    region: "session",
    dailyTab: "session",
    coach: (ctx) => LiveDailyOperationsCoach.sessionAdvice(ctx),
    whyCare: () => "Asia, London, and NY sessions change liquidity and volatility on Equilibrium Terminal.",
  },
  {
    id: "workflow-1",
    mode: "explain",
    chapter: "WORKFLOW · STEP 1",
    title: "Check brief first",
    bridgePanel: "dailyops",
    region: "brief",
    dailyTab: "brief",
    coach: () => "What should I check first? The brief — headline and bullets for today's session.",
  },
  {
    id: "workflow-2",
    mode: "explain",
    chapter: "WORKFLOW · STEP 2",
    title: "Check state second",
    bridgePanel: "dailyops",
    region: "volatility",
    dailyTab: "state",
    coach: () => "What should I check second? Market state — volatility, liquidity, and risk labels.",
  },
  {
    id: "workflow-3",
    mode: "explain",
    chapter: "WORKFLOW · STEP 3",
    title: "Check ops third",
    bridgePanel: "dailyops",
    region: "checklist",
    dailyTab: "ops",
    coach: () => "What should I check third? My ops checklist and priority alerts — then prepare execution.",
  },
  {
    id: "compare-prepared",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Prepared vs reactive",
    bridgePanel: "dailyops",
    region: "panel",
    dailyTab: "brief",
    compare: { good: PREPARED, bad: REACTIVE },
    coach: () => "Daily Operations exists so you operate like Trader B — not Trader A.",
  },
  {
    id: "decide-calm",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Calm conditions — behavior?",
    bridgePanel: "dailyops",
    region: "composite",
    dailyTab: "state",
    decide: {
      prompt: "Daily Operations shows calm volatility, healthy liquidity, stable conditions. Best behavior?",
      options: [
        { id: "plan", label: "Execute planned setups with normal size", traits: ["Matches environment", "Disciplined"], correct: true },
        { id: "max", label: "Max leverage — conditions are perfect", traits: ["Overconfidence"], correct: false },
        { id: "skip", label: "Skip Daily Operations — trade anyway", traits: ["Unprepared"], correct: false },
      ],
      explanation: "Calm conditions support planned execution — still follow your routine.",
    },
    coach: () => "Favorable labels — execute the plan you prepared.",
  },
  {
    id: "decide-danger",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Dangerous conditions — behavior?",
    bridgePanel: "dailyops",
    region: "composite",
    dailyTab: "state",
    decide: {
      prompt: "Daily Operations shows expanding volatility, poor liquidity, elevated risk. What changes?",
      options: [
        { id: "reduce", label: "Reduce size or stand aside", traits: ["Respects labels", "Protects capital"], correct: true },
        { id: "same", label: "Same size — labels don't matter", traits: ["Ignores platform"], correct: false },
        { id: "chase", label: "Chase moves — volatility means opportunity", traits: ["Reactive"], correct: false },
      ],
      explanation: "When Daily Operations flags elevated risk — behavior must change.",
    },
    coach: () => "Elevated labels → smaller size, wider confirmation, or no trade.",
  },
  {
    id: "pre-daily",
    mode: "explain",
    chapter: "PRE-SESSION CHECK",
    title: "Daily workflow checklist",
    bridgePanel: "dailyops",
    region: "checklist",
    dailyTab: "ops",
    coach: () => "Brief, state, session, ops checklist, routines — then open execution panels.",
  },
  {
    id: "recognize-brief",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find today's brief headline",
    bridgePanel: "dailyops",
    region: null,
    dailyTab: "brief",
    conceptId: "identify-brief",
    recognize: {
      prompt: "Click the daily brief headline.",
      accept: ["brief"],
      nudge: "Daily Operations → BRIEF tab → top headline line.",
    },
    coach: () => "Click the brief headline.",
  },
  {
    id: "recognize-vol",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find volatility state",
    bridgePanel: "dailyops",
    region: null,
    dailyTab: "state",
    conceptId: "identify-volatility",
    recognize: {
      prompt: "Click the VOLATILITY row on the state tab.",
      accept: ["volatility"],
      nudge: "Daily Operations → STATE tab → VOLATILITY row.",
    },
    coach: () => "Click volatility on state tab.",
  },
  {
    id: "recognize-liq",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find liquidity state",
    bridgePanel: "dailyops",
    region: null,
    dailyTab: "state",
    conceptId: "identify-liquidity",
    recognize: {
      prompt: "Click the LIQUIDITY row.",
      accept: ["liquidity"],
      nudge: "STATE tab → LIQUIDITY row.",
    },
    coach: () => "Click liquidity on state tab.",
  },
  {
    id: "recognize-risk",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find risk mode",
    bridgePanel: "dailyops",
    region: null,
    dailyTab: "state",
    conceptId: "identify-risk",
    recognize: {
      prompt: "Click the RISK MODE row.",
      accept: ["risk-mode"],
      nudge: "STATE tab → RISK MODE row.",
    },
    coach: () => "Click risk mode on state tab.",
  },
  {
    id: "recognize-checklist",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find your checklist",
    bridgePanel: "dailyops",
    region: null,
    dailyTab: "ops",
    conceptId: "identify-checklist",
    recognize: {
      prompt: "Click any item on your MY OPS checklist.",
      accept: ["checklist"],
      nudge: "MY OPS tab → CHECKLIST section → any row.",
    },
    coach: () => "Click a checklist item.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Daily Operations certified",
    bridgePanel: "dailyops",
    region: "panel",
    dailyTab: "brief",
    conceptId: "daily-operations-certified",
    coach: () =>
      "You know what Daily Operations is, why it exists, how professionals use it, and how it connects Equilibrium Terminal. DAILY OPERATIONS CERTIFIED.",
  },
];
