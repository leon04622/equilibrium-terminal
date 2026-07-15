import { LiveDeskCoach } from "@/lib/education/liveDeskCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

export type LDBridgePanel = "header-strip";

export type LDBridgeRegion =
  | "panel"
  | "session"
  | "volatility"
  | "liquidity"
  | "risk"
  | "funding"
  | "session-countdown"
  | "desk-tone"
  | "market-state"
  | null;

export type LDBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface LDRecognitionSpec {
  prompt: string;
  accept: Exclude<LDBridgeRegion, null>[];
  nudge: string;
}

export interface LDBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: LDBridgeMode;
  bridgePanel: LDBridgePanel;
  region: LDBridgeRegion;
  whyCare?: (ctx: ReturnType<typeof LiveDeskCoach.contextFromStore>) => string;
  coach: (ctx: ReturnType<typeof LiveDeskCoach.contextFromStore>) => string;
  recognize?: LDRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const LIVE_DESK_BRIDGE_PANEL = "header-strip";

export const LIVE_DESK_REQUIRED_CONCEPTS = [
  "identify-funding",
  "identify-session-countdown",
  "identify-desk-tone",
  "identify-session",
  "identify-volatility",
  "identify-liquidity",
  "identify-risk",
  "live-desk-workflow-ready",
  "live-desk-certified",
];

const AWARE_OPERATOR: CompareSide = {
  id: "aware",
  title: "AWARE OPERATOR",
  good: true,
  traits: ["Checks Live Desk first", "Knows session + funding", "Matches behavior to tone", "Trades with context"],
};

const CHART_ONLY_TRADER: CompareSide = {
  id: "chart-only",
  title: "CHART-ONLY TRADER",
  good: false,
  traits: ["Stares at candles only", "Misses session shifts", "Ignores funding windows", "Reacts without context"],
};

