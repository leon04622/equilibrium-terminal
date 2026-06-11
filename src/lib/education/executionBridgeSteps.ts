import { LiveExecutionCoach, type ExecContext } from "@/lib/education/liveExecutionCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";
import type { ExecutionAnalyticsTab } from "@/store/useExecutionAnalyticsStore";

/** EXECUTION LEARNING TEMPLATE V1 — ticket + book + radar + exec intel bridge. */

export type ExecBridgePanel = "hyperbook" | "ticket" | "slippageradar" | "execintel";

export type ExecBridgeRegion =
  | "panel"
  | "spread"
  | "bids"
  | "asks"
  | "slip-bps"
  | "spread-bps"
  | "risk-tier"
  | "exec-context"
  | "exec-spread"
  | "exec-regime"
  | "exec-stress"
  | "exec-pipe"
  | "mode-market"
  | "mode-limit"
  | "size"
  | "quality-slippage"
  | "quality-spread"
  | "fill-quality"
  | null;

export type ExecBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface ExecRecognitionSpec {
  prompt: string;
  accept: Exclude<ExecBridgeRegion, null>[];
  nudge: string;
}

export interface ExecBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: ExecBridgeMode;
  bridgePanel: ExecBridgePanel;
  region: ExecBridgeRegion;
  execIntelTab?: ExecutionAnalyticsTab;
  whyCare?: (ctx: ExecContext) => string;
  coach: (ctx: ExecContext) => string;
  recognize?: ExecRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const EXECUTION_BRIDGE_PANEL = "ticket";

export const EXECUTION_REQUIRED_CONCEPTS = [
  "identify-spread",
  "identify-limit-order",
  "identify-size",
  "identify-exec-pipe",
  "execution-pretrade-ready",
  "execution-certified",
];

const GOOD_EXEC: CompareSide = {
  id: "good",
  title: "GOOD EXECUTION",
  good: true,
  traits: ["Patience", "Planned entry", "Liquidity awareness", "Right order type"],
};

const BAD_EXEC: CompareSide = {
  id: "bad",
  title: "BAD EXECUTION",
  good: false,
  traits: ["Chasing price", "Emotional clicks", "Ignoring spread", "Oversized market orders"],
};

