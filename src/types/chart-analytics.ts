/** Phase 34 — Advanced charting, visual analytics & market replay. */

export type ChartTimeframe = "1s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type ChartOverlayLayer =
  | "liquidity_heatmap"
  | "depth_overlay"
  | "imbalance"
  | "aggressor_flow"
  | "volume_profile"
  | "cvd"
  | "funding"
  | "open_interest"
  | "liquidation_zones"
  | "event_markers";

export type ReplayMode = "live" | "paused" | "playing" | "scrubbing";

export type ChartEventKind =
  | "intelligence"
  | "whale"
  | "liquidation"
  | "macro"
  | "funding"
  | "exchange"
  | "narrative"
  | "execution";

export interface ChartEventMarker {
  id: string;
  time: number;
  kind: ChartEventKind;
  label: string;
  severity: "info" | "watch" | "critical";
  price: number | null;
}

export interface VolumeProfileRow {
  price: number;
  bidVolume: number;
  askVolume: number;
  totalVolume: number;
}

export interface FlowAnalytics {
  cumulativeDelta: number;
  buyVolume: number;
  sellVolume: number;
  aggressorImbalancePct: number;
  absorptionScore: number;
  updatedAt: number;
}

export interface ChartSyncState {
  linked: boolean;
  timeframe: ChartTimeframe;
  cursorTime: number | null;
  sourceChartId: string | null;
}

export interface ReplayState {
  mode: ReplayMode;
  playheadTime: number | null;
  speed: 1 | 2 | 4 | 8;
  rangeStart: number;
  rangeEnd: number;
  progressPct: number;
}

export interface ChartMicrostructureSnapshot {
  spreadBps: number | null;
  bookImbalancePct: number | null;
  liquidityWithdrawal: boolean;
  heatmapIntensity: number;
}

export interface ChartAnalyticsSnapshot {
  coin: string;
  timeframe: ChartTimeframe;
  sync: ChartSyncState;
  replay: ReplayState;
  overlays: ChartOverlayLayer[];
  eventMarkers: ChartEventMarker[];
  volumeProfile: VolumeProfileRow[];
  flow: FlowAnalytics;
  microstructure: ChartMicrostructureSnapshot;
  barCount: number;
  updatedAt: number;
}
