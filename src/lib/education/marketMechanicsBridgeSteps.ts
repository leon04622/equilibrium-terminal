import { LiveBookCoach } from "@/lib/education/liveBookCoach";
import type { NormalizedOrderBook } from "@/types/terminal-schema";

/** MARKET MECHANICS LIVE BRIDGE — first terminal connection after simulator. */

export type MMBridgePanel = "hyperbook" | "chart" | "intelligence";

export type MMBridgeRegion =
  | "panel"
  | "spread"
  | "bids"
  | "asks"
  | "regime"
  | "mid"
  | "feed"
  | null;

export type MMBridgeMode = "explain" | "recognize";

export interface MMRecognitionSpec {
  prompt: string;
  accept: Exclude<MMBridgeRegion, null>[];
  nudge: string;
}

export interface MMBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: MMBridgeMode;
  bridgePanel: MMBridgePanel;
  region: MMBridgeRegion;
  whyCare?: string;
  coach: (book: NormalizedOrderBook | null) => string;
  recognize?: MMRecognitionSpec;
  conceptId?: string;
}

export const MARKET_MECHANICS_BRIDGE_PANEL = "hyperbook";

export const MARKET_MECHANICS_REQUIRED_CONCEPTS = [
  "find-hyperbook",
  "find-chart",
  "find-market-data",
  "live-terminal-ready",
];

export const MARKET_MECHANICS_BRIDGE_STEPS: MMBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Now find this in the live terminal",
    bridgePanel: "hyperbook",
    region: "panel",
    whyCare: "The lesson taught concepts — the terminal shows live data. This bridge connects theory to your desk.",
    coach: (book) =>
      book
        ? `Your live order book is connected. Mid ${book.mid?.toFixed(2) ?? "—"} — this is where bids and asks meet in real time.`
        : "Your Hyperbook panel shows live bids and asks. This is where price discovery happens on Equilibrium Terminal.",
  },
  {
    id: "live-spread",
    mode: "explain",
    chapter: "HYPERBOOK · SPREAD",
    title: "See the live spread",
    bridgePanel: "hyperbook",
    region: "spread",
    whyCare: "Spread is the first number every operator reads before a trade.",
    coach: (book) => LiveBookCoach.spread(book).line,
  },
  {
    id: "recognize-book",
    mode: "recognize",
    chapter: "HYPERBOOK",
    title: "Click the order book",
    bridgePanel: "hyperbook",
    region: "bids",
    conceptId: "find-hyperbook",
    coach: () => "Click the bid side of the live order book.",
    recognize: {
      prompt: "Click the BIDS column in Hyperbook.",
      accept: ["bids", "asks", "spread"],
      nudge: "HYPERBOOK panel → click bids or asks.",
    },
  },
  {
    id: "live-chart",
    mode: "explain",
    chapter: "CHART · PRICE",
    title: "See live price on the chart",
    bridgePanel: "chart",
    region: "mid",
    whyCare: "Price on the chart is the same market — different view, same instrument.",
    coach: (book) =>
      `Chart shows price action over time. Current mid ${book?.mid?.toFixed(2) ?? "—"} — use chart for context, book for execution.`,
  },
  {
    id: "recognize-chart",
    mode: "recognize",
    chapter: "CHART",
    title: "Click the chart price readout",
    bridgePanel: "chart",
    region: "mid",
    conceptId: "find-chart",
    coach: () => "Click the MID price chip on the chart HUD.",
    recognize: {
      prompt: "Click the MID price readout on the chart.",
      accept: ["mid", "regime"],
      nudge: "CHART panel → top HUD → MID chip.",
    },
  },
  {
    id: "live-intel",
    mode: "explain",
    chapter: "MARKET DATA · TACTICAL WIRE",
    title: "See live market data flow",
    bridgePanel: "intelligence",
    region: "feed",
    whyCare: "Tape, flow, and alerts stream here — market data beyond the book.",
    coach: () =>
      "Tactical Wire streams live market vectors — whale flow, liquidation proximity, funding shifts. This is your market data feed.",
  },
  {
    id: "recognize-intel",
    mode: "recognize",
    chapter: "MARKET DATA",
    title: "Click the tactical wire feed",
    bridgePanel: "intelligence",
    region: "feed",
    conceptId: "find-market-data",
    coach: () => "Click any row in the tactical wire feed.",
    recognize: {
      prompt: "Click the TACTICAL WIRE feed.",
      accept: ["feed"],
      nudge: "INTELLIGENCE panel → tactical wire list.",
    },
  },
  {
    id: "ready",
    mode: "explain",
    chapter: "BRIDGE COMPLETE",
    title: "You found it on the live terminal",
    bridgePanel: "hyperbook",
    region: "panel",
    coach: () =>
      "Hyperbook, chart, and market data — three live views of the same market. Next lesson: Order Book deep dive.",
  },
];
