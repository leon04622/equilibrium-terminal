/** Phase 14 — execution intelligence & order flow microstructure types. */

export type MarketParticipantKind =
  | "market_maker"
  | "hft_sweep"
  | "passive_absorption"
  | "toxic_flow"
  | "unknown";

export interface FootprintCell {
  priceTick: number;
  bidVolume: number;
  askVolume: number;
  delta: number;
  tradeCount: number;
}

export interface FootprintBar {
  barId: string;
  openTime: number;
  closeTime: number;
  openTick: number;
  highTick: number;
  lowTick: number;
  closeTick: number;
  cells: FootprintCell[];
  barDelta: number;
  totalVolume: number;
}

export interface CvdSnapshot {
  coin: string;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  sessionCvd: number;
  windowMs: number;
  updatedAtNs: number;
}

export interface VolumeImbalance {
  bidResting: number;
  askResting: number;
  ratio: number;
  topLevels: number;
  skew: "bid" | "ask" | "neutral";
  updatedAtNs: number;
}

export interface LiquidityVoidCoordinate {
  side: "bid" | "ask";
  priceTick: number;
  depthUsd: number;
  voidScore: number;
}

export interface MarketParticipantProfile {
  id: string;
  kind: MarketParticipantKind;
  confidence: number;
  priceTick: number;
  sizeEstimate: number;
  detectedAtNs: number;
  label: string;
}

export interface SlippageMetric {
  id: string;
  expectedPx: number;
  simulatedPx: number;
  slippageBps: number;
  spreadBps: number;
  velocityTicksPerSec: number;
  riskTier: "low" | "elevated" | "high" | "critical";
  updatedAtNs: number;
}

export interface DomLadderLevel {
  priceTick: number;
  price: number;
  bidSize: number;
  askSize: number;
  bidOrders: number;
  askOrders: number;
  deltaAtLevel: number;
  heatIntensity: number;
  passiveBlock: boolean;
  voidScore: number;
}

export interface DomMatrixPacket {
  coin: string;
  midTick: number;
  tickSize: number;
  levels: DomLadderLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  spreadBps: number | null;
  packetSeq: number;
  computedAtNs: number;
}

export interface ExecutionCopilotFlag {
  id: string;
  severity: "info" | "watch" | "critical";
  code:
    | "HIGH_SLIPPAGE_RISK"
    | "LIQUIDITY_VOID_ABOVE"
    | "LIQUIDITY_VOID_BELOW"
    | "SPREAD_EXPANSION"
    | "TOXIC_FLOW"
    | "PASSIVE_ABSORPTION"
    | "SWEEP_CLUSTER";
  message: string;
  priceTick: number | null;
  atNs: number;
}

export interface OrderFlowMatrixPacket {
  coin: string;
  packetSeq: number;
  computedAtNs: number;
  cvd: CvdSnapshot;
  imbalance: VolumeImbalance;
  footprintBars: FootprintBar[];
  participants: MarketParticipantProfile[];
  slippage: SlippageMetric;
  dom: DomMatrixPacket;
  copilotFlags: ExecutionCopilotFlag[];
  executionConfidence: number;
  icebergProbability: number;
  spoofingProbability: number;
}
