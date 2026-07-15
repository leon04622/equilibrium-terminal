import { MarketMemoryCoach } from "@/lib/education/marketMemoryCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

export type MMBridgePanel = "memorydesk";

export type MMBridgeRegion =
  | "panel"
  | "archive"
  | "regime"
  | "analogs"
  | "liquidity"
  | "narrative"
  | "replay"
  | "search"
  | null;

export type MMBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface MMRecognitionSpec {
  prompt: string;
  accept: Exclude<MMBridgeRegion, null>[];
  nudge: string;
}

export interface MMBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: MMBridgeMode;
  bridgePanel: MMBridgePanel;
  region: MMBridgeRegion;
  whyCare?: (ctx: ReturnType<typeof MarketMemoryCoach.contextLive>) => string;
  coach: (ctx: ReturnType<typeof MarketMemoryCoach.contextLive>) => string;
  recognize?: MMRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const MARKET_MEMORY_BRIDGE_PANEL = "memorydesk";

export const MARKET_MEMORY_REQUIRED_CONCEPTS = [
  "identify-archive",
  "identify-regime",
  "identify-analogs",
  "identify-liquidity",
  "identify-narrative",
  "market-memory-workflow-ready",
  "market-memory-certified",
];

const CONTEXT_OPERATOR: CompareSide = {
  id: "context",
  title: "CONTEXT OPERATOR",
  good: true,
  traits: ["Checks archive first", "Compares analogs", "Adjusts plan to regime", "Uses history for posture"],
};

const REACTIVE_TRADER: CompareSide = {
  id: "reactive",
  title: "REACTIVE TRADER",
  good: false,
  traits: ["Only watches live price", "Ignores prior stress events", "Same plan every day", "Treats every day as new"],
};

