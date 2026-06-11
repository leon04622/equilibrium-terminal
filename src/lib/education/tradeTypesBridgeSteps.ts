import { LiveTradeTypesCoach } from "@/lib/education/liveTradeTypesCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";
import type { TicketContext } from "@/lib/education/liveTradeTypesCoach";

/** TRADE TYPES LEARNING TEMPLATE V1 — live trade ticket bridge. */

export type TradeTypesRegion =
  | "panel"
  | "mode-market"
  | "mode-limit"
  | "mode-stop"
  | "size"
  | "limit-price"
  | "stop-trigger"
  | null;

export type TradeTypesBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface TradeTypesRecognitionSpec {
  prompt: string;
  accept: Exclude<TradeTypesRegion, null>[];
  nudge: string;
}

export interface TradeTypesBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: TradeTypesBridgeMode;
  region: TradeTypesRegion;
  whyCare?: (ctx: TicketContext) => string;
  coach: (ctx: TicketContext) => string;
  recognize?: TradeTypesRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const TRADE_TYPES_BRIDGE_PANEL = "ticket";

export const TRADE_TYPES_REQUIRED_CONCEPTS = [
  "identify-market",
  "identify-limit",
  "identify-stop",
  "trade-types-pretrade-ready",
  "trade-types-certified",
];

const MARKET_SIDE: CompareSide = {
  id: "market",
  title: "MARKET",
  good: true,
  traits: ["Instant execution", "Best when spread is tight", "Less price control"],
};

const LIMIT_SIDE: CompareSide = {
  id: "limit",
  title: "LIMIT",
  good: true,
  traits: ["Price control", "Better fills possible", "May not fill"],
};

export const TRADE_TYPES_BRIDGE_STEPS: TradeTypesBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TICKET",
    title: "Your trade ticket",
    region: "panel",
    coach: (ctx) => LiveTradeTypesCoach.todayReadout(ctx),
    whyCare: () => "Every live trade starts here — order type, size, and price controls.",
  },
  {
    id: "market-mode",
    mode: "explain",
    chapter: "MARKET ORDER",
    title: "Instant execution",
    region: "mode-market",
    coach: (ctx) => LiveTradeTypesCoach.marketAdvice(ctx).line,
    whyCare: () => "Market buys or sells immediately — use when speed matters and liquidity is good.",
  },
  {
    id: "limit-mode",
    mode: "explain",
    chapter: "LIMIT ORDER",
    title: "Price control",
    region: "mode-limit",
    coach: () => LiveTradeTypesCoach.limitAdvice(),
    whyCare: () => "Limit orders wait for your price — use when you want a better entry.",
  },
  {
    id: "stop-mode",
    mode: "explain",
    chapter: "STOP ORDER",
    title: "Trigger-based entry or exit",
    region: "mode-stop",
    coach: () => LiveTradeTypesCoach.stopAdvice(),
    whyCare: () => "Stops activate at a trigger — essential for protection and confirmed breakouts.",
  },
  {
    id: "size",
    mode: "explain",
    chapter: "POSITION SIZE",
    title: "How much to trade",
    region: "size",
    coach: () => "Size sets your exposure. Use presets or type a size — order type does not replace sizing discipline.",
    whyCare: () => "Wrong size hurts more than wrong order type. Set size before you submit.",
  },
  {
    id: "compare",
    mode: "compare",
    chapter: "TRADE-OFFS",
    title: "Market vs limit — which fits?",
    region: "panel",
    compare: { good: MARKET_SIDE, bad: LIMIT_SIDE },
    coach: () => "Market for speed when conditions are good. Limit when you need a specific price.",
  },
  {
    id: "decide-urgent",
    mode: "decide",
    chapter: "SCENARIO 1",
    title: "Tight spread, strong liquidity, need immediate entry",
    region: "panel",
    decide: {
      prompt: "Tight spread. Strong liquidity. You need immediate entry. Best choice?",
      options: [
        { id: "market", label: "Market order", traits: ["Instant fill", "Accept current spread"], correct: true },
        { id: "limit", label: "Limit far below", traits: ["May never fill", "Miss the move"], correct: false },
        { id: "stop", label: "Stop only", traits: ["Needs trigger", "Not for urgent entry"], correct: false },
      ],
      explanation: "Market order — liquidity and tight spread support an immediate entry. A distant limit may miss the trade.",
    },
    coach: () => "Speed + good liquidity → market.",
  },
  {
    id: "decide-support",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Price approaching support",
    region: "panel",
    decide: {
      prompt: "Price is approaching support. You want to buy at that level. Best choice?",
      options: [
        { id: "limit", label: "Limit at support", traits: ["Price control", "Fills if touched"], correct: true },
        { id: "market", label: "Market now", traits: ["Pays ask immediately", "No level control"], correct: false },
        { id: "stop", label: "Stop above market", traits: ["Breakout logic", "Not a support bid"], correct: false },
      ],
      explanation: "Limit order at support — you control entry price and only trade if the level is reached.",
    },
    coach: () => "Patient entry at a level → limit.",
  },
  {
    id: "decide-protect",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Already in a trade — need downside protection",
    region: "panel",
    decide: {
      prompt: "You are already in a long. You need downside protection. Best choice?",
      options: [
        { id: "stop", label: "Stop loss", traits: ["Triggers on drop", "Caps downside"], correct: true },
        { id: "limit", label: "Limit buy lower", traits: ["Adds exposure", "Not protection"], correct: false },
        { id: "market", label: "Market sell now", traits: ["Exits immediately", "Not conditional protection"], correct: false },
      ],
      explanation: "Stop order below your position — automates exit if price falls to your risk level.",
    },
    coach: () => "Open risk → stop for protection.",
  },
  {
    id: "pretrade",
    mode: "explain",
    chapter: "PRE-TRADE CHECK",
    title: "Three questions before you submit",
    region: "panel",
    coach: () => "Ask: instant execution? price control? protection? Then pick market, limit, or stop.",
  },
  {
    id: "recognize-market",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find the market order control",
    region: null,
    conceptId: "identify-market",
    recognize: {
      prompt: "Click the MARKET order type.",
      accept: ["mode-market"],
      nudge: "Top of the ticket — three buttons: market, limit, stop.",
    },
    coach: () => "Click market on the trade ticket.",
  },
  {
    id: "recognize-limit",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find the limit order control",
    region: null,
    conceptId: "identify-limit",
    recognize: {
      prompt: "Click the LIMIT order type.",
      accept: ["mode-limit"],
      nudge: "Limit is the middle toggle — it reveals the limit price field.",
    },
    coach: () => "Click limit on the trade ticket.",
  },
  {
    id: "recognize-stop",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find the stop order control",
    region: null,
    conceptId: "identify-stop",
    recognize: {
      prompt: "Click the STOP order type.",
      accept: ["mode-stop"],
      nudge: "Stop is the third toggle — it reveals the stop trigger field.",
    },
    coach: () => "Click stop on the trade ticket.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "TRADE TYPES CERTIFIED",
    region: null,
    conceptId: "trade-types-certified",
    coach: () =>
      "You can identify market, limit, and stop orders — and you know when to use each. You are ready to place trades with intention, not guesswork.",
  },
];
