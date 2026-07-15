/** Institutional capability types — mapped from Refinitiv, FactSet, ICE, Aladdin, Murex, Calypso. */

export interface PreTradeRiskLimits {
  enabled: boolean;
  maxLeverage: number;
  maxMarginUtilPct: number;
  maxNotionalPerCoinUsd: number;
  maxConcentrationPct: number;
  blockOnBreach: boolean;
}

export interface PreTradeRiskDecision {
  allowed: boolean;
  severity: "ok" | "warn" | "block";
  reasons: string[];
  metrics: {
    leverage: number;
    marginUtilPct: number;
    orderNotionalUsd: number;
    concentrationPct: number;
  };
}

export interface LiveOpenOrder {
  oid: number;
  coin: string;
  side: "buy" | "sell";
  limitPx: number;
  sz: number;
  origSz: number;
  timestamp: number;
  orderType: string;
  reduceOnly: boolean;
}

export interface LiveFill {
  id: string;
  coin: string;
  side: "buy" | "sell";
  px: number;
  sz: number;
  fee: number;
  closedPnl: number;
  time: number;
  crossed: boolean;
  dir: string;
}

export interface LiveBlotterSnapshot {
  wallet: string | null;
  openOrders: LiveOpenOrder[];
  fills: LiveFill[];
  lastRefreshAt: number;
  error: string | null;
}

export type StressScenarioId =
  | "btc_crash_20"
  | "eth_crash_15"
  | "vol_spike"
  | "funding_shock"
  | "liquidity_gap"
  | "correlation_1";

export interface StressScenario {
  id: StressScenarioId;
  label: string;
  description: string;
  source: "aladdin" | "factset" | "murex" | "calypso" | "ice" | "refinitiv";
}

export interface StressScenarioResult {
  scenario: StressScenario;
  portfolioPnlUsd: number;
  portfolioPnlPct: number;
  marginAfterPct: number;
  liquidationRiskAfter: number;
  worstCoin: string | null;
  worstCoinPnlUsd: number;
}

export interface PortfolioStressSnapshot {
  accountValueUsd: number;
  baseMarginUtilPct: number;
  scenarios: StressScenarioResult[];
  computedAt: number;
}

export type VaRMethod = "parametric" | "historical" | "blended";

export interface PositionVaRRow {
  coin: string;
  notionalUsd: number;
  weightPct: number;
  dailyVolPct: number;
  var95Usd: number;
  contributionPct: number;
}

export type VaRHorizonDays = 1 | 5 | 10;

export interface VaRHorizonMetrics {
  horizonDays: VaRHorizonDays;
  var95Usd: number;
  var95Pct: number;
  var99Usd: number;
  var99Pct: number;
  expectedShortfall95Usd: number;
  expectedShortfall95Pct: number;
}

export interface PortfolioVaRSnapshot {
  accountValueUsd: number;
  method: VaRMethod;
  horizonDays: number;
  correlationAssumption: number;
  var95Usd: number;
  var95Pct: number;
  var99Usd: number;
  var99Pct: number;
  expectedShortfall95Usd: number;
  expectedShortfall95Pct: number;
  expectedShortfall99Usd: number;
  expectedShortfall99Pct: number;
  portfolioDailyVolPct: number;
  positions: PositionVaRRow[];
  horizons: VaRHorizonMetrics[];
  historicalSampleSize: number;
  computedAt: number;
}

export type MarginCallRiskBand = "clear" | "watch" | "imminent";

export interface MarginCallPositionRow {
  coin: string;
  notionalUsd: number;
  leverage: number;
  unrealizedPnlUsd: number;
  bufferPct: number;
  severity: "ok" | "watch" | "critical";
}

export interface CollateralOptimizationHint {
  id: string;
  action: string;
  rationale: string;
  priority: "low" | "medium" | "high";
}

export interface MarginCallSnapshot {
  accountValueUsd: number;
  marginUtilPct: number;
  withdrawableUsd: number;
  freeBufferUsd: number;
  distanceToMarginCallPct: number;
  marginCallRisk: MarginCallRiskBand;
  positions: MarginCallPositionRow[];
  hints: CollateralOptimizationHint[];
  computedAt: number;
}

