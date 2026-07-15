/** Phase 10 — Market Presence Systems type contracts. */

export type MacroSymbol = "DXY" | "US10Y" | "ES" | "NQ" | "YM";

export type MarketRegime =
  | "risk-on"
  | "risk-off"
  | "compression"
  | "liquidation"
  | "neutral";

export type WireSeverity = "info" | "watch" | "critical";

export type WireDirection = "bullish" | "bearish" | "neutral";

export interface MarketStressGauge {
  /** Composite stress 0–100 */
  score: number;
  /** Order book imbalance −1 (bid) … +1 (ask) */
  bookImbalance: number;
  /** Rolling trade velocity vs baseline */
  velocityRatio: number;
  /** Spread in basis points */
  spreadBps: number;
  updatedAt: number;
}

export interface MacroTickerData {
  symbol: MacroSymbol;
  label: string;
  last: number;
  changePct: number;
  sessionHigh: number;
  sessionLow: number;
  updatedAt: number;
}

export interface MacroCalendarEvent {
  id: string;
  title: string;
  region: "US" | "EU" | "APAC";
  impact: "low" | "med" | "high";
  scheduledAt: number;
  forecast: string | null;
  previous: string | null;
}

export interface RegimeAtmosphereState {
  regime: MarketRegime;
  /** AI / fusion confidence pulse 0–100 */
  confidencePulse: number;
  /** Narrative acceleration −100 … +100 */
  narrativeAcceleration: number;
  dominantMacro: MacroSymbol | null;
  updatedAt: number;
}

export interface TacticalWireItem {
  id: string;
  coin: string;
  headline: string;
  channel: "on-chain" | "market" | "social" | "macro" | "agentic";
  severity: WireSeverity;
  confidenceIndex: number;
  direction: WireDirection;
  acceleration: number;
  notionalUsd?: number;
  timestamp: number;
  isNew: boolean;
  articleUrl?: string | null;
}

export interface LiquidityBand {
  price: number;
  bidDepth: number;
  askDepth: number;
  intensity: number;
}

export interface LiquidationZone {
  priceLow: number;
  priceHigh: number;
  notionalUsd: number;
  side: "long" | "short";
}

export interface ExecutionMarker {
  price: number;
  size: number;
  side: "buy" | "sell";
  notionalUsd: number;
  timestamp: number;
}

export interface TacticalOverlayFrame {
  coin: string;
  mid: number | null;
  priceMin: number;
  priceMax: number;
  liquidityBands: LiquidityBand[];
  liquidationZones: LiquidationZone[];
  executionMarkers: ExecutionMarker[];
  version: number;
  updatedAt: number;
}
