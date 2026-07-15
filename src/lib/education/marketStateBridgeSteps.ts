/** MARKET STATE LAYER v1 — STABILITY FREEZE */
import { MarketStateCoach } from "@/lib/education/marketStateCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

export type MSBridgePanel = "marketstate";

export type MSBridgeRegion =
  | "panel"
  | "classification"
  | "desk-state"
  | "confidence"
  | "history"
  | "signals"
  | "volatility"
  | "liquidity"
  | "composite"
  | null;

export type MSBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface MSRecognitionSpec {
  prompt: string;
  accept: Exclude<MSBridgeRegion, null>[];
  nudge: string;
}

export interface MSBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: MSBridgeMode;
  bridgePanel: MSBridgePanel;
  region: MSBridgeRegion;
  whyCare?: (ctx: ReturnType<typeof MarketStateCoach.contextLive>) => string;
  coach: (ctx: ReturnType<typeof MarketStateCoach.contextLive>) => string;
  recognize?: MSRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const MARKET_STATE_BRIDGE_PANEL = "marketstate";

export const MARKET_STATE_REQUIRED_CONCEPTS = [
  "identify-classification",
  "identify-confidence",
  "identify-signals",
  "identify-volatility",
  "identify-liquidity",
  "identify-history",
  "market-state-workflow-ready",
  "market-state-certified",
];

const ADAPTIVE_OPERATOR: CompareSide = {
  id: "adaptive",
  title: "ADAPTIVE OPERATOR",
  good: true,
  traits: ["Reads state layer first", "Adjusts size to CALM/STRESS", "Matches execution to THIN", "Trades with context"],
};

const STATIC_TRADER: CompareSide = {
  id: "static",
  title: "STATIC TRADER",
  good: false,
  traits: ["Same size every day", "Ignores state transitions", "Chases in STRESS", "Reactive execution"],
};

