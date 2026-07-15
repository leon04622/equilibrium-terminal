export type CrossMarketBridgePanel = "marketcoverage" | "macro" | "intelligence";

export type CrossMarketBridgeRegion =
  | "panel"
  | "venues"
  | "venue-row"
  | "regime-strip"
  | "macro-desk"
  | "feed"
  | null;

export type CrossMarketBridgeMode = "explain" | "recognize";

export interface CrossMarketBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: CrossMarketBridgeMode;
  bridgePanel: CrossMarketBridgePanel;
  region: CrossMarketBridgeRegion;
  coach: string;
  recognize?: { prompt: string; accept: Exclude<CrossMarketBridgeRegion, null>[]; nudge: string };
  conceptId?: string;
}

export const CROSS_MARKET_BRIDGE_PANEL = "marketcoverage";

export const CROSS_MARKET_REQUIRED_CONCEPTS = [
  "coverage-venues",
  "macro-regime-strip",
  "macro-desk-feed",
  "intelligence-wire-feed",
  "cross-market-certified",
];

export const CROSS_MARKET_BRIDGE_STEPS: CrossMarketBridgeStep[] = [
  {
    id: "coverage-intro",
    chapter: "LIVE · MARKET COVERAGE",
    title: "Venue operations map",
    mode: "explain",
    bridgePanel: "marketcoverage",
    region: "panel",
    coach:
      "Market Coverage lists venues with live, staged, or degraded status. Before routing size, confirm your symbol's authoritative venue is operational.",
    conceptId: "coverage-venues",
  },
  {
    id: "coverage-venues",
    chapter: "LIVE · MARKET COVERAGE",
    title: "Venue status rows",
    mode: "recognize",
    bridgePanel: "marketcoverage",
    region: "venues",
    coach:
      "Each row shows venue name, status, and kind. Staged venues are infrastructure-ready; live venues are actively ingesting. Mismatch here causes bad fills.",
    recognize: {
      prompt: "Select the venue coverage list",
      accept: ["venues", "venue-row"],
      nudge: "Market Coverage → COVERAGE tab → venue rows",
    },
    conceptId: "coverage-venues",
  },
  {
    id: "macro-regime",
    chapter: "LIVE · MACRO MATRIX",
    title: "Regime and stress strip",
    mode: "recognize",
    bridgePanel: "macro",
    region: "regime-strip",
    coach:
      "The Macro Matrix header compresses regime label and stress score. Rising stress often widens cross-venue basis — tighten size when stress climbs.",
    recognize: {
      prompt: "Select the macro regime strip",
      accept: ["regime-strip"],
      nudge: "Macro Matrix → top header (regime · STR)",
    },
    conceptId: "macro-regime-strip",
  },
  {
    id: "macro-desk",
    chapter: "LIVE · MACRO MATRIX",
    title: "Institutional macro desk",
    mode: "recognize",
    bridgePanel: "macro",
    region: "macro-desk",
    coach:
      "Institutional macro rows surface FRED and Treasury headlines when feeds are connected. Use this to filter crypto risk appetite before cross-market trades.",
    recognize: {
      prompt: "Select institutional macro rows",
      accept: ["macro-desk", "panel"],
      nudge: "Macro Matrix → INSTITUTIONAL MACRO block (or panel if empty)",
    },
    conceptId: "macro-desk-feed",
  },
  {
    id: "wire-feed",
    chapter: "LIVE · TACTICAL WIRE",
    title: "Fast-moving vectors",
    mode: "recognize",
    bridgePanel: "intelligence",
    region: "feed",
    coach:
      "Tactical Wire streams confidence, acceleration, and channel tags. Cross-market breaks often appear here before they show in slower panels — click to pivot the desk.",
    recognize: {
      prompt: "Select the tactical wire feed",
      accept: ["feed"],
      nudge: "Tactical Wire → scrolling headline feed",
    },
    conceptId: "intelligence-wire-feed",
  },
  {
    id: "graduate",
    chapter: "GRADUATION",
    title: "Cross-market certified",
    mode: "explain",
    bridgePanel: "marketcoverage",
    region: "panel",
    coach:
      "You can now read venues, macro stress, and tactical vectors as one cross-market map. Combine with market state and execution modules before sizing live entries.",
    conceptId: "cross-market-certified",
  },
];
