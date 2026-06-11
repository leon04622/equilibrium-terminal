import { LiveRiskManagementCoach } from "@/lib/education/liveRiskManagementCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";
import type { PortfolioDeskSnapshot } from "@/types/portfolio-risk-treasury";
import type { PortfolioDeskTab } from "@/store/usePortfolioDeskStore";

/** RISK MANAGEMENT LEARNING TEMPLATE V1 — ticket + portfolio desk bridge. */

export type RiskBridgePanel = "ticket" | "portfoliodesk";

export type RiskBridgeRegion =
  | "panel"
  | "size"
  | "size-presets"
  | "stop-trigger"
  | "mode-stop"
  | "leverage"
  | "risk-display"
  | "risk-tier"
  | "margin-util"
  | "leverage-ratio"
  | "max-drawdown"
  | null;

export type RiskBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface RiskRecognitionSpec {
  prompt: string;
  accept: Exclude<RiskBridgeRegion, null>[];
  nudge: string;
}

export interface RiskBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: RiskBridgeMode;
  bridgePanel: RiskBridgePanel;
  region: RiskBridgeRegion;
  portfolioTab?: PortfolioDeskTab;
  whyCare?: (s: PortfolioDeskSnapshot | null) => string;
  coach: (s: PortfolioDeskSnapshot | null) => string;
  recognize?: RiskRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const RISK_MANAGEMENT_BRIDGE_PANEL = "portfoliodesk";

export const RISK_MANAGEMENT_REQUIRED_CONCEPTS = [
  "identify-size",
  "identify-stop",
  "identify-margin-util",
  "identify-max-drawdown",
  "risk-management-pretrade-ready",
  "risk-management-certified",
];

const DISCIPLINED: CompareSide = {
  id: "disciplined",
  title: "TRADER B",
  good: true,
  traits: ["1–2% risk per trade", "Uses stops", "Survives drawdowns", "Stays in the game"],
};

const RECKLESS: CompareSide = {
  id: "reckless",
  title: "TRADER A",
  good: false,
  traits: ["5–10% risk per trade", "No stops", "Deep drawdowns", "Blown account"],
};

