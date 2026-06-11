import { LiveSlippageCoach, type SlipContext } from "@/lib/education/liveSlippageCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

/** SLIPPAGE LEARNING TEMPLATE V1 — order book + slippage radar + trade ticket bridge. */

export type SlipBridgePanel = "hyperbook" | "slippageradar" | "ticket";

export type SlipBridgeRegion =
  | "panel"
  | "spread"
  | "bids"
  | "asks"
  | "slip-bps"
  | "spread-bps"
  | "risk-tier"
  | "exec-context"
  | "mode-market"
  | "size"
  | null;

export type SlipBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface SlipRecognitionSpec {
  prompt: string;
  accept: Exclude<SlipBridgeRegion, null>[];
  nudge: string;
}

export interface SlipBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: SlipBridgeMode;
  bridgePanel: SlipBridgePanel;
  region: SlipBridgeRegion;
  whyCare?: (ctx: SlipContext) => string;
  coach: (ctx: SlipContext) => string;
  recognize?: SlipRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const SLIPPAGE_BRIDGE_PANEL = "slippageradar";

export const SLIPPAGE_REQUIRED_CONCEPTS = [
  "identify-spread",
  "identify-liquidity",
  "identify-slip-metric",
  "identify-market-order",
  "slippage-pretrade-ready",
  "slippage-certified",
];

const GOOD_EXEC: CompareSide = {
  id: "good",
  title: "GOOD EXECUTION",
  good: true,
  traits: ["Strong liquidity", "Tight spread", "Stable market", "Small size"],
};

const BAD_EXEC: CompareSide = {
  id: "bad",
  title: "BAD EXECUTION",
  good: false,
  traits: ["Thin liquidity", "Wide spread", "Volatile conditions", "Oversized market order"],
};