export type SettlementLedgerEntryKind =
  | "fill"
  | "fee"
  | "pnl_realized"
  | "position_carry"
  | "break";

export type SettlementReconStatus = "matched" | "watch" | "break";

export interface SettlementLedgerEntry {
  id: string;
  kind: SettlementLedgerEntryKind;
  at: number;
  coin: string;
  amountUsd: number;
  qty: number | null;
  status: "settled" | "pending" | "break";
  detail: string;
}

export interface SettlementBreak {
  id: string;
  severity: "watch" | "critical";
  coin: string;
  headline: string;
  detail: string;
}

export interface SettlementReconciliationSnapshot {
  wallet: string | null;
  healthScore: number;
  status: SettlementReconStatus;
  fillCount: number;
  openOrderCount: number;
  positionCount: number;
  totalFeesUsd: number;
  totalRealizedPnlUsd: number;
  totalFillNotionalUsd: number;
  breaks: SettlementBreak[];
  ledger: SettlementLedgerEntry[];
  computedAt: number;
}

export interface InstrumentMasterRecord {
  id: string;
  symbol: string;
  coin: string;
  market: "perp" | "spot";
  assetIndex: number;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated: boolean;
  isDelisted: boolean;
  marginTableId?: number;
  /** ICE-style reference identifiers */
  venue: "hyperliquid";
  assetClass: "crypto_perp" | "crypto_spot";
  tickSize: number;
  updatedAt: number;
}

export interface InstrumentMasterSnapshot {
  instruments: InstrumentMasterRecord[];
  perpCount: number;
  spotCount: number;
  updatedAt: number;
}

export interface MarketScreenerRow {
  rank: number;
  coin: string;
  symbol: string;
  mid: number;
  changePct: number;
  fundingScore: number;
  liquidityScore: number;
  newsScore: number;
  compositeScore: number;
  tags: string[];
}

export interface MarketScreenerSnapshot {
  rows: MarketScreenerRow[];
  universeSize: number;
  computedAt: number;
  filter: MarketScreenerFilter;
}

export interface MarketScreenerFilter {
  minChangePct: number;
  minComposite: number;
  market: "all" | "perp" | "spot";
  limit: number;
}

export const DEFAULT_PRE_TRADE_LIMITS: PreTradeRiskLimits = {
  enabled: true,
  maxLeverage: 25,
  maxMarginUtilPct: 80,
  maxNotionalPerCoinUsd: 100_000,
  maxConcentrationPct: 55,
  blockOnBreach: true,
};

export interface VaRLimits {
  enabled: boolean;
  maxVar95Pct: number;
  criticalVar95Pct: number;
  alertHorizonDays: VaRHorizonDays;
  alertCooldownMs: number;
}

export const DEFAULT_VAR_LIMITS: VaRLimits = {
  enabled: true,
  maxVar95Pct: 10,
  criticalVar95Pct: 18,
  alertHorizonDays: 1,
  alertCooldownMs: 120_000,
};

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "btc_crash_20",
    label: "BTC −20%",
    description: "Spot/perp mark shock on BTC-heavy books",
    source: "aladdin",
  },
  {
    id: "eth_crash_15",
    label: "ETH −15%",
    description: "Cross-beta draw on ETH-linked exposure",
    source: "aladdin",
  },
  {
    id: "vol_spike",
    label: "Vol +40%",
    description: "Implied vol expansion on all open perps",
    source: "factset",
  },
  {
    id: "funding_shock",
    label: "Funding +50bps",
    description: "Adverse hourly funding on long bias",
    source: "murex",
  },
  {
    id: "liquidity_gap",
    label: "Liquidity gap",
    description: "10% wider exit slippage on all positions",
    source: "calypso",
  },
  {
    id: "correlation_1",
    label: "Correlation → 1",
    description: "Diversification benefit collapses",
    source: "aladdin",
  },
];

export const DEFAULT_SCREENER_FILTER: MarketScreenerFilter = {
  minChangePct: 0.5,
  minComposite: 35,
  market: "all",
  limit: 25,
};

export interface MarketScreenerPreset {
  id: string;
  label: string;
  filter: MarketScreenerFilter;
  builtIn?: boolean;
}

