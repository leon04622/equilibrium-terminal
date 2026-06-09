import type { Layout } from "react-grid-layout";
import type { TerminalMode } from "@/types/adaptive-workspace";

/** Hyperliquid execution desk — optional focus mode (see docs/WEDGE_STRATEGY.md). */
export const WEDGE_PRODUCT_LABEL = "HL EXECUTION DESK";
export const FULL_WORKSPACE_LABEL = "EQUILIBRIUM TERMINAL";

export const WEDGE_DEFAULT_MODE: TerminalMode = "execution";
export const FULL_WORKSPACE_DEFAULT_MODE: TerminalMode = "balanced";

/** Panels that define the V1 wedge; never auto-hidden. */
export const WEDGE_CORE_PANEL_IDS = new Set<string>([
  "hyperbook",
  "chart",
  "intelligence",
  "ticket",
  "positions",
  "domladder",
  "slippageradar",
  "alerts",
  "surveillance",
]);

/** Museum / expansion panels — hidden until Advanced is enabled. */
export const WEDGE_ADVANCED_PANEL_IDS = new Set<string>([
  "macro",
  "copilot",
  "proactive",
  "teamdesk",
  "diagnostics",
  "alphalab",
  "infra",
  "decision",
  "knowledgegraph",
  "traderjournal",
  "research",
  "dailyops",
  "marketcoverage",
  "reliability",
  "newswire",
  "ingestion",
  "intelengine",
  "collab",
  "enterpriseops",
  "integrations",
  "propintel",
  "ecosystem",
  "globalstrategy",
  "commercial",
  "execintel",
  "portfoliodesk",
  "derivdesk",
  "systemicintel",
  "memorydesk",
  "researchdesk",
  "platformdesk",
  "mobiledesk",
  "opscommand",
  "billingdesk",
  "deskops",
  "globaldesk",
  "operatordesk",
  "unifiedops",
  "liveexec",
  "marketcmd",
  "maturitydesk",
  "livedeploy",
  "explaindesk",
  "operatorjournal",
  "livementor",
]);

/** Default grid for new sessions (no museum panels). */
export const WEDGE_V1_LAYOUT: Layout[] = [
  { i: "hyperbook", x: 0, y: 0, w: 3, h: 12, minW: 3, minH: 8 },
  { i: "chart", x: 3, y: 0, w: 6, h: 12, minW: 4, minH: 8 },
  { i: "intelligence", x: 9, y: 0, w: 3, h: 7, minW: 2, minH: 5 },
  { i: "domladder", x: 9, y: 7, w: 3, h: 5, minW: 2, minH: 4 },
  { i: "ticket", x: 0, y: 12, w: 3, h: 9, minW: 2, minH: 7 },
  { i: "positions", x: 3, y: 12, w: 4, h: 9, minW: 3, minH: 6 },
  { i: "slippageradar", x: 7, y: 12, w: 2, h: 5, minW: 2, minH: 4 },
  { i: "alerts", x: 7, y: 17, w: 2, h: 4, minW: 2, minH: 3 },
  { i: "surveillance", x: 9, y: 12, w: 3, h: 9, minW: 2, minH: 6 },
];

/** Optional layout rows appended when Advanced panels are enabled. */
export const WEDGE_ADVANCED_LAYOUT_APPEND: Layout[] = [
  { i: "macro", x: 0, y: 21, w: 12, h: 3, minW: 6, minH: 2 },
  { i: "copilot", x: 0, y: 24, w: 4, h: 8, minW: 2, minH: 5 },
  { i: "traderjournal", x: 4, y: 24, w: 4, h: 8, minW: 3, minH: 5 },
  { i: "reliability", x: 8, y: 24, w: 4, h: 8, minW: 3, minH: 5 },
  { i: "dailyops", x: 0, y: 32, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "ecosystem", x: 0, y: 41, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "globalstrategy", x: 0, y: 50, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "commercial", x: 0, y: 59, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "execintel", x: 0, y: 68, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "portfoliodesk", x: 0, y: 77, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "derivdesk", x: 0, y: 86, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "systemicintel", x: 0, y: 95, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "memorydesk", x: 0, y: 104, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "researchdesk", x: 0, y: 113, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "platformdesk", x: 0, y: 122, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "mobiledesk", x: 0, y: 131, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "opscommand", x: 0, y: 140, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "billingdesk", x: 0, y: 149, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "deskops", x: 0, y: 158, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "globaldesk", x: 0, y: 167, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "operatordesk", x: 0, y: 176, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "unifiedops", x: 0, y: 185, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "liveexec", x: 0, y: 194, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "marketcmd", x: 0, y: 203, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "maturitydesk", x: 0, y: 212, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "livedeploy", x: 0, y: 221, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "explaindesk", x: 0, y: 230, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "operatorjournal", x: 0, y: 239, w: 12, h: 9, minW: 6, minH: 6 },
  { i: "livementor", x: 0, y: 248, w: 12, h: 9, minW: 6, minH: 6 },
];

export const WEDGE_V1_COMMANDS = new Set([
  "/nav",
  "/trade",
  "/exec",
  "/chart",
  "/depth",
  "/liq",
  "/vol",
  "/intel",
  "/summarize",
  "/watch",
  "/unwatch",
  "/monitor",
  "/alerts",
  "/desk",
  "/expand",
  "/help",
  "/focus",
  "/guide",
  "/explain",
]);

