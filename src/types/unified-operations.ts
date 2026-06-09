/** Phase 56 — Unified institutional operating experience & workflow orchestration. */

import type { TerminalMode } from "@/types/adaptive-workspace";

export type UnifiedOpsModeId =
  | "command_center"
  | "execution_flow"
  | "intel_fusion"
  | "research_continuity"
  | "risk_surveillance";

export interface WorkflowCoordinationRow {
  id: string;
  label: string;
  status: string;
  detail: string;
}

export interface GlobalContextRow {
  key: string;
  value: string;
}

export interface EventPropagationRow {
  id: string;
  trigger: string;
  targets: string;
  status: string;
}

export interface OperationalModeRow {
  id: string;
  terminalMode: TerminalMode;
  label: string;
  primaryPanels: string[];
}

export interface ContinuityRow {
  id: string;
  domain: string;
  state: string;
  updatedAt: number;
}

export interface ImmersionCommandRow {
  id: string;
  command: string;
  description: string;
}

export interface DesignSystemRow {
  id: string;
  token: string;
  value: string;
}

export interface CrossDeviceRow {
  id: string;
  channel: string;
  sync: string;
}

export interface AiEmbedRow {
  id: string;
  workflow: string;
  assist: string;
}

export interface UnifiedOpsDashboardMode {
  id: UnifiedOpsModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface UnifiedOpsTelemetrySnapshot {
  linkedSystems: number;
  propagationRules: number;
  continuityItems: number;
  orchestrationLatencyMs: number;
  unifiedScore: number;
}

export interface UnifiedOpsSnapshot {
  asset: string;
  workflowCoordination: WorkflowCoordinationRow[];
  globalContext: GlobalContextRow[];
  eventPropagation: EventPropagationRow[];
  operationalModes: OperationalModeRow[];
  continuity: ContinuityRow[];
  immersionCommands: ImmersionCommandRow[];
  designSystem: DesignSystemRow[];
  crossDevice: CrossDeviceRow[];
  aiEmbedding: AiEmbedRow[];
  unifiedBrief: string;
  activeTerminalMode: TerminalMode;
  dashboardModes: UnifiedOpsDashboardMode[];
  activeMode: UnifiedOpsModeId;
  telemetry: UnifiedOpsTelemetrySnapshot;
  unifiedScore: number;
  updatedAt: number;
}