export const EXECUTION_BRIDGE_STEPS: ExecBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Execute with intention",
    bridgePanel: "ticket",
    region: "panel",
    coach: (ctx) => LiveExecutionCoach.todayReadout(ctx),
    whyCare: () => "A good trade idea can fail because of poor execution. Plan before you click.",
  },
  {
    id: "spread",
    mode: "explain",
    chapter: "SPREAD",
    title: "Read the cost of entry",
    bridgePanel: "hyperbook",
    region: "spread",
    coach: (ctx) => LiveExecutionCoach.patienceAdvice(ctx),
    whyCare: () => "Wide spread means you pay more the instant you execute.",
  },
  {
    id: "liquidity",
    mode: "explain",
    chapter: "LIQUIDITY",
    title: "Depth before size",
    bridgePanel: "hyperbook",
    region: "asks",
    coach: (ctx) => LiveExecutionCoach.sizeAdvice(ctx),
    whyCare: () => "Thin asks cannot absorb large market buys without slippage.",
  },
  {
    id: "limit",
    mode: "explain",
    chapter: "PATIENT ENTRY",
    title: "Limit order control",
    bridgePanel: "ticket",
    region: "mode-limit",
    coach: () => LiveExecutionCoach.limitAdvice(),
    whyCare: () => "Limits let you wait for your price — patience as an edge.",
  },
  {
    id: "market-caution",
    mode: "explain",
    chapter: "MARKET ORDERS",
    title: "When speed costs price",
    bridgePanel: "ticket",
    region: "mode-market",
    coach: () => "Market orders when you must fill now — not when you are chasing every tick.",
    whyCare: () => "Market + thin book + volatility = poor execution.",
  },
  {
    id: "size",
    mode: "explain",
    chapter: "SIZE",
    title: "Scale in thoughtfully",
    bridgePanel: "ticket",
    region: "size",
    coach: (ctx) => LiveExecutionCoach.sizeAdvice(ctx),
    whyCare: () => "Large single entries move price against you.",
  },
  {
    id: "slip-radar",
    mode: "explain",
    chapter: "SLIPPAGE RADAR",
    title: "Execution risk live",
    bridgePanel: "slippageradar",
    region: "slip-bps",
    coach: (ctx) => LiveExecutionCoach.alertLine(ctx),
    whyCare: () => "Radar aggregates spread, velocity, and book stress into one read.",
  },
  {
    id: "volatility",
    mode: "explain",
    chapter: "VOLATILITY",
    title: "Regime and stress",
    bridgePanel: "ticket",
    region: "exec-regime",
    coach: (ctx) => LiveExecutionCoach.volatilityAdvice(ctx),
    whyCare: () => "Volatile tape punishes rushed entries.",
  },
  {
    id: "exec-pipe",
    mode: "explain",
    chapter: "EXEC PIPELINE",
    title: "Execution confidence",
    bridgePanel: "ticket",
    region: "exec-pipe",
    coach: (ctx) =>
      ctx.execConfidence < 45
        ? `Exec pipe ${ctx.execConfidence}% — verify book and radar before submit.`
        : `Exec pipe ${ctx.execConfidence}% — pipeline healthy, still plan the entry.`,
    whyCare: () => "Low pipeline confidence means execution quality may be unreliable.",
  },
  {
    id: "exec-quality",
    mode: "explain",
    chapter: "EXEC METRICS",
    title: "Fill quality desk",
    bridgePanel: "execintel",
    region: "quality-slippage",
    execIntelTab: "quality",
    coach: (ctx) => LiveExecutionCoach.todayReadout(ctx),
    whyCare: () => "Execution intel consolidates slippage, spread, and fill scores.",
  },
  {
    id: "compare",
    mode: "compare",
    chapter: "HABITS",
    title: "Good vs bad execution",
    bridgePanel: "ticket",
    region: "panel",
    compare: { good: GOOD_EXEC, bad: BAD_EXEC },
    coach: () => "Good execution is planned. Bad execution is reactive.",
  },
  {
    id: "decide-enter",
    mode: "decide",
    chapter: "SCENARIO 1",
    title: "Spread just widened",
    bridgePanel: "hyperbook",
    region: "panel",
    decide: {
      prompt: "You want to enter long. Spread widened 3x in the last minute. Best action?",
      options: [
        { id: "wait", label: "Wait / use limit", traits: ["Patience", "Better fill potential"], correct: true },
        { id: "market", label: "Market buy now", traits: ["Chasing", "Pays wide spread"], correct: false },
        { id: "double", label: "Double size to catch move", traits: ["Emotional", "Maximum slippage"], correct: false },
      ],
      explanation: "Wait or limit — spread expansion is a tax on market orders.",
    },
    coach: () => "Wide spread → patience.",
  },
  {
    id: "decide-vol",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Volatile tape",
    bridgePanel: "ticket",
    region: "exec-stress",
    decide: {
      prompt: "Stress score 78, velocity elevated. You still want exposure. Best approach?",
      options: [
        { id: "small", label: "Reduce size + limit entry", traits: ["Controls risk", "Patient"], correct: true },
        { id: "full", label: "Full size market order", traits: ["Poor fill", "Chasing"], correct: false },
        { id: "fomo", label: "Enter now before it runs", traits: ["Emotional execution"], correct: false },
      ],
      explanation: "Smaller size and limits — volatility demands patience, not urgency.",
    },
    coach: () => "High stress → smaller, slower.",
  },
  {
    id: "decide-scale",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Building a position",
    bridgePanel: "ticket",
    region: "size",
    decide: {
      prompt: "Strong idea, uncertain timing. How should you enter?",
      options: [
        { id: "scale", label: "Scale in with smaller clips", traits: ["Less impact", "Tests idea"], correct: true },
        { id: "all", label: "All-in market order", traits: ["Max slippage", "No flexibility"], correct: false },
        { id: "skip", label: "Skip the trade entirely", traits: ["Misses valid idea"], correct: false },
      ],
      explanation: "Scale in — layers reduce impact and let you adjust as conditions evolve.",
    },
    coach: () => "Uncertainty → scale in.",
  },
  {
    id: "pre-exec",
    mode: "explain",
    chapter: "PRE-TRADE EXEC",
    title: "Five checks before submit",
    bridgePanel: "ticket",
    region: "panel",
    coach: () => "Liquidity, spread, volatility, size, order type — then execute.",
  },
  {
    id: "recognize-spread",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find the spread",
    bridgePanel: "hyperbook",
    region: null,
    conceptId: "identify-spread",
    recognize: {
      prompt: "Click the spread on the order book.",
      accept: ["spread"],
      nudge: "Order book → mid strip (SPR).",
    },
    coach: () => "Click spread.",
  },
  {
    id: "recognize-limit",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find limit order",
    bridgePanel: "ticket",
    region: null,
    conceptId: "identify-limit-order",
    recognize: {
      prompt: "Click LIMIT on the trade ticket.",
      accept: ["mode-limit"],
      nudge: "Trade ticket → LIMIT mode button.",
    },
    coach: () => "Click limit.",
  },
  {
    id: "recognize-size",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find position size",
    bridgePanel: "ticket",
    region: null,
    conceptId: "identify-size",
    recognize: {
      prompt: "Click the size field on the trade ticket.",
      accept: ["size"],
      nudge: "Trade ticket → Size input.",
    },
    coach: () => "Click size.",
  },
  {
    id: "recognize-pipe",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find exec pipeline",
    bridgePanel: "ticket",
    region: null,
    conceptId: "identify-exec-pipe",
    recognize: {
      prompt: "Click EXEC PIPE on the execution context strip.",
      accept: ["exec-pipe"],
      nudge: "Trade ticket → top strip → EXEC PIPE cell.",
    },
    coach: () => "Click exec pipe.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Execution understood",
    bridgePanel: "ticket",
    region: null,
    conceptId: "execution-certified",
    coach: () =>
      "You understand patience, scaling, volatility, liquidity, and how to read execution quality live. Plan entries — do not chase.",
  },
];
