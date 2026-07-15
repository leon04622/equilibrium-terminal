export type MacroFlowsBridgePanel = "macro" | "marketstate" | "dailybriefing";

export type MacroFlowsBridgeRegion =
  | "panel"
  | "regime-strip"
  | "macro-desk"
  | "tickers"
  | "stress-gauge"
  | "calendar"
  | "classification"
  | "desk-state"
  | "volatility"
  | "liquidity"
  | "signals"
  | "market-outlook"
  | "risk-outlook"
  | "guidance"
  | null;

export type MacroFlowsBridgeMode = "explain" | "recognize";

export interface MacroFlowsBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: MacroFlowsBridgeMode;
  bridgePanel: MacroFlowsBridgePanel;
  region: MacroFlowsBridgeRegion;
  coach: string;
  recognize?: { prompt: string; accept: Exclude<MacroFlowsBridgeRegion, null>[]; nudge: string };
  conceptId?: string;
}

export const MACRO_FLOWS_BRIDGE_PANEL = "macro";

export const MACRO_FLOWS_REQUIRED_CONCEPTS = [
  "macro-regime-flow",
  "macro-ticker-flow",
  "macro-stress-flow",
  "state-classification-flow",
  "state-volatility-flow",
  "briefing-risk-flow",
  "macro-flows-certified",
];

export const MACRO_FLOWS_BRIDGE_STEPS: MacroFlowsBridgeStep[] = [
  {
    id: "macro-intro",
    chapter: "LIVE · MACRO MATRIX",
    title: "Macro flow compass",
    mode: "explain",
    bridgePanel: "macro",
    region: "panel",
    coach:
      "Macro Matrix is your flow compass: regime strip, institutional headlines, ticker grid, stress gauge, and calendar. Read top-down before you interpret any single crypto move.",
    conceptId: "macro-regime-flow",
  },
  {
    id: "regime-strip",
    chapter: "LIVE · MACRO MATRIX",
    title: "Regime and stress header",
    mode: "recognize",
    bridgePanel: "macro",
    region: "regime-strip",
    coach:
      "The header shows regime label and stress score. Risk-off or liquidation regimes usually mean defensive sizing; risk-on favors trend continuation.",
    recognize: {
      prompt: "Select the regime strip",
      accept: ["regime-strip"],
      nudge: "Macro Matrix → top header (RISK-ON/OFF · STR)",
    },
    conceptId: "macro-regime-flow",
  },
  {
    id: "ticker-grid",
    chapter: "LIVE · MACRO MATRIX",
    title: "Live ticker flows",
    mode: "recognize",
    bridgePanel: "macro",
    region: "tickers",
    coach:
      "Ticker rows show where macro capital is moving — dollar, yields, indices. Crypto beta often follows dollar and rates; read the grid before you fade a move.",
    recognize: {
      prompt: "Select the macro ticker grid",
      accept: ["tickers", "panel"],
      nudge: "Macro Matrix → SYM / INSTRUMENT rows",
    },
    conceptId: "macro-ticker-flow",
  },
  {
    id: "stress-gauge",
    chapter: "LIVE · MACRO MATRIX",
    title: "Systemic stress bar",
    mode: "recognize",
    bridgePanel: "macro",
    region: "stress-gauge",
    coach:
      "Stress gauge and AI pulse compress systemic pressure. When the bar fills, flows are violent — cut size, widen stops, and avoid illiquid entries.",
    recognize: {
      prompt: "Select the stress gauge",
      accept: ["stress-gauge"],
      nudge: "Macro Matrix → STRESS GAUGE bar",
    },
    conceptId: "macro-stress-flow",
  },
  {
    id: "state-classification",
    chapter: "LIVE · MARKET STATE",
    title: "Desk behavior classification",
    mode: "recognize",
    bridgePanel: "marketstate",
    region: "classification",
    coach:
      "Market State classifies today's desk behavior — calm, stress, thin. Macro flows set the weather; this panel tells you how to walk in it.",
    recognize: {
      prompt: "Select market state classification",
      accept: ["classification", "desk-state"],
      nudge: "Market State → CALM / STRESS / THIN label",
    },
    conceptId: "state-classification-flow",
  },
  {
    id: "state-volatility",
    chapter: "LIVE · MARKET STATE",
    title: "Volatility signal",
    mode: "recognize",
    bridgePanel: "marketstate",
    region: "volatility",
    coach:
      "Volatility signal shows whether realized movement is expanding or compressing. Rising vol with rising macro stress = reduce leverage before you add.",
    recognize: {
      prompt: "Select the volatility signal",
      accept: ["volatility", "signals"],
      nudge: "Market State → VOL signal row",
    },
    conceptId: "state-volatility-flow",
  },
  {
    id: "briefing-risk",
    chapter: "LIVE · DAILY BRIEFING",
    title: "Risk outlook positioning",
    mode: "recognize",
    bridgePanel: "dailybriefing",
    region: "risk-outlook",
    coach:
      "Daily Briefing risk outlook translates macro flows into today's positioning guardrails. Read this before you size — it filters impulse trades against the flow map.",
    recognize: {
      prompt: "Select the risk outlook block",
      accept: ["risk-outlook", "market-outlook", "guidance"],
      nudge: "Daily Briefing → RISK OUTLOOK section",
    },
    conceptId: "briefing-risk-flow",
  },
  {
    id: "graduate",
    chapter: "GRADUATION",
    title: "Macro flows certified",
    mode: "explain",
    bridgePanel: "macro",
    region: "panel",
    coach:
      "You can now read regime, ticker direction, stress, market state, and briefing outlook as one macro flow stack. Combine with cross-market and execution modules before live entries.",
    conceptId: "macro-flows-certified",
  },
];
