/** Hyperliquid Exchange API types (POST /exchange). */

export const HL_EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";
export const HL_CHAIN = "Mainnet" as const;

export type HlTimeInForce = "Gtc" | "Ioc" | "Alo";
export type HlTpsl = "tp" | "sl";
export type HlOrderGrouping = "na" | "normalTpsl" | "positionTpsl";

export interface HlLimitOrderType {
  limit: { tif: HlTimeInForce };
}

export interface HlTriggerOrderType {
  trigger: {
    isMarket: boolean;
    triggerPx: string;
    tpsl: HlTpsl;
  };
}

export type HlOrderTypeWire = HlLimitOrderType | HlTriggerOrderType;

/** Wire-format order (exchange API). */
export interface HlOrderWire {
  a: number;
  b: boolean;
  p: string;
  s: string;
  r: boolean;
  t: HlOrderTypeWire;
  c?: string;
}

export interface HlOrderAction {
  type: "order";
  orders: HlOrderWire[];
  grouping: HlOrderGrouping;
  builder?: { b: string; f: number };
}

export interface HlCancelAction {
  type: "cancel";
  cancels: Array<{ a: number; o: number }>;
}

export interface HlUpdateLeverageAction {
  type: "updateLeverage";
  asset: number;
  isCross: boolean;
  leverage: number;
}

export interface HlApproveAgentAction {
  type: "approveAgent";
  signatureChainId: string;
  hyperliquidChain: typeof HL_CHAIN | "Testnet";
  agentAddress: string;
  agentName: string;
  nonce: number;
}

export interface HlApproveBuilderFeeAction {
  type: "approveBuilderFee";
  signatureChainId: string;
  hyperliquidChain: typeof HL_CHAIN | "Testnet";
  maxFeeRate: string;
  builder: string;
  nonce: number;
}

export type HlL1Action = HlOrderAction | HlCancelAction | HlUpdateLeverageAction;

export interface HlSignature {
  r: `0x${string}`;
  s: `0x${string}`;
  v: number;
}

export interface HlExchangeRequest {
  action: HlL1Action | HlApproveAgentAction | HlApproveBuilderFeeAction;
  nonce: number;
  signature: HlSignature;
  vaultAddress?: string;
  expiresAfter?: number;
}

export interface HlExchangeResponse {
  status: "ok" | "err";
  response?: unknown;
}

/** High-level order request used by the trade ticket. */
export interface OrderRequest {
  asset: number;
  coin: string;
  isBuy: boolean;
  size: number;
  limitPx: number;
  reduceOnly: boolean;
  orderType: HlOrderTypeWire;
}

export type TradeOrderMode = "market" | "limit" | "stop";

export interface ExecuteOrderParams {
  coin: string;
  asset: number;
  isBuy: boolean;
  size: number;
  mode: TradeOrderMode;
  limitPx?: number;
  stopPx?: number;
  reduceOnly?: boolean;
  szDecimals?: number;
  markPx?: number;
}
