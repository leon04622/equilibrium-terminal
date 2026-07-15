export type FTBridgePanel = "header" | "ticket" | "paperblotter";

export type FTBridgeRegion = "panel" | "desk-paper" | "desk-live" | "exec-context" | "exec-mode" | "blotter-tape" | null;

export type FTBridgeMode = "explain" | "recognize";

export interface FTBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: FTBridgeMode;
  bridgePanel: FTBridgePanel;
  region: FTBridgeRegion;
  coach: string;
  recognize?: { prompt: string; accept: Exclude<FTBridgeRegion, null>[]; nudge: string };
  conceptId?: string;
}

export const FIRST_TRADE_BRIDGE_PANEL = "paperblotter";

export const FIRST_TRADE_REQUIRED_CONCEPTS = [
  "desk-paper-mode",
  "exec-context-strip",
  "paper-blotter-fill",
  "first-trade-ready",
];

export const FIRST_TRADE_BRIDGE_STEPS: FTBridgeStep[] = [
  {
    id: "desk-paper",
    chapter: "LIVE · DESK SESSION",
    title: "Paper mode default",
    mode: "recognize",
    bridgePanel: "header",
    region: "desk-paper",
    coach:
      "The DESK bar controls execution mode. PAPER is the default — simulated fills at live Hyperliquid prices. Click PAPER if LIVE is selected.",
    recognize: {
      prompt: "Select PAPER on the DESK bar",
      accept: ["desk-paper"],
      nudge: "Header → DESK → PAPER button",
    },
    conceptId: "desk-paper-mode",
  },
  {
    id: "exec-context",
    chapter: "LIVE · TRADE TICKET",
    title: "Pre-trade context strip",
    mode: "explain",
    bridgePanel: "ticket",
    region: "exec-context",
    coach:
      "The execution context strip shows MODE, spread, slippage tier, regime, and stress. Operator checks appear when Pro workflow is unlocked.",
    conceptId: "exec-context-strip",
  },
  {
    id: "paper-order",
    chapter: "LIVE · TRADE TICKET",
    title: "Place a paper order",
    mode: "explain",
    bridgePanel: "ticket",
    region: "exec-mode",
    coach:
      "Enter a small size and submit a paper market order. No exchange submission — the fill records locally at the live mid with slippage model.",
  },
  {
    id: "blotter",
    chapter: "LIVE · PAPER BLOTTER",
    title: "Review the fill tape",
    mode: "recognize",
    bridgePanel: "paperblotter",
    region: "blotter-tape",
    coach:
      "The Paper Blotter shows open positions, unrealized P and L at live marks, and the fill tape. This is your rehearsal ledger.",
    recognize: {
      prompt: "Open the Paper Blotter fill tape",
      accept: ["blotter-tape"],
      nudge: "Scroll the PAPER BLOTTER panel",
    },
    conceptId: "paper-blotter-fill",
  },
  {
    id: "graduate",
    chapter: "GRADUATION",
    title: "First trade checklist complete",
    mode: "explain",
    bridgePanel: "header",
    region: "desk-live",
    coach:
      "When the checklist clears, you may switch DESK → LIVE after sign-in and 1CT approval. Start minimum size. You have completed the first-trade workflow.",
    conceptId: "first-trade-ready",
  },
];