export const LIVE_DESK_BRIDGE_STEPS: LDBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Your Live Desk strip",
    bridgePanel: "header-strip",
    region: "panel",
    coach: (ctx) => LiveDeskCoach.todayReadout(ctx),
    whyCare: () => "Live Desk is the heartbeat of the trading day — always visible in the terminal header.",
  },
  {
    id: "session",
    mode: "explain",
    chapter: "SESSION",
    title: "Active session label",
    bridgePanel: "header-strip",
    region: "session",
    coach: (ctx) => LiveDeskCoach.sessionAdvice(ctx),
    whyCare: () => "Asian, European, and US sessions change liquidity and volatility.",
  },
  {
    id: "market-state",
    mode: "explain",
    chapter: "MARKET STATE",
    title: "Vol · Liq · Risk",
    bridgePanel: "header-strip",
    region: "market-state",
    coach: (ctx) => LiveDeskCoach.marketStateAdvice(ctx),
    whyCare: () => "Three quick reads — volatility, liquidity, and risk-on-off — before you click.",
  },
  {
    id: "funding",
    mode: "explain",
    chapter: "FUNDING COUNTDOWN",
    title: "FND timer",
    bridgePanel: "header-strip",
    region: "funding",
    coach: (ctx) => LiveDeskCoach.fundingAdvice(ctx),
    whyCare: () => "Funding accrues hourly — professionals watch the five-minute window.",
  },
  {
    id: "session-countdown",
    mode: "explain",
    chapter: "SESSION COUNTDOWN",
    title: "Next transition",
    bridgePanel: "header-strip",
    region: "session-countdown",
    coach: (ctx) => LiveDeskCoach.sessionCountdownAdvice(ctx),
    whyCare: () => "Session transitions change participation — plan before the shift.",
  },
  {
    id: "desk-tone",
    mode: "explain",
    chapter: "DESK TONE",
    title: "CALM to STRESS",
    bridgePanel: "header-strip",
    region: "desk-tone",
    coach: (ctx) => LiveDeskCoach.deskToneAdvice(ctx),
    whyCare: () => "Desk tone tells you how to behave right now — not how you felt five minutes ago.",
  },
  {
    id: "workflow-open",
    mode: "explain",
    chapter: "WORKFLOW · OPEN",
    title: "Check Live Desk first",
    bridgePanel: "header-strip",
    region: "panel",
    coach: () => "Open terminal → glance Live Desk strip. Session, funding, tone, and market state in one read.",
  },
  {
    id: "workflow-plan",
    mode: "explain",
    chapter: "WORKFLOW · PLAN",
    title: "Context before execution",
    bridgePanel: "header-strip",
    region: "desk-tone",
    coach: () => "Match aggression to desk tone. CALM allows standard size. STRESS means reduce or stand aside. Then plan execution.",
  },
  {
    id: "compare-awareness",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Aware vs chart-only",
    bridgePanel: "header-strip",
    region: "panel",
    compare: { good: AWARE_OPERATOR, bad: CHART_ONLY_TRADER },
    coach: () => "Live Desk exists so you operate like the aware operator — not the chart-only trader.",
  },
  {
    id: "decide-calm",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Desk tone CALM",
    bridgePanel: "header-strip",
    region: "desk-tone",
    decide: {
      prompt: "Desk tone reads CALM · normal conditions. Should trading behavior stay aggressive?",
      options: [
        { id: "standard", label: "Standard discipline — planned entries OK", traits: ["Respects tone", "Context-aware"], correct: true },
        { id: "max", label: "Max leverage — calm means easy money", traits: ["Overconfident"], correct: false },
        { id: "ignore", label: "Ignore tone — charts only", traits: ["Reactive"], correct: false },
      ],
      explanation: "CALM means normal conditions — standard discipline, not reckless aggression.",
    },
    coach: () => "CALM is not a license to overtrade — it means conditions support planned execution.",
  },
  {
    id: "decide-stress",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Desk tone STRESS",
    bridgePanel: "header-strip",
    region: "desk-tone",
    decide: {
      prompt: "Desk tone shifts to STRESS · defensive posture. What changes?",
      options: [
        { id: "defensive", label: "Reduce size · widen stops · or stand aside", traits: ["Respects STRESS", "Protects capital"], correct: true },
        { id: "same", label: "Same behavior — tone doesn't matter", traits: ["Ignores context"], correct: false },
        { id: "double", label: "Double size — volatility means opportunity", traits: ["Compounds risk"], correct: false },
      ],
      explanation: "STRESS demands defensive posture — behavior must change when conditions deteriorate.",
    },
    coach: () => "Professional operators change behavior when desk tone shifts — amateurs don't.",
  },
  {
    id: "coach-examples",
    mode: "explain",
    chapter: "OPERATOR COACH",
    title: "Live Desk alerts",
    bridgePanel: "header-strip",
    region: "panel",
    coach: (ctx) => {
      const line = LiveDeskCoach.alertLine(ctx);
      return `${line} Coach examples: Session transition approaching. Funding window nearing. Conditions becoming unstable. Liquidity conditions deteriorating.`;
    },
    whyCare: () => "Live Desk interprets the market so you maintain awareness instead of reacting blind.",
  },
  {
    id: "recognize-funding",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find funding countdown",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-funding",
    recognize: {
      prompt: "Click the FND funding countdown.",
      accept: ["funding"],
      nudge: "Header strip → FND timer (e.g. FND 12:34).",
    },
    coach: () => "Click the funding countdown in the header strip.",
  },
  {
    id: "recognize-session-countdown",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find session countdown",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-session-countdown",
    recognize: {
      prompt: "Click the next session countdown.",
      accept: ["session-countdown"],
      nudge: "Header strip → next session label + timer (e.g. US OPEN 45:00).",
    },
    coach: () => "Click the session transition countdown.",
  },
  {
    id: "recognize-desk-tone",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find desk tone",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-desk-tone",
    recognize: {
      prompt: "Click the desk tone line.",
      accept: ["desk-tone"],
      nudge: "Header strip → CALM / ACTIVE / THIN / FUNDING WINDOW / STRESS line.",
    },
    coach: () => "Click the desk tone indicator.",
  },
  {
    id: "recognize-session",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find active session",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-session",
    recognize: {
      prompt: "Click the active session label.",
      accept: ["session"],
      nudge: "Header strip → leftmost session label (e.g. US SESSION).",
    },
    coach: () => "Click the active session label.",
  },
  {
    id: "recognize-volatility",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find volatility state",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-volatility",
    recognize: {
      prompt: "Click the volatility readout.",
      accept: ["volatility"],
      nudge: "Header strip → VOL readout (e.g. ELEVATED, COMPRESSED).",
    },
    coach: () => "Click the volatility state in the market state cluster.",
  },
  {
    id: "recognize-liquidity",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find liquidity state",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-liquidity",
    recognize: {
      prompt: "Click the liquidity readout.",
      accept: ["liquidity"],
      nudge: "Header strip → LIQ readout (e.g. DEEP, THIN).",
    },
    coach: () => "Click the liquidity state in the market state cluster.",
  },
  {
    id: "recognize-risk",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find risk-on/off",
    bridgePanel: "header-strip",
    region: null,
    conceptId: "identify-risk",
    recognize: {
      prompt: "Click the risk-on/off readout.",
      accept: ["risk"],
      nudge: "Header strip → RISK-ON / RISK-OFF / NEUTRAL readout.",
    },
    coach: () => "Click the risk-on-off indicator.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Live Desk certified",
    bridgePanel: "header-strip",
    region: "panel",
    conceptId: "live-desk-certified",
    coach: () =>
      "You know what Live Desk is, why it exists, what every component means, and how professionals use it throughout the day. LIVE DESK CERTIFIED.",
  },
];
