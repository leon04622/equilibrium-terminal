export type MktStructBridgePanel = "chart" | "surveillance" | "domladder";

export type MktStructBridgeRegion =
  | "panel"
  | "regime"
  | "mid"
  | "regime-strip"
  | "movers"
  | "ladder"
  | null;

export type MktStructBridgeMode = "explain" | "recognize";

export interface MktStructBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: MktStructBridgeMode;
  bridgePanel: MktStructBridgePanel;
  region: MktStructBridgeRegion;
  coach: string;
  recognize?: { prompt: string; accept: Exclude<MktStructBridgeRegion, null>[]; nudge: string };
  conceptId?: string;
}

export const MARKET_STRUCTURE_BRIDGE_PANEL = "chart";

export const MARKET_STRUCTURE_REQUIRED_CONCEPTS = [
  "chart-regime-strip",
  "surveillance-regime",
  "surveillance-movers",
  "dom-ladder-depth",
  "structure-certified",
];

export const MARKET_STRUCTURE_BRIDGE_STEPS: MktStructBridgeStep[] = [
  {
    id: "chart-intro",
    chapter: "LIVE · CHART",
    title: "Structure on the chart",
    mode: "explain",
    bridgePanel: "chart",
    region: "panel",
    coach:
      "The chart panel shows price action with a live regime ribbon. Read swing highs and lows before drawing conclusions — structure is visible in price, not just indicators.",
    conceptId: "chart-regime-strip",
  },
  {
    id: "chart-regime",
    chapter: "LIVE · CHART",
    title: "Regime ribbon",
    mode: "recognize",
    bridgePanel: "chart",
    region: "regime",
    coach:
      "The top ribbon shows current market regime and stress. Trend-friendly regimes support continuation plays; stressed regimes demand defensive size.",
    recognize: {
      prompt: "Select the chart regime ribbon",
      accept: ["regime"],
      nudge: "Chart → top ribbon (regime label)",
    },
    conceptId: "chart-regime-strip",
  },
  {
    id: "surveillance-regime",
    chapter: "LIVE · SURVEILLANCE",
    title: "Cross-asset regime strip",
    mode: "recognize",
    bridgePanel: "surveillance",
    region: "regime-strip",
    coach:
      "Surveillance compresses regime, funding bias, stress, spread, and book imbalance. Use it to confirm whether your chart read matches the broader tape.",
    recognize: {
      prompt: "Open the surveillance regime strip",
      accept: ["regime-strip"],
      nudge: "Surveillance → REGIME / FUNDING / STRESS row",
    },
    conceptId: "surveillance-regime",
  },
  {
    id: "surveillance-movers",
    chapter: "LIVE · SURVEILLANCE",
    title: "Movers and rotation",
    mode: "recognize",
    bridgePanel: "surveillance",
    region: "movers",
    coach:
      "Movers show where volatility is concentrating. Breakouts often start in leaders; ranges often show muted mover dispersion. Click a mover to pivot the desk.",
    recognize: {
      prompt: "Select the movers row",
      accept: ["movers"],
      nudge: "Surveillance → MOVERS strip",
    },
    conceptId: "surveillance-movers",
  },
  {
    id: "dom-ladder",
    chapter: "LIVE · DOM LADDER",
    title: "Liquidity at the level",
    mode: "recognize",
    bridgePanel: "domladder",
    region: "ladder",
    coach:
      "The DOM ladder shows depth around mid — where size sits before your entry. In ranges, liquidity clusters at edges; in breaks, watch for thin air through the level.",
    recognize: {
      prompt: "Open the DOM ladder canvas",
      accept: ["ladder"],
      nudge: "DOM Ladder → depth canvas",
    },
    conceptId: "dom-ladder-depth",
  },
  {
    id: "graduate",
    chapter: "GRADUATION",
    title: "Market structure certified",
    mode: "explain",
    bridgePanel: "chart",
    region: "mid",
    coach:
      "You can now read trend, range, and breaks with the desk stack. Combine structure with market state and risk modules before sizing live entries.",
    conceptId: "structure-certified",
  },
];
