import { LiveLiquidationsCoach } from "@/lib/education/liveLiquidationsCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";
import type { DerivativesIntelligenceSnapshot } from "@/types/derivatives-intelligence";
import type { DerivativesDeskTab } from "@/store/useDerivativesDeskStore";
import type { PortfolioDeskTab } from "@/store/usePortfolioDeskStore";

/** LIQUIDATIONS LEARNING TEMPLATE V1 — multi-panel live bridge (desk + ticket + portfolio). */

export type LiqBridgePanel = "derivdesk" | "ticket" | "portfoliodesk";

export type LiqBridgeRegion =
  | "panel"
  | "liq"
  | "crowding"
  | "leverage-conc"
  | "leverage-sat"
  | "fragility"
  | "vol-regime"
  | "leverage"
  | "size"
  | "liq-proximity"
  | null;

export type LiqBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface LiqRecognitionSpec {
  prompt: string;
  accept: Exclude<LiqBridgeRegion, null>[];
  nudge: string;
}

export interface LiqBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: LiqBridgeMode;
  bridgePanel: LiqBridgePanel;
  region: LiqBridgeRegion;
  derivTab?: DerivativesDeskTab;
  portfolioTab?: PortfolioDeskTab;
  whyCare?: (s: DerivativesIntelligenceSnapshot | null) => string;
  coach: (s: DerivativesIntelligenceSnapshot | null) => string;
  recognize?: LiqRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const LIQUIDATIONS_BRIDGE_PANEL = "derivdesk";

export const LIQUIDATIONS_REQUIRED_CONCEPTS = [
  "check-liq-pressure",
  "check-crowding-liq",
  "check-leverage-risk",
  "check-volatility-liq",
  "check-liq-distance",
  "liquidations-pre-risk-ready",
  "liquidations-certified",
];

const LOW_LEV: CompareSide = {
  id: "low",
  title: "2x LEVERAGE",
  good: true,
  traits: ["Wide liquidation buffer", "Survives normal volatility", "Professional default"],
};

const HIGH_LEV: CompareSide = {
  id: "high",
  title: "20x LEVERAGE",
  good: false,
  traits: ["Thin margin buffer", "Liquidated on small moves", "Cascade fuel"],
};

