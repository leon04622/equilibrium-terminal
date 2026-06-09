/** Phase 57 — Institutional execution desk, trader workflow & live operations. */

import type { ExecutionWorkspaceModeId } from "@/types/execution-analytics";

export type LiveExecModeId =
  | "floor_command"
  | "scalp_flow"
  | "vol_response"
  | "desk_coordination"
  | "multi_asset";

export type LiveExecDeskId =
  | "scalping"
  | "derivatives"
  | "macro"
  | "volatility"
  | "treasury"
  | "liquidity"
  | "market_making";

export interface ExecutionWorkspaceRow {
  id: LiveExecDeskId;
  label: string;
  analyticsMode: ExecutionWorkspaceModeId;
  primaryPanels: string[];
}

export interface ExecutionSurfaceRow {
  id: string;
  surface: string;
  status: string;
  detail: string;
}

export interface ExecutionContextRow {
  id: string;
  metric: string;
  value: string;
  tier: string;
}

export interface MultiAssetRow {
  id: string;
  asset: string;
  signal: string;
  priority: number;
}

export interface RapidResponseRow {
  id: string;
  event: string;
  severity: string;
  action: string;
}

export interface CoordinationRow {
  id: string;
  kind: string;
  message: string;
  author: string;
}

export interface PerformanceRow {
  id: string;
  metric: string;
  value: string;
}

export interface SessionContinuityRow {
  id: string;
  domain: string;
  state: string;
}

export interface HotkeyRow {
  id: string;
  key: string;
  action: string;
}

export interface LiveExecDashboardMode {
  id: LiveExecModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface LiveExecTelemetrySnapshot {
  openPositions: number;
  activeAlerts: number;
  pipelineActive: boolean;
  computeLatencyMs: number;
  liveExecScore: number;
}

export interface LiveExecSnapshot {
  asset: string;
  workspaces: ExecutionWorkspaceRow[];
  surfaces: ExecutionSurfaceRow[];
  context: ExecutionContextRow[];
  multiAsset: MultiAssetRow[];
  rapidResponse: RapidResponseRow[];
  coordination: CoordinationRow[];
  performance: PerformanceRow[];
  continuity: SessionContinuityRow[];
  hotkeys: HotkeyRow[];
  liveBrief: string;
  activeDesk: LiveExecDeskId;
  activeAnalyticsMode: ExecutionWorkspaceModeId;
  dashboardModes: LiveExecDashboardMode[];
  activeMode: LiveExecModeId;
  telemetry: LiveExecTelemetrySnapshot;
  liveExecScore: number;
  updatedAt: number;
}