export const MARKET_MEMORY_BRIDGE_STEPS: MMBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Market Memory Archive panel",
    bridgePanel: "memorydesk",
    region: "panel",
    coach: (ctx) => MarketMemoryCoach.todayReadout(ctx),
    whyCare: () => "The archive preserves what happened before — separate from reacting to the live tape alone.",
  },
  {
    id: "archive",
    mode: "explain",
    chapter: "ARCHIVE",
    title: "Historical entries",
    bridgePanel: "memorydesk",
    region: "archive",
    coach: (ctx) => MarketMemoryCoach.archiveAdvice(ctx),
    whyCare: () => "Archived events carry volatility spikes, liquidity crises, and major session markers.",
  },
  {
    id: "regime",
    mode: "explain",
    chapter: "REGIME",
    title: "Archived states",
    bridgePanel: "memorydesk",
    region: "regime",
    coach: (ctx) => MarketMemoryCoach.regimeAdvice(ctx),
    whyCare: () => "Regime epochs show how volatility and liquidity evolved across prior sessions.",
  },
  {
    id: "analogs",
    mode: "explain",
    chapter: "ANALOGS",
    title: "Similar conditions",
    bridgePanel: "memorydesk",
    region: "analogs",
    coach: (ctx) => MarketMemoryCoach.analogAdvice(ctx),
    whyCare: () => "Analog matches connect today's tape to prior episodes — context, not prophecy.",
  },
  {
    id: "liquidity",
    mode: "explain",
    chapter: "LIQUIDITY",
    title: "Historical liquidity",
    bridgePanel: "memorydesk",
    region: "liquidity",
    coach: (ctx) => MarketMemoryCoach.liquidityAdvice(ctx),
    whyCare: () => "Liquidity memory informs execution — thin history often means thin fills today.",
  },
  {
    id: "narrative",
    mode: "explain",
    chapter: "NARRATIVE",
    title: "Archived observations",
    bridgePanel: "memorydesk",
    region: "narrative",
    coach: (ctx) => MarketMemoryCoach.narrativeAdvice(ctx),
    whyCare: () => "Narrative evolution captures sector rotation and thematic shifts across time.",
  },
  {
    id: "workflow",
    mode: "explain",
    chapter: "WORKFLOW",
    title: "Memory before the plan",
    bridgePanel: "memorydesk",
    region: "panel",
    coach: () => "Review Daily Briefing, review Market State, check Market Memory Archive, then build your trading plan.",
  },
  {
    id: "compare-context",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Context vs reactive",
    bridgePanel: "memorydesk",
    region: "panel",
    compare: { good: CONTEXT_OPERATOR, bad: REACTIVE_TRADER },
    coach: () => "The Market Memory Archive exists so you operate like the context operator.",
  },
  {
    id: "decide-analog",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Similar archived environment",
    bridgePanel: "memorydesk",
    region: "analogs",
    decide: {
      prompt: "Current market looks similar to a previously archived environment. What can the operator learn?",
      options: [
        {
          id: "context",
          label: "Review archive and analogs — adjust size and confirmation",
          traits: ["Uses history", "Professional"],
          correct: true,
        },
        { id: "predict", label: "Assume the same outcome will repeat exactly", traits: ["Overfits history"], correct: false },
        { id: "ignore", label: "Ignore archive — only live price matters", traits: ["Reactive"], correct: false },
      ],
      explanation: "Similar conditions provide context for posture — not a guaranteed repeat of prior outcomes.",
    },
    coach: () => "When analogs light up, learn from history — do not treat it as a forecast.",
  },
  {
    id: "decide-prediction",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Context over prediction",
    bridgePanel: "memorydesk",
    region: "panel",
    decide: {
      prompt: "The archive shows a prior stress event. Is the archive predicting another stress event?",
      options: [
        { id: "context", label: "No — it provides context for preparation", traits: ["Correct framing"], correct: true },
        { id: "forecast", label: "Yes — stress will repeat today", traits: ["Treats memory as forecast"], correct: false },
        { id: "useless", label: "Archive is useless if it cannot predict", traits: ["Misunderstands purpose"], correct: false },
      ],
      explanation: "Memory widens context. Prediction requires separate analysis — the archive supports judgment, not certainty.",
    },
    coach: () => "The archive is not predicting — it is providing context.",
  },
  {
    id: "coach-examples",
    mode: "explain",
    chapter: "OPERATOR COACH",
    title: "Memory alerts",
    bridgePanel: "memorydesk",
    region: "panel",
    coach: (ctx) => {
      const line = MarketMemoryCoach.alertLine(ctx);
      return `${line} Examples: Current conditions resemble a prior volatility expansion. Historical liquidity conditions were similar. Previous stress events produced different behavior.`;
    },
    whyCare: () => "Coach lines translate archived context into actionable preparation.",
  },
  {
    id: "recognize-archive",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find the archive tab",
    bridgePanel: "memorydesk",
    region: null,
    conceptId: "identify-archive",
    recognize: {
      prompt: "Your turn — click the archive section.",
      accept: ["archive"],
      nudge: "Click the ARCHIVE tab, then the event list below it.",
    },
    coach: () => "Click the archive section.",
  },
  {
    id: "recognize-regime",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find regime analysis",
    bridgePanel: "memorydesk",
    region: null,
    conceptId: "identify-regime",
    recognize: {
      prompt: "Now click the regime section.",
      accept: ["regime"],
      nudge: "Click the REGIME tab — volatility and liquidity classification.",
    },
    coach: () => "Click the regime section.",
  },
  {
    id: "recognize-analogs",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find analog matches",
    bridgePanel: "memorydesk",
    region: null,
    conceptId: "identify-analogs",
    recognize: {
      prompt: "Find analog matches and click them.",
      accept: ["analogs"],
      nudge: "Click the ANALOGS tab — similarity percentages to prior sessions.",
    },
    coach: () => "Click the analog matches.",
  },
  {
    id: "recognize-liquidity",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find liquidity history",
    bridgePanel: "memorydesk",
    region: null,
    conceptId: "identify-liquidity",
    recognize: {
      prompt: "Click the liquidity history section.",
      accept: ["liquidity"],
      nudge: "Click the LIQUIDITY tab — depth and fragmentation over time.",
    },
    coach: () => "Click the liquidity history.",
  },
  {
    id: "recognize-narrative",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find narrative timeline",
    bridgePanel: "memorydesk",
    region: null,
    conceptId: "identify-narrative",
    recognize: {
      prompt: "Last one — click the narrative section.",
      accept: ["narrative"],
      nudge: "Click the NARR tab — narrative phases and sector rotation.",
    },
    coach: () => "Click the narrative timeline.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Market Memory Archive certified",
    bridgePanel: "memorydesk",
    region: "panel",
    conceptId: "market-memory-certified",
    coach: () =>
      "You understand what the Market Memory Archive does, why historical context matters, and how professionals use memory to support decisions. MARKET MEMORY ARCHIVE CERTIFIED.",
  },
];
