/** Hyperliquid account / clearinghouse types. */

export interface HlMarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}

export interface HlLeverage {
  type: "cross" | "isolated";
  value: number;
}

export interface HlPosition {
  coin: string;
  szi: string;
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  returnOnEquity: string;
  liquidationPx: string | null;
  marginUsed: string;
  maxLeverage: number;
  leverage: HlLeverage;
  cumFunding?: {
    allTime: string;
    sinceOpen: string;
    sinceChange: string;
  };
}

export interface HlAssetPosition {
  type: "oneWay";
  position: HlPosition;
}

export interface HlClearinghouseState {
  marginSummary: HlMarginSummary;
  crossMarginSummary: HlMarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: HlAssetPosition[];
  time?: number;
}

export interface HlSpotBalance {
  coin: string;
  token: number;
  hold: string;
  total: string;
  entryNtl: string;
}

export interface HlSpotClearinghouseState {
  balances: HlSpotBalance[];
}

export type { NormalizedPosition as PositionRow } from "@/types/terminal-schema";

export type WalletAuthStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "approving"
  | "agent_ready";