export const WEDGE_ADVANCED_COMMANDS = new Set([
  "/macro",
  "/graph",
  "/journal",
  "/research",
  "/workspace",
  "/briefing",
  "/coverage",
  "/reliability",
  "/newswire",
  "/incidents",
  "/ingest",
  "/intelengine",
  "/collab",
  "/team",
  "/enterprise",
  "/integrations",
  "/propintel",
  "/ecosystem",
  "/globalstrategy",
  "/routine",
]);

export function isAdvancedWidget(widgetId: string): boolean {
  return WEDGE_ADVANCED_PANEL_IDS.has(widgetId);
}

export function mergeWedgeLayouts(
  core: Layout[],
  showAdvanced: boolean,
): Layout[] {
  if (!showAdvanced) return core;
  const ids = new Set(core.map((l) => l.i));
  const extra = WEDGE_ADVANCED_LAYOUT_APPEND.filter((l) => !ids.has(l.i));
  return [...core, ...extra];
}

/** Full multi-phase workspace (pre–wedge default). */
export const FULL_WORKSPACE_LAYOUT: Layout[] = [
  { i: "hyperbook", x: 0, y: 3, w: 4, h: 14, minW: 3, minH: 8 },
  { i: "chart", x: 4, y: 3, w: 5, h: 14, minW: 3, minH: 8 },
  { i: "macro", x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
  { i: "intelligence", x: 9, y: 3, w: 3, h: 8, minW: 2, minH: 6 },
  { i: "copilot", x: 9, y: 11, w: 3, h: 3, minW: 2, minH: 4 },
  { i: "proactive", x: 9, y: 14, w: 3, h: 3, minW: 2, minH: 4 },
  { i: "ticket", x: 0, y: 14, w: 3, h: 10, minW: 2, minH: 8 },
  { i: "positions", x: 3, y: 14, w: 6, h: 10, minW: 4, minH: 6 },
  { i: "teamdesk", x: 0, y: 24, w: 6, h: 8, minW: 3, minH: 5 },
  { i: "alerts", x: 6, y: 24, w: 6, h: 8, minW: 2, minH: 5 },
  { i: "diagnostics", x: 0, y: 32, w: 6, h: 7, minW: 4, minH: 5 },
  { i: "alphalab", x: 6, y: 32, w: 6, h: 7, minW: 4, minH: 5 },
  { i: "infra", x: 0, y: 39, w: 12, h: 6, minW: 6, minH: 4 },
  { i: "domladder", x: 0, y: 45, w: 6, h: 8, minW: 4, minH: 6 },
  { i: "slippageradar", x: 6, y: 45, w: 6, h: 8, minW: 4, minH: 6 },
  { i: "decision", x: 0, y: 53, w: 6, h: 10, minW: 4, minH: 8 },
  { i: "surveillance", x: 6, y: 53, w: 6, h: 10, minW: 4, minH: 8 },
  { i: "knowledgegraph", x: 0, y: 63, w: 12, h: 12, minW: 8, minH: 10 },
  { i: "traderjournal", x: 0, y: 75, w: 6, h: 10, minW: 4, minH: 8 },
  { i: "research", x: 6, y: 75, w: 6, h: 10, minW: 4, minH: 8 },
  { i: "dailyops", x: 0, y: 85, w: 12, h: 11, minW: 8, minH: 9 },
  { i: "marketcoverage", x: 0, y: 96, w: 12, h: 12, minW: 8, minH: 10 },
  { i: "reliability", x: 0, y: 108, w: 12, h: 11, minW: 8, minH: 9 },
  { i: "newswire", x: 0, y: 119, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "ingestion", x: 0, y: 129, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "intelengine", x: 0, y: 139, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "collab", x: 0, y: 149, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "enterpriseops", x: 0, y: 159, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "integrations", x: 0, y: 169, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "propintel", x: 0, y: 179, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "ecosystem", x: 0, y: 189, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "globalstrategy", x: 0, y: 199, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "commercial", x: 0, y: 209, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "execintel", x: 0, y: 219, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "portfoliodesk", x: 0, y: 229, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "derivdesk", x: 0, y: 239, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "systemicintel", x: 0, y: 249, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "memorydesk", x: 0, y: 259, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "researchdesk", x: 0, y: 269, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "platformdesk", x: 0, y: 279, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "mobiledesk", x: 0, y: 289, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "opscommand", x: 0, y: 299, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "billingdesk", x: 0, y: 309, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "deskops", x: 0, y: 319, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "globaldesk", x: 0, y: 329, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "operatordesk", x: 0, y: 339, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "unifiedops", x: 0, y: 349, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "liveexec", x: 0, y: 359, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "marketcmd", x: 0, y: 369, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "maturitydesk", x: 0, y: 379, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "livedeploy", x: 0, y: 389, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "explaindesk", x: 0, y: 399, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "operatorjournal", x: 0, y: 409, w: 12, h: 10, minW: 8, minH: 8 },
  { i: "livementor", x: 0, y: 419, w: 12, h: 10, minW: 8, minH: 8 },
];

export function resolveWorkspaceLayout(deskFocusMode: boolean): Layout[] {
  return deskFocusMode
    ? mergeWedgeLayouts(WEDGE_V1_LAYOUT, true)
    : FULL_WORKSPACE_LAYOUT;
}
