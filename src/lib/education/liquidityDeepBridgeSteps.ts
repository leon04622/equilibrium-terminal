export type LiqDeepBridgePanel = "hyperbook" | "domladder";

export type LiqDeepBridgeRegion = "panel" | "spread" | "bids" | "asks" | "ladder" | "imbalance" | null;

export type LiqDeepBridgeMode = "explain" | "recognize";

export interface LiqDeepBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: LiqDeepBridgeMode;
  bridgePanel: LiqDeepBridgePanel;
  region: LiqDeepBridgeRegion;
  coach: string;
  recognize?: { prompt: string; accept: Exclude<LiqDeepBridgeRegion, null>[]; nudge: string };
  conceptId?: string;
}

export const LIQUIDITY_DEEP_BRIDGE_PANEL = "hyperbook";

export const LIQUIDITY_DEEP_REQUIRED_CONCEPTS = [
  "book-spread-strip",
  "book-bid-stack",
  "book-ask-stack",
  "dom-ladder-canvas",
  "liquidity-certified",
];

export const LIQUIDITY_DEEP_BRIDGE_STEPS: LiqDeepBridgeStep[] = [
  {
    id: "book-intro",
    chapter: "LIVE · HYPERBOOK",
    title: "L2 depth panel",
    mode: "explain",
    bridgePanel: "hyperbook",
    region: "panel",
    coach:
      "Hyperbook is your primary L2 view — bids left, asks right, spread strip in the center. Institutional operators read cumulative size to judge how much the book can absorb.",
    conceptId: "book-spread-strip",
  },
  {
    id: "book-spread",
    chapter: "LIVE · HYPERBOOK",
    title: "Spread strip",
    mode: "recognize",
    bridgePanel: "hyperbook",
    region: "spread",
    coach:
      "The spread strip shows mid, absolute spread, and basis points. Tight spreads signal deep liquidity; wide spreads warn that market orders will pay up.",
    recognize: {
      prompt: "Select the spread strip",
      accept: ["spread"],
      nudge: "Hyperbook → center spread row",
    },
    conceptId: "book-spread-strip",
  },
  {
    id: "book-bids",
    chapter: "LIVE · HYPERBOOK",
    title: "Bid stack",
    mode: "recognize",
    bridgePanel: "hyperbook",
    region: "bids",
    coach:
      "The bid stack shows resting buy size at each level. Highlighted walls indicate unusually large resting liquidity — potential support or spoof risk.",
    recognize: {
      prompt: "Open the bid stack",
      accept: ["bids"],
      nudge: "Hyperbook → BID column",
    },
    conceptId: "book-bid-stack",
  },
  {
    id: "book-asks",
    chapter: "LIVE · HYPERBOOK",
    title: "Ask stack",
    mode: "recognize",
    bridgePanel: "hyperbook",
    region: "asks",
    coach:
      "The ask stack mirrors bids on the sell side. Large ask walls cap upside until consumed. Read ask depth before lifting offers with size.",
    recognize: {
      prompt: "Open the ask stack",
      accept: ["asks"],
      nudge: "Hyperbook → ASK column",
    },
    conceptId: "book-ask-stack",
  },
  {
    id: "dom-ladder",
    chapter: "LIVE · DOM LADDER",
    title: "Depth shape",
    mode: "recognize",
    bridgePanel: "domladder",
    region: "ladder",
    coach:
      "The DOM ladder visualizes depth around mid with imbalance and skew metrics above. Use it to spot thin air between levels before submitting market size.",
    recognize: {
      prompt: "Open the DOM ladder",
      accept: ["ladder"],
      nudge: "DOM Ladder → depth canvas",
    },
    conceptId: "dom-ladder-canvas",
  },
  {
    id: "graduate",
    chapter: "GRADUATION",
    title: "Liquidity certified",
    mode: "explain",
    bridgePanel: "hyperbook",
    region: "spread",
    coach:
      "You can now read bid and ask stacks, spread quality, and DOM shape on the live desk. Pair this with the Slippage module before sizing market orders.",
    conceptId: "liquidity-certified",
  },
];
