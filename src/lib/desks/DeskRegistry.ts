import type { Layout } from "react-grid-layout";
import type { TerminalMode } from "@/types/adaptive-workspace";
import { WEDGE_V1_LAYOUT } from "@/lib/wedge/WedgeManifest";

/**
 * Operational desks are purpose-built workspace environments — each one
 * optimises focus, information hierarchy and operational rhythm for a single
 * workflow. They are NOT the same layout with different widgets; every desk has
 * a hand-tuned 12-column grid built around the panels that workflow actually
 * needs.
 */
export type DeskId =
  | "execution"
  | "macro"
  | "volatility"
  | "research"
  | "portfolio"
  | "journal"
  | "intelligence";

export interface DeskDefinition {
  id: DeskId;
  label: string;
  /** Short operational objective shown under the desk name. */
  tagline: string;
  /** Single-letter/short glyph for the switcher chip. */
  glyph: string;
  /** Tailwind text/border accent for the active state. */
  accent: string;
  /** Terminal mode applied so adaptive chrome matches the desk. */
  mode: TerminalMode;
  /** Canonical, hand-tuned grid layout. */
  layout: Layout[];
}

/** Grid item helper — keeps the layout tables readable. */
function gi(
  i: string,
  x: number,
  y: number,
  w: number,
  h: number,
  minW = 2,
  minH = 4,
): Layout {
  return { i, x, y, w, h, minW, minH };
}

/**
 * PHASE 1 — EXECUTION DESK (Bloomberg-style default)
 * Book · chart · ladder dominate; ticket/positions; morning context below.
 */
const EXECUTION_DESK: Layout[] = WEDGE_V1_LAYOUT.map((l) => ({ ...l }));

/**
 * PHASE 2 — MACRO DESK
 * ETF flows, rates, dollar strength, macro events, cross-asset relationships.
 * Contextual and strategic — macro matrix beside a wide chart, then global
 * intel / newswire / coverage, with market-context + tape underneath.
 */
const MACRO_DESK: Layout[] = [
  gi("crossvenue", 0, 0, 4, 10),
  gi("macro", 0, 10, 4, 12),
  gi("chart", 4, 0, 8, 12),
  gi("globaldesk", 0, 22, 4, 10),
  gi("newswire", 4, 22, 4, 10),
  gi("marketcoverage", 8, 22, 4, 10),
  gi("decision", 0, 32, 6, 8),
  gi("intelligence", 6, 32, 6, 8),
];

/**
 * PHASE 3 — VOLATILITY DESK
 * Expansion/compression, liquidations, funding, gamma, derivatives pressure.
 * Risk-aware and reactive — chart beside the derivatives desk, then a reactive
 * row of slippage / surveillance / memory / alerts, tape full-width.
 */
const VOLATILITY_DESK: Layout[] = [
  gi("screener", 0, 0, 4, 10),
  gi("chart", 4, 0, 8, 12),
  gi("derivdesk", 6, 0, 6, 12),
  gi("slippageradar", 0, 10, 3, 9),
  gi("tradesurveillance", 3, 10, 3, 9),
  gi("surveillance", 6, 10, 3, 9),
  gi("alerts", 9, 10, 3, 9),
  gi("intelligence", 0, 19, 12, 6),
];

/**
 * PHASE 4 — RESEARCH DESK
 * Slower, deeper analysis — thesis tracking, market-structure review,
 * long-form notes, replay analysis, narrative tracking.
 */
const RESEARCH_DESK: Layout[] = [
  gi("instrumentmaster", 0, 0, 4, 10),
  gi("researchdesk", 0, 10, 5, 13),
  gi("chart", 5, 0, 7, 13),
  gi("knowledgegraph", 0, 23, 4, 10),
  gi("research", 4, 23, 4, 10),
  gi("traderjournal", 8, 23, 4, 10),
  gi("decision", 0, 33, 12, 7),
];

/**
 * PHASE 5 — PORTFOLIO / RISK DESK
 * Exposure, leverage, collateral, PnL decomposition, concentration / liquidity
 * risk. Institutional oversight.
 */
