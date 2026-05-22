/** Phase 12 — Signal Discovery & Quant Research Layer schemas. */

export type MarketRegime =
  | "HIGH_VOLATILITY_SQUEEZE"
  | "LOW_VOLATILITY_MEAN_REVERTING"
  | "TREND_EXPANSION"
  | "LIQUIDATION_CASCADE"
  | "RANGE_BOUND"
  | "UNKNOWN";

export type FeatureKind =
  | "book_imbalance"
  | "funding_velocity"
  | "liquidation_velocity"
  | "trade_flow_imbalance"
  | "spread_pressure"
  | "oi_proxy_delta"
  | "volatility_surface";

export type SignalStatus =
  | "draft"
  | "validating"
  | "active"
  | "decaying"
  | "retired";

export type ExperimentStatus = "queued" | "running" | "completed" | "failed";

export interface MarketFeature {
  id: string;
  coin: string;
  kind: FeatureKind;
  /** Nanosecond-resolution epoch (performance.now() * 1e6 or Date * 1e6) */
  computedAtNs: number;
  value: number;
  zScore: number;
  regime: MarketRegime;
  /** Flat buffer index for matrix lookup */
  matrixIndex: number;
  meta?: Record<string, number>;
}

export interface RegimePerformance {
  regime: MarketRegime;
  tradeCount: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  expectancy: number;
  sampleSize: number;
}

export interface SignalCandidate {
  id: string;
  name: string;
  hypothesis: string;
  coin: string;
  featureKinds: FeatureKind[];
  status: SignalStatus;
  confidenceIndex: number;
  validationSharpe: number;
  validationWinRate: number;
  validationMaxDrawdown: number;
  liveSharpe: number;
  liveWinRate: number;
  liveExpectancy: number;
  decayBoundary: number;
  decayRate: number;
  regimeDependencies: RegimePerformance[];
  createdAt: number;
  updatedAt: number;
  retiredAt: number | null;
}

export interface BacktestTradeLog {
  id: string;
  timestamp: number;
  regime: MarketRegime;
  side: "long" | "short";
  entryPx: number;
  exitPx: number;
  sizeUsd: number;
  pnlUsd: number;
  slippageBps: number;
  latencyMs: number;
}

export interface BacktestRunLog {
  id: string;
  experimentId: string;
  signalId: string;
  startedAt: number;
  completedAt: number;
  totalTrades: number;
  aggregateSharpe: number;
  aggregateWinRate: number;
  maxDrawdown: number;
  regimePartitions: RegimePerformance[];
  trades: BacktestTradeLog[];
}

export interface ModelExperiment {
  id: string;
  label: string;
  signalId: string;
  status: ExperimentStatus;
  slippageBps: number;
  latencyMs: number;
  positionSizePct: number;
  regimesTested: MarketRegime[];
  progressPct: number;
  backtestLogId: string | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface GovernanceMetrics {
  activeSignals: number;
  decayingSignals: number;
  retiredSignals: number;
  avgConfidence: number;
  pipelineCycleMs: number;
  featuresPerSecond: number;
  lastDecayEventAt: number | null;
  updatedAt: number;
}

export interface FeatureMatrixRow {
  coin: string;
  features: MarketFeature[];
  lastUpdatedNs: number;
}

export interface HistoricalMarketEvent {
  id: string;
  timestamp: number;
  coin: string;
  regime: MarketRegime;
  midPx: number;
  bookImbalance: number;
  fundingRate: number;
  fundingDelta: number;
  liquidationVelocity: number;
  tradeFlowImbalance: number;
  volatility: number;
  signalTrigger: boolean;
}

export interface BacktestConfig {
  slippageBps: number;
  latencyMs: number;
  positionSizePct: number;
  maxPositionUsd: number;
  validationSharpeFloor: number;
  validationWinRateFloor: number;
}

export interface BacktestResult {
  runId: string;
  signalId: string;
  regimePartitions: RegimePerformance[];
  aggregate: {
    sharpeRatio: number;
    winRate: number;
    maxDrawdown: number;
    expectancy: number;
    tradeCount: number;
  };
  trades: BacktestTradeLog[];
  environmentBoundaries: Array<{
    regime: MarketRegime;
    edgeDegrades: boolean;
    sharpeDelta: number;
  }>;
}

export interface FlatFeatureSnapshot {
  coin: string;
  computedAtNs: number;
  regime: MarketRegime;
  /** [imbalance, fundingVel, liqVel, flowImb, spreadBps, oiDelta, realizedVol] */
  values: Float64Array;
}
