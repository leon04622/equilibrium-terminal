/** Phase 50 — Mobile companion, alerting & continuous operational awareness. */

export type MobileDeskModeId =
  | "awareness"
  | "alert_focus"
  | "portfolio_oversight"
  | "incident_response"
  | "handoff";

export type MobilePlatform = "ios" | "android" | "shared";

export type MobileAlertKind =
  | "volatility"
  | "liquidation"
  | "funding"
  | "whale"
  | "portfolio_risk"
  | "execution"
  | "exchange_incident"
  | "systemic"
  | "macro";

export type MobileAlertSeverity = "info" | "watch" | "critical";

export interface MobilePlatformTarget {
  platform: MobilePlatform;
  stack: string;
  pushProvider: string;
  status: "staged" | "beta" | "live";
  minOs: string;
}

export interface OperationalAlert {
  id: string;
  kind: MobileAlertKind;
  severity: MobileAlertSeverity;
  headline: string;
  detail: string;
  coin: string | null;
  pushed: boolean;
  timestamp: number;
}

export interface MobileIntelRow {
  id: string;
  headline: string;
  category: string;
  severity: MobileAlertSeverity;
  coin: string | null;
  timestamp: number;
}

export interface PortfolioOversightRow {
  label: string;
  value: string;
  status: "ok" | "watch" | "critical";
}

export interface ExecutionOversightRow {
  label: string;
  value: string;
  actionable: boolean;
}

export interface WatchlistAsset {
  coin: string;
  change24hPct: number;
  volRegime: string;
  alertCount: number;
}

export interface CrossDeviceSession {
  deviceId: string;
  label: string;
  lastActiveAt: number;
  alertsSynced: number;
  handoffReady: boolean;
}

export interface IncidentModeCard {
  id: string;
  kind: string;
  headline: string;
  operationalSummary: string;
  severity: MobileAlertSeverity;
  actions: string[];
}

export interface MobilePerformanceVitals {
  wsReconnects: number;
  batteryMode: "normal" | "saver" | "critical";
  backgroundPushEnabled: boolean;
  offlineQueueSize: number;
  avgUpdateIntervalMs: number;
}

export interface MobileDeskDashboardMode {
  id: MobileDeskModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface MobileDeskTelemetrySnapshot {
  alertCount: number;
  criticalAlerts: number;
  pushDelivered24h: number;
  syncedDevices: number;
  computeLatencyMs: number;
  awarenessScore: number;
}

export interface MobileDeskSnapshot {
  asset: string;
  platforms: MobilePlatformTarget[];
  alerts: OperationalAlert[];
  intelFeed: MobileIntelRow[];
  portfolio: PortfolioOversightRow[];
  execution: ExecutionOversightRow[];
  watchlist: WatchlistAsset[];
  sessions: CrossDeviceSession[];
  incidentMode: IncidentModeCard | null;
  performance: MobilePerformanceVitals;
  awarenessBrief: string;
  dashboardModes: MobileDeskDashboardMode[];
  activeMode: MobileDeskModeId;
  telemetry: MobileDeskTelemetrySnapshot;
  awarenessScore: number;
  updatedAt: number;
}
