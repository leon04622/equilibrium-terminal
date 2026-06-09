/** Unified frontend schema — all Hyperliquid streams normalize here. */

export type StreamChannel =
  | "l2Book"
  | "trades"
  | "candles"
  | "allMids"
  | "clearinghouse"
  | "webData";

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface TerminalAsset {
  id: string;
  symbol: string;
  label: string;
  market: "perp" | "spot";
  coin: string;
  assetIndex?: number;
  szDecimals?: number;
}

export interface NormalizedLevel {
  price: number;
  size: number;
  orders: number;
  cumulative: number;
}

export interface NormalizedOrderBook {
  coin: string;
  time: number;
  bids: NormalizedLevel[];
  asks: NormalizedLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  mid: number | null;
  spread: number | null;
  spreadBps: number | null;
  maxBidSize: number;
  maxAskSize: number;
}

export interface NormalizedTrade {
  id: string;
  coin: string;
  side: "buy" | "sell";
  price: number;
  size: number;
  notionalUsd: number;
  time: number;
  tid: number;
}

export interface NormalizedCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedMidSnapshot {
  mids: Record<string, number>;
  updatedAt: number;
}

export interface NormalizedAccountMargin {
  accountValue: number;
  withdrawable: number;
  totalMarginUsed: number;
  totalNtlPos: number;
}

export interface NormalizedPosition {
  id: string;
  coin: string;
  assetIndex: number;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  marginType: "Cross" | "Isolated";
  leverage: number;
  pnlFlash?: "up" | "down" | null;
}

export type WalletAuthStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "approving"
  | "agent_ready";

export interface NormalizedWebData {
  user: string | null;
  margin: NormalizedAccountMargin | null;
  positions: NormalizedPosition[];
  updatedAt: number;
}

export interface IntelligenceItem {
  id: string;
  coin: string;
  channel: "on-chain" | "market" | "social";
  title: string;
  detail: string;
  severity: "info" | "watch" | "critical";
  notionalUsd?: number;
  timestamp: number;
}

export interface AiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  status?: "pending" | "complete" | "error";
}

export interface AiSessionState {
  messages: AiMessage[];
  pendingPrompt: string | null;
  isThinking: boolean;
}

export type WidgetType =
  | "hyperbook"
  | "chart"
  | "intelligence"
  | "copilot"
  | "alerts"
  | "proactive"
  | "teamdesk"
  | "macro"
  | "diagnostics"
  | "alphalab"
  | "infra"
  | "domladder"
  | "slippageradar"
  | "decision"
  | "surveillance"
  | "knowledgegraph"
  | "traderjournal"
  | "research"
  | "dailyops"
  | "marketcoverage"
  | "reliability"
  | "newswire"
  | "ingestion"
  | "intelengine"
  | "collab"
  | "enterpriseops"
  | "integrations"
  | "propintel"
  | "ecosystem"
  | "globalstrategy"
  | "commercial"
  | "execintel"
  | "portfoliodesk"
  | "derivdesk"
  | "systemicintel"
  | "memorydesk"
  | "researchdesk"
  | "platformdesk"
  | "mobiledesk"
  | "opscommand"
  | "billingdesk"
  | "deskops"
  | "globaldesk"
  | "operatordesk"
  | "unifiedops"
  | "liveexec"
  | "marketcmd"
  | "maturitydesk"
  | "livedeploy"
  | "explaindesk"
  | "operatorjournal"
  | "livementor";

export interface TradeTicketDraft {
  side?: "buy" | "sell";
  size?: string;
  coin?: string;
  version: number;
}

export interface WorkspaceWidget {
  id: string;
  type: WidgetType;
  title: string;
}