export const MARKET_STATE_BRIDGE_STEPS: MSBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Market State Layer panel",
    bridgePanel: "marketstate",
    region: "panel",
    coach: (ctx) => MarketStateCoach.todayReadout(ctx),
    whyCare: () => "This layer ties Daily Operations, Live Desk, and risk into one behavior guide.",
  },
  {
    id: "classification",
    mode: "explain",
    chapter: "CLASSIFICATION",
    title: "CALM · ACTIVE · THIN · STRESS",
    bridgePanel: "marketstate",
    region: "classification",
    coach: (ctx) => MarketStateCoach.classificationAdvice(ctx),
    whyCare: () => "Four states tell you how to behave right now — not how you felt earlier.",
  },
  {
    id: "calm",
    mode: "explain",
    chapter: "CALM",
    title: "Stable conditions",
    bridgePanel: "marketstate",
    region: "desk-state",
    coach: () => MarketStateCoach.calmAdvice(),
    whyCare: () => "CALM is not complacency — it supports planned execution discipline.",
  },
  {
    id: "active",
    mode: "explain",
    chapter: "ACTIVE",
    title: "Volatility expanding",
    bridgePanel: "marketstate",
    region: "desk-state",
    coach: () => MarketStateCoach.activeAdvice(),
    whyCare: () => "ACTIVE means opportunities and risk both rise — attention must rise too.",
  },
  {
    id: "thin",
    mode: "explain",
    chapter: "THIN",
    title: "Liquidity weak",
    bridgePanel: "marketstate",
    region: "liquidity",
    coach: () => MarketStateCoach.thinAdvice(),
    whyCare: () => "THIN directly impacts fill quality — execution must change.",
  },
  {
    id: "stress",
    mode: "explain",
    chapter: "STRESS",
    title: "Defensive posture",
    bridgePanel: "marketstate",
    region: "desk-state",
    coach: () => MarketStateCoach.stressAdvice(),
    whyCare: () => "STRESS protects capital — standing aside is a valid professional choice.",
  },
  {
    id: "confidence",
    mode: "explain",
    chapter: "CONFIDENCE",
    title: "Classification confidence",
    bridgePanel: "marketstate",
    region: "confidence",
    coach: (ctx) => MarketStateCoach.confidenceAdvice(ctx),
    whyCare: () => "Confidence shows how strongly signals agree on the current state.",
  },
  {
    id: "signals",
    mode: "explain",
    chapter: "SUPPORTING SIGNALS",
    title: "What drives the label",
    bridgePanel: "marketstate",
    region: "signals",
    coach: (ctx) => MarketStateCoach.signalsAdvice(ctx),
    whyCare: () => "Signals explain why the layer chose CALM, ACTIVE, THIN, or STRESS.",
  },
  {
    id: "history",
    mode: "explain",
    chapter: "STATE HISTORY",
    title: "Transitions over time",
    bridgePanel: "marketstate",
    region: "history",
    coach: (ctx) => MarketStateCoach.historyAdvice(ctx),
    whyCare: () => "History shows how conditions evolved — transitions are trading signals.",
  },
  {
    id: "workflow",
    mode: "explain",
    chapter: "WORKFLOW",
    title: "Check state before trading",
    bridgePanel: "marketstate",
    region: "panel",
    coach: () => "Read classification → check confidence → review signals → adjust size, execution, risk → then trade.",
  },
  {
    id: "compare-adaptive",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Adaptive vs static",
    bridgePanel: "marketstate",
    region: "panel",
    compare: { good: ADAPTIVE_OPERATOR, bad: STATIC_TRADER },
    coach: () => "The Market State Layer exists so you operate like the adaptive operator.",
  },
  {
    id: "decide-calm",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "State CALM",
    bridgePanel: "marketstate",
    region: "classification",
    decide: {
      prompt: "Classification reads CALM. Should position size stay at maximum leverage?",
      options: [
        { id: "planned", label: "Standard planned size — normal discipline", traits: ["Respects CALM", "Disciplined"], correct: true },
        { id: "max", label: "Max leverage — calm means free money", traits: ["Overconfident"], correct: false },
        { id: "skip", label: "Skip state layer — trade anyway", traits: ["Unprepared"], correct: false },
      ],
      explanation: "CALM supports planned execution — not reckless maximum size.",
    },
    coach: () => "CALM allows standard discipline — not maximum aggression.",
  },
  {
    id: "decide-stress",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "State STRESS",
    bridgePanel: "marketstate",
    region: "classification",
    decide: {
      prompt: "Classification shifts to STRESS. Should position size remain the same?",
      options: [
        { id: "reduce", label: "Reduce size or stand aside", traits: ["Respects STRESS", "Protects capital"], correct: true },
        { id: "same", label: "Same size — states don't matter", traits: ["Ignores layer"], correct: false },
        { id: "double", label: "Double size — volatility is opportunity", traits: ["Compounds risk"], correct: false },
      ],
      explanation: "STRESS demands defensive posture — size must change when conditions deteriorate.",
    },
    coach: () => "Professional operators reduce size in STRESS — amateurs don't.",
  },
  {
    id: "coach-examples",
    mode: "explain",
    chapter: "OPERATOR COACH",
    title: "State alerts",
    bridgePanel: "marketstate",
    region: "panel",
    coach: (ctx) => {
      const line = MarketStateCoach.alertLine(ctx);
      return `${line} Examples: Market currently calm. Conditions becoming active. Liquidity deteriorating. Stress conditions detected.`;
    },
    whyCare: () => "The layer interprets conditions so you adapt instead of reacting blind.",
  },
  {
    id: "recognize-classification",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find state classification",
    bridgePanel: "marketstate",
    region: null,
    conceptId: "identify-classification",
    recognize: {
      prompt: "Click the state classification badge.",
      accept: ["classification", "desk-state"],
      nudge: "MARKET STATE LAYER → CALM / ACTIVE / THIN / STRESS badge.",
    },
    coach: () => "Click the state classification badge.",
  },
  {
    id: "recognize-confidence",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find confidence score",
    bridgePanel: "marketstate",
    region: null,
    conceptId: "identify-confidence",
    recognize: {
      prompt: "Click the confidence readout.",
      accept: ["confidence"],
      nudge: "MARKET STATE LAYER → CONFIDENCE percentage.",
    },
    coach: () => "Click the confidence score.",
  },
  {
    id: "recognize-signals",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find supporting signals",
    bridgePanel: "marketstate",
    region: null,
    conceptId: "identify-signals",
    recognize: {
      prompt: "Click the supporting signals block.",
      accept: ["signals"],
      nudge: "MARKET STATE LAYER → SIGNALS section (vol · liq · risk).",
    },
    coach: () => "Click the supporting signals area.",
  },
  {
    id: "recognize-volatility",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find volatility signal",
    bridgePanel: "marketstate",
    region: null,
    conceptId: "identify-volatility",
    recognize: {
      prompt: "Click the volatility signal row.",
      accept: ["volatility"],
      nudge: "SIGNALS → VOLATILITY row.",
    },
    coach: () => "Click the volatility signal.",
  },
  {
    id: "recognize-liquidity",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find liquidity signal",
    bridgePanel: "marketstate",
    region: null,
    conceptId: "identify-liquidity",
    recognize: {
      prompt: "Click the liquidity signal row.",
      accept: ["liquidity"],
      nudge: "SIGNALS → LIQUIDITY row.",
    },
    coach: () => "Click the liquidity signal.",
  },
  {
    id: "recognize-history",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find state history",
    bridgePanel: "marketstate",
    region: null,
    conceptId: "identify-history",
    recognize: {
      prompt: "Click the state history timeline.",
      accept: ["history"],
      nudge: "MARKET STATE LAYER → STATE HISTORY section.",
    },
    coach: () => "Click the state history timeline.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Market State Layer certified",
    bridgePanel: "marketstate",
    region: "panel",
    conceptId: "market-state-certified",
    coach: () =>
      "You understand what the Market State Layer is, how CALM / ACTIVE / THIN / STRESS are determined, and how professionals adapt. MARKET STATE LAYER CERTIFIED.",
  },
];
