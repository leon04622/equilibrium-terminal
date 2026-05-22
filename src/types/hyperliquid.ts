/** Hyperliquid WebSocket & REST type definitions (mainnet). */

export const HL_INFO_WS_URL = "wss://api.hyperliquid.xyz/ws";
export const HL_INFO_HTTP_URL = "https://api.hyperliquid.xyz/info";

export type HlSide = "B" | "A";

export interface WsLevel {
  px: string;
  sz: string;
  n: number;
}

export interface WsBook {
  coin: string;
  levels: [WsLevel[], WsLevel[]];
  time: number;
}

export interface WsTrade {
  coin: string;
  side: HlSide | string;
  px: string;
  sz: string;
  hash: string;
  time: number;
  tid: number;
  users: [string, string];
}

export type HlSubscriptionType =
  | "l2Book"
  | "trades"
  | "allMids"
  | "candle"
  | "bbo"
  | "clearinghouseState";

export interface HlSubscription {
  type: HlSubscriptionType;
  coin?: string;
  user?: string;
  dex?: string;
  interval?: string;
  nSigFigs?: number;
  mantissa?: number;
}

export interface HlSubscribeMessage {
  method: "subscribe" | "unsubscribe";
  subscription: HlSubscription;
}

export interface HlSubscriptionResponse {
  method: "subscribe" | "unsubscribe";
  subscription: HlSubscription;
}

export type HlWsChannel =
  | "subscriptionResponse"
  | "l2Book"
  | "trades"
  | "allMids"
  | "error"
  | string;

export interface HlWsEnvelope<T = unknown> {
  channel: HlWsChannel;
  data: T;
}

export interface HlPerpMeta {
  universe: Array<{
    name: string;
    szDecimals: number;
    maxLeverage: number;
    onlyIsolated?: boolean;
  }>;
}

export interface HlSpotMeta {
  universe: Array<{
    name: string;
    tokens: [number, number];
    index: number;
    isCanonical?: boolean;
  }>;
  tokens: Array<{
    name: string;
    szDecimals: number;
    weiDecimals: number;
    index: number;
    tokenId: string;
    isCanonical?: boolean;
  }>;
}

export interface TerminalAsset {
  id: string;
  symbol: string;
  label: string;
  market: "perp" | "spot";
  coin: string;
  assetIndex?: number;
  szDecimals?: number;
}

export interface HlAllMids {
  mids: Record<string, string>;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  orders: number;
  cumulative: number;
}

export interface ProcessedBook {
  coin: string;
  time: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  mid: number | null;
  spread: number | null;
  spreadBps: number | null;
  maxBidSize: number;
  maxAskSize: number;
}

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";
