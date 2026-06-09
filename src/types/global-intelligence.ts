/** Phase 54 — Global news, macro & cross-asset intelligence infrastructure. */

export type MacroEventCategory =
  | "macro"
  | "regulation"
  | "ETF"
  | "geopolitics"
  | "exchange"
  | "protocol"
  | "liquidity"
  | "operational";

export type GlobalIntelModeId =
  | "macro_command"
  | "news_wire"
  | "regulatory_watch"
  | "cross_asset"
  | "propagation";

export interface MacroEvent {
  id: string;
  category: MacroEventCategory;
  severity: number;
  affectedAssets: string[];
  timestamp: number;
  summary: string;
  source: string;
}

export interface NewsFeedRow {
  id: string;
  category: string;
  headline: string;
  source: string;
  severity: string;
  coin: string | null;
  score: number;
}

export interface MacroIndicatorRow {
  symbol: string;
  label: string;
  last: number;
  changePct: number;
}

export interface MacroCalendarRow {
  id: string;
  title: string;
  region: string;
  impact: string;
  scheduledAt: number;
}

export interface EtfFlowRow {
  id: string;
  entity: string;
  note: string;
  category: string;
}

export interface RegulatoryRow {
  id: string;
  jurisdiction: string;
  topic: string;
  severity: string;
  summary: string;
}

export interface CrossAssetRow {
  id: string;
  category: string;
  headline: string;
  assets: string[];
  priority: number;
}

export interface PropagationRow {
  id: string;
  trigger: string;
  propagation: string;
  severity: string;
}

export interface GlobalAlertRow {
  id: string;
  kind: string;
  headline: string;
  severity: string;
}

export interface GlobalIntelDashboardMode {
  id: GlobalIntelModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface GlobalIntelTelemetrySnapshot {
  wireItems: number;
  macroEvents: number;
  criticalAlerts: number;
  computeLatencyMs: number;
  globalScore: number;
}

export interface GlobalIntelSnapshot {
  asset: string;
  newsFeed: NewsFeedRow[];
  macroEvents: MacroEvent[];
  macroIndicators: MacroIndicatorRow[];
  macroCalendar: MacroCalendarRow[];
  etfFlows: EtfFlowRow[];
  regulatory: RegulatoryRow[];
  crossAsset: CrossAssetRow[];
  propagation: PropagationRow[];
  alerts: GlobalAlertRow[];
  globalBrief: string;
  dashboardModes: GlobalIntelDashboardMode[];
  activeMode: GlobalIntelModeId;
  telemetry: GlobalIntelTelemetrySnapshot;
  globalScore: number;
  updatedAt: number;
}