export const BUILTIN_SCREENER_PRESETS: MarketScreenerPreset[] = [
  {
    id: "builtin_all_movers",
    label: "All movers",
    builtIn: true,
    filter: DEFAULT_SCREENER_FILTER,
  },
  {
    id: "builtin_perp_momentum",
    label: "Perp momentum",
    builtIn: true,
    filter: { minChangePct: 1.2, minComposite: 40, market: "perp", limit: 20 },
  },
  {
    id: "builtin_news_flow",
    label: "News flow",
    builtIn: true,
    filter: { minChangePct: 0.3, minComposite: 55, market: "all", limit: 15 },
  },
  {
    id: "builtin_wide_spread",
    label: "Wide spread",
    builtIn: true,
    filter: { minChangePct: 0, minComposite: 25, market: "all", limit: 30 },
  },
];

export interface ScreenerAlertRule {
  id: string;
  label: string;
  enabled: boolean;
  presetId: string | null;
  minChangePct: number;
  minComposite: number;
  requireTag: string | null;
  cooldownMs: number;
}

export interface ScreenerAlertHit {
  ruleId: string;
  ruleLabel: string;
  coin: string;
  symbol: string;
  changePct: number;
  compositeScore: number;
  tags: string[];
  at: number;
}

export type TradeSurveillanceSignalKind =
  | "spoof"
  | "wash"
  | "layering"
  | "toxic_flow"
  | "sweep_cluster";

export interface TradeSurveillanceSnapshot {
  coin: string;
  spoofScore: number;
  washScore: number;
  layeringScore: number;
  toxicFlowScore: number;
  sweepCount: number;
  icebergScore: number;
  slippageBps: number;
  spreadBps: number;
  compositeRisk: number;
  pipelineActive: boolean;
  participantCount: number;
  updatedAt: number;
}

export interface TradeSurveillanceRule {
  id: string;
  label: string;
  enabled: boolean;
  signal: TradeSurveillanceSignalKind;
  minScore: number;
  cooldownMs: number;
}

export interface TradeSurveillanceHit {
  ruleId: string;
  ruleLabel: string;
  signal: TradeSurveillanceSignalKind;
  coin: string;
  score: number;
  at: number;
}

export const BUILTIN_TRADE_SURVEILLANCE_RULES: TradeSurveillanceRule[] = [
  {
    id: "surv_spoof_elevated",
    label: "Spoof score ≥55",
    enabled: true,
    signal: "spoof",
    minScore: 55,
    cooldownMs: 90_000,
  },
  {
    id: "surv_wash_elevated",
    label: "Wash score ≥50",
    enabled: true,
    signal: "wash",
    minScore: 50,
    cooldownMs: 120_000,
  },
  {
    id: "surv_layering",
    label: "Layering ≥45",
    enabled: true,
    signal: "layering",
    minScore: 45,
    cooldownMs: 90_000,
  },
  {
    id: "surv_toxic_flow",
    label: "Toxic flow ≥40",
    enabled: true,
    signal: "toxic_flow",
    minScore: 40,
    cooldownMs: 60_000,
  },
  {
    id: "surv_sweep_cluster",
    label: "Sweep cluster",
    enabled: false,
    signal: "sweep_cluster",
    minScore: 2,
    cooldownMs: 45_000,
  },
];

export const BUILTIN_SCREENER_ALERT_RULES: ScreenerAlertRule[] = [
  {
    id: "alert_big_mover",
    label: "Big mover ≥3%",
    enabled: true,
    presetId: "builtin_all_movers",
    minChangePct: 3,
    minComposite: 40,
    requireTag: "MOVER",
    cooldownMs: 120_000,
  },
  {
    id: "alert_news_flow",
    label: "News flow hit",
    enabled: true,
    presetId: "builtin_news_flow",
    minChangePct: 0.5,
    minComposite: 55,
    requireTag: "NEWS",
    cooldownMs: 180_000,
  },
  {
    id: "alert_perp_momentum",
    label: "Perp momentum",
    enabled: false,
    presetId: "builtin_perp_momentum",
    minChangePct: 1.5,
    minComposite: 45,
    requireTag: "PERP",
    cooldownMs: 120_000,
  },
];