export const SLIPPAGE_BRIDGE_STEPS: SlipBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Execution quality matters",
    bridgePanel: "hyperbook",
    region: "panel",
    coach: (ctx) => LiveSlippageCoach.todayReadout(ctx),
    whyCare: () => "The price on screen is an indication — not a promise. Slippage is the gap between expectation and reality.",
  },
  {
    id: "spread",
    mode: "explain",
    chapter: "SPREAD",
    title: "Cost of immediacy",
    bridgePanel: "hyperbook",
    region: "spread",
    coach: (ctx) => LiveSlippageCoach.spreadAdvice(ctx),
    whyCare: () => "Wide spread means you pay more the moment you execute.",
  },
  {
    id: "liquidity-bids",
    mode: "explain",
    chapter: "LIQUIDITY",
    title: "Bid depth",
    bridgePanel: "hyperbook",
    region: "bids",
    coach: (ctx) => LiveSlippageCoach.liquidityAdvice(ctx),
    whyCare: () => "Depth shows how much size the book can absorb before price moves.",
  },
  {
    id: "liquidity-asks",
    mode: "explain",
    chapter: "LIQUIDITY",
    title: "Ask depth",
    bridgePanel: "hyperbook",
    region: "asks",
    coach: (ctx) => LiveSlippageCoach.liquidityAdvice(ctx),
    whyCare: () => "Market buys consume asks — thin asks mean worse fills.",
  },
  {
    id: "slip-metric",
    mode: "explain",
    chapter: "SLIPPAGE RADAR",
    title: "Estimated slippage",
    bridgePanel: "slippageradar",
    region: "slip-bps",
    coach: (ctx) => LiveSlippageCoach.slipRadarAdvice(ctx),
    whyCare: () => "Live slippage estimate reflects spread, velocity, and book quality.",
  },
  {
    id: "slip-spread",
    mode: "explain",
    chapter: "SLIPPAGE RADAR",
    title: "Spread in basis points",
    bridgePanel: "slippageradar",
    region: "spread-bps",
    coach: (ctx) => LiveSlippageCoach.spreadAdvice(ctx),
    whyCare: () => "Radar spread should align with the book — divergence signals stress.",
  },
  {
    id: "slip-risk",
    mode: "explain",
    chapter: "SLIPPAGE RADAR",
    title: "Slippage risk tier",
    bridgePanel: "slippageradar",
    region: "risk-tier",
    coach: (ctx) => LiveSlippageCoach.slipRadarAdvice(ctx),
    whyCare: () => "Elevated risk tier means execution quality may deteriorate.",
  },
  {
    id: "exec-context",
    mode: "explain",
    chapter: "EXECUTION CONTEXT",
    title: "Pre-trade execution strip",
    bridgePanel: "ticket",
    region: "exec-context",
    coach: (ctx) => LiveSlippageCoach.todayReadout(ctx),
    whyCare: () => "Spread and slip tier on the ticket remind you before every submit.",
  },
  {
    id: "market-order",
    mode: "explain",
    chapter: "ORDER TYPE",
    title: "Market order slippage",
    bridgePanel: "ticket",
    region: "mode-market",
    coach: () => LiveSlippageCoach.marketOrderAdvice(),
    whyCare: () => "Market orders sacrifice price for speed — dangerous when liquidity is thin.",
  },
  {
    id: "compare",
    mode: "compare",
    chapter: "EXECUTION QUALITY",
    title: "Good vs bad conditions",
    bridgePanel: "hyperbook",
    region: "panel",
    compare: { good: GOOD_EXEC, bad: BAD_EXEC },
    coach: () => "Good conditions: tight spread, strong depth, stable vol. Bad: thin book, wide spread, chaos.",
  },
  {
    id: "decide-liquidity",
    mode: "decide",
    chapter: "SCENARIO 1",
    title: "Where to place a large order?",
    bridgePanel: "hyperbook",
    region: "panel",
    decide: {
      prompt: "You need to buy a large position. Book A: tight spread, deep asks. Book B: wide spread, thin asks. Where?",
      options: [
        { id: "a", label: "Book A — deep liquidity", traits: ["Less slippage", "Absorbs size"], correct: true },
        { id: "b", label: "Book B — thin book", traits: ["High slippage", "Price walks"], correct: false },
        { id: "c", label: "Same either way", traits: ["Ignores depth"], correct: false },
      ],
      explanation: "Book A — depth absorbs size with minimal price impact. Book B walks levels.",
    },
    coach: () => "Depth matters for size.",
  },
  {
    id: "decide-order-type",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Volatile, thin book — which order?",
    bridgePanel: "ticket",
    region: "panel",
    decide: {
      prompt: "Spread is wide, volatility elevated, you are not in a rush. Best approach?",
      options: [
        { id: "limit", label: "Limit order", traits: ["Price control", "Patience"], correct: true },
        { id: "market", label: "Market order", traits: ["Maximum slippage risk", "Fast but costly"], correct: false },
        { id: "large-market", label: "Large market order", traits: ["Worst fill quality"], correct: false },
      ],
      explanation: "Limit order — control price when conditions are poor. Market orders pay the spread and walk the book.",
    },
    coach: () => "Poor conditions → limits and patience.",
  },
  {
    id: "decide-size",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Slippage risk elevated — what now?",
    bridgePanel: "slippageradar",
    region: "panel",
    decide: {
      prompt: "Slippage radar shows HIGH risk. You still want exposure. Best action?",
      options: [
        { id: "reduce", label: "Reduce size", traits: ["Less book impact", "Lower slip"], correct: true },
        { id: "full", label: "Full size market order", traits: ["Ignores radar", "Poor fill"], correct: false },
        { id: "ignore", label: "Ignore — price is guaranteed", traits: ["False assumption"], correct: false },
      ],
      explanation: "Reduce size when slippage risk is high — or wait for better conditions.",
    },
    coach: () => "Elevated slip risk → smaller size or stand aside.",
  },
  {
    id: "pre-slip",
    mode: "explain",
    chapter: "PRE-TRADE CHECK",
    title: "Five checks before you submit",
    bridgePanel: "ticket",
    region: "panel",
    coach: () => "Liquidity, spread, volatility, size, order type — then submit.",
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
      nudge: "Order book → mid strip between bids and asks (SPR).",
    },
    coach: () => "Click spread on the book.",
  },
  {
    id: "recognize-liquidity",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find ask liquidity",
    bridgePanel: "hyperbook",
    region: null,
    conceptId: "identify-liquidity",
    recognize: {
      prompt: "Click the ask side of the order book.",
      accept: ["asks"],
      nudge: "Order book → ASK column (red side). Market buys consume asks.",
    },
    coach: () => "Click asks on the book.",
  },
  {
    id: "recognize-slip",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find slippage estimate",
    bridgePanel: "slippageradar",
    region: null,
    conceptId: "identify-slip-metric",
    recognize: {
      prompt: "Click the SLIP metric on slippage radar.",
      accept: ["slip-bps"],
      nudge: "Slippage radar → top row → SLIP (basis points).",
    },
    coach: () => "Click SLIP on the radar.",
  },
  {
    id: "recognize-market",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find market order type",
    bridgePanel: "ticket",
    region: null,
    conceptId: "identify-market-order",
    recognize: {
      prompt: "Click MARKET on the trade ticket.",
      accept: ["mode-market"],
      nudge: "Trade ticket → first order mode button (MARKET).",
    },
    coach: () => "Click market on the ticket.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Slippage understood",
    bridgePanel: "slippageradar",
    region: null,
    conceptId: "slippage-certified",
    coach: () =>
      "You understand slippage, liquidity, spread, volatility impact, and how to reduce poor fills. Stop assuming click price equals fill price.",
  },
];