export const LIQUIDATIONS_BRIDGE_STEPS: LiqBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Liquidation risk right now",
    bridgePanel: "derivdesk",
    region: "panel",
    derivTab: "funding",
    coach: (s) => LiveLiquidationsCoach.todayReadout(s),
    whyCare: () => "Read liquidation conditions before every leveraged entry.",
  },
  {
    id: "ticket-leverage",
    mode: "explain",
    chapter: "LEVERAGE CONTROL",
    title: "Leverage on the trade ticket",
    bridgePanel: "ticket",
    region: "leverage",
    coach: () => "Leverage multiplies exposure. Lower leverage = more room before forced exit.",
    whyCare: () => "This is where you set how much risk you take per pound of margin.",
  },
  {
    id: "ticket-size",
    mode: "explain",
    chapter: "POSITION SIZE",
    title: "Size controls exposure",
    bridgePanel: "ticket",
    region: "size",
    coach: () => "Size sets how much you trade. Combined with leverage, it defines liquidation distance.",
    whyCare: () => "Oversized positions liquidate faster — size is risk control.",
  },
  {
    id: "live-liq",
    mode: "explain",
    chapter: "LIQ FEED",
    title: "Liquidation pressure",
    bridgePanel: "derivdesk",
    region: "liq",
    derivTab: "funding",
    coach: (s) => LiveLiquidationsCoach.liqPressure(s).line,
    whyCare: () => "Rising liq pressure means forced exits are more likely on adverse moves.",
  },
  {
    id: "live-crowd",
    mode: "explain",
    chapter: "CROWDING",
    title: "Crowding indicator",
    bridgePanel: "derivdesk",
    region: "crowding",
    derivTab: "funding",
    coach: (s) => LiveLiquidationsCoach.crowdingRisk(s),
    whyCare: () => "Crowded positioning fuels squeezes and cascades.",
  },
  {
    id: "live-vol",
    mode: "explain",
    chapter: "VOLATILITY",
    title: "Volatility regime",
    bridgePanel: "derivdesk",
    region: "vol-regime",
    derivTab: "vol",
    coach: (s) =>
      s
        ? `Volatility regime: ${s.volatility.regime}. High vol shrinks effective liquidation distance.`
        : "Volatility data loading.",
    whyCare: () => "Volatile markets hit liquidation levels faster.",
  },
  {
    id: "liq-distance",
    mode: "explain",
    chapter: "LIQ DISTANCE",
    title: "Liquidation proximity",
    bridgePanel: "portfoliodesk",
    region: "liq-proximity",
    portfolioTab: "collateral",
    coach: () => "Liquidation proximity shows how close your account is to forced exits at portfolio level.",
    whyCare: () => "Know your distance before you add risk.",
  },
  {
    id: "compare-lev",
    mode: "compare",
    chapter: "SURVIVAL CHECK",
    title: "2x vs 20x — same setup",
    bridgePanel: "derivdesk",
    region: "panel",
    derivTab: "funding",
    compare: { good: LOW_LEV, bad: HIGH_LEV },
    coach: () => "Ask: would I survive normal market volatility with this position?",
  },
  {
    id: "decide-survive",
    mode: "decide",
    chapter: "OPERATOR DECISION",
    title: "Who survives normal volatility?",
    bridgePanel: "derivdesk",
    region: "panel",
    derivTab: "funding",
    decide: {
      prompt: "Trader A: 2x leverage. Trader B: 20x leverage. Same setup. Who survives normal volatility?",
      options: [
        { id: "a", label: "Trader A (2x)", traits: ["Wide buffer", "Lower liq risk"], correct: true },
        { id: "b", label: "Trader B (20x)", traits: ["Thin buffer", "Liq on small moves"], correct: false },
      ],
      explanation: "Trader A — lower leverage leaves margin room. Trader B is one adverse move from forced exit.",
    },
    coach: () => "Professionals size leverage for survival, not maximum exposure.",
  },
  {
    id: "decide-squeeze",
    mode: "decide",
    chapter: "OPERATOR DECISION",
    title: "Crowded shorts, price rises",
    bridgePanel: "derivdesk",
    region: "panel",
    derivTab: "funding",
    decide: {
      prompt: "Crowded shorts. Price begins to rise. What accelerates first?",
      options: [
        { id: "squeeze", label: "Short liquidations", traits: ["Forced buying", "Price accelerates up"], correct: true },
        { id: "calm", label: "Nothing happens", traits: ["Ignores crowding"], correct: false },
      ],
      explanation: "Short liquidations force buying into the rally — squeezes accelerate when shorts are stacked.",
    },
    coach: () => "Crowding + adverse move = cascade fuel.",
  },
  {
    id: "pre-risk",
    mode: "explain",
    chapter: "PRE-RISK CHECK",
    title: "Checklist before entry",
    bridgePanel: "derivdesk",
    region: "panel",
    derivTab: "funding",
    coach: () => "Check leverage, stop loss, liquidation distance, crowding, and volatility — every time.",
  },
  {
    id: "recognize-liq",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find liquidation pressure",
    bridgePanel: "derivdesk",
    region: null,
    derivTab: "funding",
    conceptId: "check-liq-pressure",
    recognize: {
      prompt: "Click liquidation pressure.",
      accept: ["liq"],
      nudge: "Derivatives desk → FUNDING tab → Liq pressure.",
    },
    coach: () => "Click liq pressure.",
  },
  {
    id: "recognize-crowd",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find crowding",
    bridgePanel: "derivdesk",
    region: null,
    derivTab: "funding",
    conceptId: "check-crowding-liq",
    recognize: {
      prompt: "Click the crowding row.",
      accept: ["crowding"],
      nudge: "FUNDING tab → Crowding.",
    },
    coach: () => "Click crowding.",
  },
  {
    id: "recognize-lev",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find leverage control",
    bridgePanel: "ticket",
    region: null,
    conceptId: "check-leverage-risk",
    recognize: {
      prompt: "Click leverage on the trade ticket.",
      accept: ["leverage"],
      nudge: "Trade ticket → leverage row (1x, 2x, 5x…).",
    },
    coach: () => "Click leverage on the ticket.",
  },
  {
    id: "recognize-vol",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find volatility regime",
    bridgePanel: "derivdesk",
    region: null,
    derivTab: "vol",
    conceptId: "check-volatility-liq",
    recognize: {
      prompt: "Click the volatility regime row.",
      accept: ["vol-regime"],
      nudge: "Derivatives desk → VOL tab → Regime.",
    },
    coach: () => "Click vol regime.",
  },
  {
    id: "recognize-liq-dist",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find liquidation proximity",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "collateral",
    conceptId: "check-liq-distance",
    recognize: {
      prompt: "Click liquidation proximity.",
      accept: ["liq-proximity"],
      nudge: "Portfolio desk → COLLATERAL tab → Liq proximity.",
    },
    coach: () => "Click liq proximity.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Liquidations understood",
    bridgePanel: "derivdesk",
    region: null,
    derivTab: "funding",
    conceptId: "liquidations-certified",
    coach: () =>
      "You understand leverage, margin, liquidations, cascades, and where to read risk live. Next: Risk Management.",
  },
];
