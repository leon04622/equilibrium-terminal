/** Phase 58 — Global market command center & situational awareness. */

export type MarketCommandModeId =
  | "situation_room"
  | "systemic_watch"
  | "liquidity_map"
  | "incident_command"
  | "cross_asset";

export interface MarketOverviewRow {
  id: string;
  domain: string;
  metric: string;
  value: string;
  status: string;
}

export interface SystemicRiskRow {
  id: string;
  factor: string;
  score: number;
  tier: string;
}

export interface LiquidityMapRow {
  id: string;
  route: string;
  magnitude: string;
  velocity: string;
}

export interface VolatilityCommandRow {
  id: string;
  indicator: string;
  value: string;
  severity: string;
}

export interface IncidentCommandRow {
  id: string;
  incident: string;
  severity: string;
  playbook: string;
}

export interface CrossAssetVizRow {
  id: string;
  link: string;
  assets: string;
  priority: number;
}

export interface OrgCommandRow {
  id: string;
  scope: string;
  status: string;
  detail: string;
}

export interface VisualOrchestrationRow {
  id: string;
  control: string;
  state: string;
}

export interface MarketCommandDashboardMode {
  id: MarketCommandModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface MarketCommandTelemetrySnapshot {
  criticalIncidents: number;
  systemicTier: string;
  entityCount: number;
  computeLatencyMs: number;
  situationalScore: number;
}

export interface MarketCommandSnapshot {
  asset: string;
  overview: MarketOverviewRow[];
  systemicRisk: SystemicRiskRow[];
  liquidityMaps: LiquidityMapRow[];
  volatility: VolatilityCommandRow[];
  incidents: IncidentCommandRow[];
  crossAsset: CrossAssetVizRow[];
  orgCommand: OrgCommandRow[];
  visualOrchestration: VisualOrchestrationRow[];
  situationalBrief: string;
  aiSummary: string;
  dashboardModes: MarketCommandDashboardMode[];
  activeMode: MarketCommandModeId;
  telemetry: MarketCommandTelemetrySnapshot;
  situationalScore: number;
  updatedAt: number;
}