export const RISK_MANAGEMENT_BRIDGE_STEPS: RiskBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Protect capital first",
    bridgePanel: "ticket",
    region: "panel",
    coach: (s) => LiveRiskManagementCoach.todayReadout(s),
    whyCare: () => "Every live trade starts with size, stops, and how much you can lose — not how much you can make.",
  },
  {
    id: "position-size",
    mode: "explain",
    chapter: "POSITION SIZE",
    title: "How much to trade",
    bridgePanel: "ticket",
    region: "size",
    coach: (s) => LiveRiskManagementCoach.sizingAdvice(s),
    whyCare: () => "Same setup, different size — different damage when price moves against you.",
  },
  {
    id: "size-presets",
    mode: "explain",
    chapter: "SIZE PRESETS",
    title: "Percent of available capital",
    bridgePanel: "ticket",
    region: "size-presets",
    coach: () => "Presets help you avoid oversizing. Full account on one trade is not risk management.",
    whyCare: () => "Use presets to stay within a fraction of capital — not all-in on one idea.",
  },
  {
    id: "stop-mode",
    mode: "explain",
    chapter: "STOP LOSS",
    title: "Cap downside",
    bridgePanel: "ticket",
    region: "mode-stop",
    coach: () => LiveRiskManagementCoach.stopAdvice(),
    whyCare: () => "A stop exits on your terms — before a small loss becomes account damage.",
  },
  {
    id: "leverage",
    mode: "explain",
    chapter: "LEVERAGE",
    title: "Amplifies gains and losses",
    bridgePanel: "ticket",
    region: "leverage",
    coach: (s) =>
      s && s.risk.leverageRatio >= 5
        ? `Leverage ${s.risk.leverageRatio}x — higher leverage demands smaller size and tighter stops.`
        : "Leverage multiplies both wins and losses. Lower leverage = more room to survive.",
    whyCare: () => "High leverage with large size is how accounts blow up — even on good setups.",
  },
  {
    id: "portfolio-risk",
    mode: "explain",
    chapter: "PORTFOLIO RISK",
    title: "Read live risk tier",
    bridgePanel: "portfoliodesk",
    region: "risk-tier",
    portfolioTab: "risk",
    coach: (s) =>
      s
        ? `Risk tier ${s.risk.riskTier.toUpperCase()} — margin util ${s.risk.marginUtilizationPct}%. Check before adding exposure.`
        : "Portfolio desk → RISK tab → risk tier and margin utilization.",
    whyCare: () => "Your desk aggregates exposure — do not add size when util is already elevated.",
  },
  {
    id: "margin-util",
    mode: "explain",
    chapter: "MARGIN UTIL",
    title: "How much buffer remains",
    bridgePanel: "portfoliodesk",
    region: "margin-util",
    portfolioTab: "risk",
    coach: (s) => LiveRiskManagementCoach.sizingAdvice(s),
    whyCare: () => "High margin util means less room for adverse moves — size down or stand aside.",
  },
  {
    id: "drawdown",
    mode: "explain",
    chapter: "DRAWDOWN",
    title: "Recovery gets harder",
    bridgePanel: "portfoliodesk",
    region: "max-drawdown",
    portfolioTab: "analytics",
    coach: (s) => LiveRiskManagementCoach.drawdownAdvice(s),
    whyCare: () => "A 50% drawdown needs a 100% gain to recover. Avoid deep holes.",
  },
  {
    id: "compare",
    mode: "compare",
    chapter: "SURVIVAL",
    title: "Which trader survives longer?",
    bridgePanel: "ticket",
    region: "panel",
    compare: { good: DISCIPLINED, bad: RECKLESS },
    coach: () => "Trader B wins less often but controls risk — and survives longer.",
  },
  {
    id: "decide-risk-pct",
    mode: "decide",
    chapter: "SCENARIO 1",
    title: "How much to risk per trade?",
    bridgePanel: "ticket",
    region: "panel",
    decide: {
      prompt: "You have a £10,000 account. How much should you risk on a single trade?",
      options: [
        { id: "one", label: "1% (£100)", traits: ["Survives 10 losses in a row", "Industry standard"], correct: true },
        { id: "five", label: "5% (£500)", traits: ["5 losses = 25% drawdown", "Recovery harder"], correct: false },
        { id: "ten", label: "10% (£1,000)", traits: ["3 losses = 30%+ drawdown", "Account at risk"], correct: false },
      ],
      explanation: "1% per trade — you can absorb a string of losses and stay in the game.",
    },
    coach: () => "Small risk per trade → survival.",
  },
  {
    id: "decide-stop",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Trade moving against you",
    bridgePanel: "ticket",
    region: "panel",
    decide: {
      prompt: "Your long is down 3%. You have no stop. Price keeps falling. Best action?",
      options: [
        { id: "stop", label: "Exit now / set stop", traits: ["Cap loss", "Protect capital"], correct: true },
        { id: "hold", label: "Hold — it will come back", traits: ["Hope is not a strategy", "Drawdown deepens"], correct: false },
        { id: "add", label: "Add to the position", traits: ["More exposure", "Blow-up risk"], correct: false },
      ],
      explanation: "Exit or honor your stop — protecting capital beats hoping for a reversal.",
    },
    coach: () => "No stop + hope = how accounts die.",
  },
  {
    id: "decide-survival",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Which trader survives longer?",
    bridgePanel: "ticket",
    region: "panel",
    decide: {
      prompt: "Trader A: 70% win rate, risks 8% per trade. Trader B: 45% win rate, risks 1.5% per trade. Who survives?",
      options: [
        { id: "b", label: "Trader B", traits: ["Controls risk", "Survives drawdowns"], correct: true },
        { id: "a", label: "Trader A", traits: ["High win rate", "Few losses wipe gains"], correct: false },
        { id: "tie", label: "About the same", traits: ["Ignores compounding losses"], correct: false },
      ],
      explanation: "Trader B — win rate does not matter if one loss can erase weeks of gains.",
    },
    coach: () => "Survival beats win rate.",
  },
  {
    id: "pre-risk",
    mode: "explain",
    chapter: "PRE-TRADE RISK",
    title: "Five questions before you submit",
    bridgePanel: "ticket",
    region: "panel",
    coach: () => "Ask: size? stop? risk %? reward:risk? drawdown room? Then submit.",
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
      prompt: "Click the size input on the trade ticket.",
      accept: ["size"],
      nudge: "Trade ticket → Size field below order type.",
    },
    coach: () => "Click size on the ticket.",
  },
  {
    id: "recognize-stop",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find stop trigger",
    bridgePanel: "ticket",
    region: null,
    conceptId: "identify-stop",
    recognize: {
      prompt: "Click the STOP order type on the trade ticket.",
      accept: ["mode-stop", "stop-trigger"],
      nudge: "Trade ticket → STOP button (third mode toggle). Then click stop trigger if shown.",
    },
    coach: () => "Click stop on the ticket.",
  },
  {
    id: "recognize-margin",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find margin utilization",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "risk",
    conceptId: "identify-margin-util",
    recognize: {
      prompt: "Click margin utilization on the portfolio desk.",
      accept: ["margin-util"],
      nudge: "Portfolio desk → RISK tab → Margin util row.",
    },
    coach: () => "Click margin util.",
  },
  {
    id: "recognize-drawdown",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find max drawdown",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "analytics",
    conceptId: "identify-max-drawdown",
    recognize: {
      prompt: "Click max drawdown on the portfolio desk.",
      accept: ["max-drawdown"],
      nudge: "Portfolio desk → PNL tab → Max drawdown row.",
    },
    coach: () => "Click max drawdown.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Risk management understood",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "risk",
    conceptId: "risk-management-certified",
    coach: () =>
      "You understand sizing, stops, risk per trade, drawdowns, and survival. Ask before every trade: how much can I lose?",
  },
];