const PORTFOLIO_DESK: Layout[] = [
  gi("portfoliodesk", 0, 0, 5, 13),
  gi("liveblotter", 5, 0, 3, 7),
  gi("settlementledger", 8, 0, 3, 7),
  gi("chart", 5, 7, 6, 13),
  gi("positions", 0, 13, 7, 10),
  gi("derivdesk", 7, 13, 5, 10),
  gi("reliability", 0, 23, 12, 7),
];

/**
 * PHASE 6 — OPERATOR JOURNAL DESK
 * Immersive review — replay-assisted review, behavioral / execution / decision
 * analysis, improvement tracking. Reflective and disciplined.
 */
const JOURNAL_DESK: Layout[] = [
  gi("operatorjournal", 0, 0, 7, 16),
  gi("chart", 7, 0, 5, 16),
  gi("traderjournal", 0, 16, 6, 9),
  gi("explaindesk", 6, 16, 6, 9),
];

/**
 * PHASE 7 — INTELLIGENCE COMMAND DESK
 * Situational awareness — intelligence tape, anomalies, alerts, whale activity,
 * volatility events, funding flips, market stress.
 */
const INTELLIGENCE_DESK: Layout[] = [
  gi("intelligence", 0, 0, 4, 14),
  gi("intelengine", 4, 0, 4, 14),
  gi("proactive", 8, 0, 4, 14),
  gi("alerts", 0, 14, 4, 9),
  gi("surveillance", 4, 14, 4, 9),
  gi("livementor", 8, 14, 4, 9),
  gi("newswire", 0, 23, 6, 7),
  gi("marketcmd", 6, 23, 6, 7),
];

export const DESKS: Record<DeskId, DeskDefinition> = {
  execution: {
    id: "execution",
    label: "EXECUTION",
    tagline: "Operator OS · morning workflow · execution",
    glyph: "EX",
    accent: "text-cyan-300 border-cyan-600/70",
    mode: "execution",
    layout: EXECUTION_DESK,
  },
  macro: {
    id: "macro",
    label: "MACRO",
    tagline: "Flows · rates · cross-asset",
    glyph: "MA",
    accent: "text-amber-300 border-amber-600/70",
    mode: "macro",
    layout: MACRO_DESK,
  },
  volatility: {
    id: "volatility",
    label: "VOLATILITY",
    tagline: "Vol · funding · derivatives",
    glyph: "VO",
    accent: "text-rose-300 border-rose-600/70",
    mode: "scalping",
    layout: VOLATILITY_DESK,
  },
  research: {
    id: "research",
    label: "RESEARCH",
    tagline: "Thesis · structure · narrative",
    glyph: "RE",
    accent: "text-violet-300 border-violet-600/70",
    mode: "research",
    layout: RESEARCH_DESK,
  },
  portfolio: {
    id: "portfolio",
    label: "PORTFOLIO",
    tagline: "Exposure · leverage · risk",
    glyph: "PF",
    accent: "text-emerald-300 border-emerald-600/70",
    mode: "portfolio",
    layout: PORTFOLIO_DESK,
  },
  journal: {
    id: "journal",
    label: "JOURNAL",
    tagline: "Review · replay · discipline",
    glyph: "JR",
    accent: "text-sky-300 border-sky-600/70",
    mode: "balanced",
    layout: JOURNAL_DESK,
  },
  intelligence: {
    id: "intelligence",
    label: "INTEL CMD",
    tagline: "Tape · anomalies · stress",
    glyph: "IC",
    accent: "text-fuchsia-300 border-fuchsia-600/70",
    mode: "narrative",
    layout: INTELLIGENCE_DESK,
  },
};

export const DESK_ORDER: DeskId[] = [
  "execution",
  "macro",
  "volatility",
  "research",
  "portfolio",
  "journal",
  "intelligence",
];

export function isDeskId(value: string | null | undefined): value is DeskId {
  return !!value && value in DESKS;
}

/** Deep copy so a desk's canonical layout is never mutated by the grid. */
export function cloneDeskLayout(id: DeskId): Layout[] {
  return DESKS[id].layout.map((l) => ({ ...l }));
}

/** All panel ids referenced by any desk — used to scope panel visibility. */
export function deskPanelIds(id: DeskId): string[] {
  return DESKS[id].layout.map((l) => l.i);
}
