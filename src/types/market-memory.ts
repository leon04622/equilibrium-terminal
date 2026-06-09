/** Phase 47 — Historical market memory, replay & regime analysis. */

export type HistoricalEventKind =
  | "liquidation"
  | "volatility_spike"
  | "funding_shift"
  | "liquidity_crisis"
  | "exchange_incident"
  | "stablecoin_event"
  | "macro_reaction"
  | "derivatives_dislocation"
  | "narrative_rotation";

export type VolatilityRegimeClass =
  | "compression"
  | "normal"
  | "expansion"
  | "stress";

export type LiquidityRegimeClass = "abundant" | "balanced" | "thin" | "crisis";

export type MarketMemoryDashboardModeId =
  | "replay_desk"
  | "regime_lab"
  | "event_archive"
  | "analog_search"
  | "research_memory";

export type MemoryAlertKind =
  | "regime_shift"
  | "analog_match"
  | "archive_milestone"
  | "replay_ready";

export interface HistoricalEventRecord {
  id: string;
  kind: HistoricalEventKind;
  asset: string;
  headline: string;
  detail: string;
  severity: "info" | "watch" | "critical";
  timestamp: number;
  tags: string[];
}

export interface ReplayContextSnapshot {
  mode: string;
  playheadTime: number | null;
  progressPct: number;
  candleCount: number;
  spreadBps: number | null;
  intelligenceCount: number;
  replayReady: boolean;
}

export interface RegimeEpoch {
  id: string;
  label: string;
  volatility: VolatilityRegimeClass;
  liquidity: LiquidityRegimeClass;
  leverageCycle: "deleveraging" | "neutral" | "building";
  macro: "risk-on" | "risk-off" | "mixed";
  narrativeEra: string;
  startAt: number;
  endAt: number | null;
}

export interface MarketAnalogMatch {
  id: string;
  label: string;
  analogDate: string;
  similarityPct: number;
  category: "volatility" | "funding" | "liquidity" | "leverage" | "stablecoin" | "derivatives";
  summary: string;
}

export interface HistoricalLiquidityPoint {
  timestamp: number;
  exchangeConcentration: number;
  fragmentation: number;
  stablecoinFlowUsd: number;
  depthScore: number;
}

export interface NarrativeEvolutionRow {
  id: string;
  phase: string;
  sector: string;
  acceleration: number;
  timestamp: number;
}

export interface PortfolioRiskMemoryPoint {
  timestamp: number;
  leverageRatio: number;
  drawdownPct: number;
  collateralHealth: number;
}

export interface ResearchMemoryEntry {
  id: string;
  author: string;
  coin: string;
  label: string;
  body: string;
  timestamp: number;
}

export interface MemorySearchResult {
  event: HistoricalEventRecord;
  score: number;
}

export interface MemoryAlert {
  id: string;
  kind: MemoryAlertKind;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  timestamp: number;
}

export interface MarketMemoryDashboardMode {
  id: MarketMemoryDashboardModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface MarketMemoryTelemetrySnapshot {
  archiveSize: number;
  regimeEpochs: number;
  computeLatencyMs: number;
  storageQualityScore: number;
}

export interface MarketMemorySnapshot {
  asset: string;
  archive: HistoricalEventRecord[];
  replay: ReplayContextSnapshot;
  regimes: RegimeEpoch[];
  currentRegime: RegimeEpoch;
  searchResults: MemorySearchResult[];
  analogs: MarketAnalogMatch[];
  liquidityHistory: HistoricalLiquidityPoint[];
  narrativeEvolution: NarrativeEvolutionRow[];
  portfolioMemory: PortfolioRiskMemoryPoint[];
  researchMemory: ResearchMemoryEntry[];
  alerts: MemoryAlert[];
  dashboardModes: MarketMemoryDashboardMode[];
  activeMode: MarketMemoryDashboardModeId;
  telemetry: MarketMemoryTelemetrySnapshot;
  memoryScore: number;
  updatedAt: number;
}
