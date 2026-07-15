export type IntelligenceDeskBridgePanel = "intelligence" | "surveillance" | "operatormode";

export type IntelligenceDeskBridgeRegion =
  | "panel"
  | "feed"
  | "regime-strip"
  | "movers"
  | "headlines"
  | "watchlist"
  | "guidance"
  | "phases"
  | "tasks"
  | null;

export type IntelligenceDeskBridgeMode = "explain" | "recognize";

export interface IntelligenceDeskBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: IntelligenceDeskBridgeMode;
  bridgePanel: IntelligenceDeskBridgePanel;
  region: IntelligenceDeskBridgeRegion;
  coach: string;
  recognize?: { prompt: string; accept: Exclude<IntelligenceDeskBridgeRegion, null>[]; nudge: string };
  conceptId?: string;
}

export const INTELLIGENCE_DESK_BRIDGE_PANEL = "intelligence";

export const INTELLIGENCE_DESK_REQUIRED_CONCEPTS = [
  "wire-feed",
  "surveillance-regime",
  "surveillance-movers",
  "surveillance-headlines",
  "operator-guidance",
  "operator-phases",
  "intelligence-desk-certified",
];

export const INTELLIGENCE_DESK_BRIDGE_STEPS: IntelligenceDeskBridgeStep[] = [
  {
    id: "wire-intro",
    chapter: "LIVE · TACTICAL WIRE",
    title: "Real-time vectors",
    mode: "explain",
    bridgePanel: "intelligence",
    region: "panel",
    coach:
      "Tactical Wire is the fastest channel on the desk. Connection status, vector count, and confidence pulse tell you if the feed is live before you trust any headline.",
    conceptId: "wire-feed",
  },
  {
    id: "wire-feed",
    chapter: "LIVE · TACTICAL WIRE",
    title: "Scrolling vector feed",
    mode: "recognize",
    bridgePanel: "intelligence",
    region: "feed",
    coach:
      "Each row shows time, symbol, direction, confidence, and acceleration. Critical items flash — click to pivot the desk or open the article. This is your first intelligence read.",
    recognize: {
      prompt: "Select the tactical wire feed",
      accept: ["feed"],
      nudge: "Tactical Wire → scrolling headline feed",
    },
    conceptId: "wire-feed",
  },
  {
    id: "surveillance-regime",
    chapter: "LIVE · MARKET SURVEILLANCE",
    title: "Composite regime strip",
    mode: "recognize",
    bridgePanel: "surveillance",
    region: "regime-strip",
    coach:
      "The surveillance strip compresses regime, funding bias, stress, spread, imbalance, and nearest liquidation zone. When multiple fields shift together, treat it as a desk-wide alert.",
    recognize: {
      prompt: "Select the surveillance regime strip",
      accept: ["regime-strip"],
      nudge: "Market Surveillance → REGIME / FUNDING / STRESS row",
    },
    conceptId: "surveillance-regime",
  },
  {
    id: "surveillance-movers",
    chapter: "LIVE · MARKET SURVEILLANCE",
    title: "Session movers",
    mode: "recognize",
    bridgePanel: "surveillance",
    region: "movers",
    coach:
      "Movers show which symbols are leading or lagging the session. Click a mover to pivot the workspace — leadership often appears here before your chart lags.",
    recognize: {
      prompt: "Select the movers row",
      accept: ["movers"],
      nudge: "Market Surveillance → MOVERS strip",
    },
    conceptId: "surveillance-movers",
  },
  {
    id: "surveillance-headlines",
    chapter: "LIVE · MARKET SURVEILLANCE",
    title: "What matters now",
    mode: "recognize",
    bridgePanel: "surveillance",
    region: "headlines",
    coach:
      "What Matters Now is the editorial layer — curated surveillance headlines ranked by signal. Use this after wire to confirm what deserves deeper investigation.",
    recognize: {
      prompt: "Select curated headlines",
      accept: ["headlines", "watchlist"],
      nudge: "Market Surveillance → WHAT MATTERS NOW section",
    },
    conceptId: "surveillance-headlines",
  },
  {
    id: "operator-guidance",
    chapter: "LIVE · OPERATOR MODE",
    title: "Live guidance strip",
    mode: "recognize",
    bridgePanel: "operatormode",
    region: "guidance",
    coach:
      "Operator Mode guidance tells you the current task and score. Intelligence without workflow discipline creates impulse trades — this panel keeps you on the daily checklist.",
    recognize: {
      prompt: "Select operator guidance",
      accept: ["guidance", "panel"],
      nudge: "Operator Mode → top guidance / CURRENT task strip",
    },
    conceptId: "operator-guidance",
  },
  {
    id: "operator-phases",
    chapter: "LIVE · OPERATOR MODE",
    title: "Morning · trading · review",
    mode: "recognize",
    bridgePanel: "operatormode",
    region: "phases",
    coach:
      "Phase tabs structure the operator day: morning prep, pre-trade gates, and review. Complete morning before tickets — this is how professional desks convert intel into action.",
    recognize: {
      prompt: "Select phase navigation",
      accept: ["phases", "tasks"],
      nudge: "Operator Mode → MORNING / TRADING / REVIEW tabs",
    },
    conceptId: "operator-phases",
  },
  {
    id: "graduate",
    chapter: "GRADUATION",
    title: "Intelligence desk certified",
    mode: "explain",
    bridgePanel: "intelligence",
    region: "panel",
    coach:
      "You can now run wire, surveillance, and operator workflow as one intelligence desk. Professional path complete — combine with cross-market, macro flows, and execution before live entries.",
    conceptId: "intelligence-desk-certified",
  },
];
