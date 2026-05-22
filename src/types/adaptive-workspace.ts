/** Phase 15 — Adaptive Workspace Intelligence schemas. */

import type { Layout } from "react-grid-layout";
import type { MarketRegime } from "@/types/market-atmosphere";

export type TerminalMode =
  | "balanced"
  | "execution"
  | "research"
  | "macro"
  | "scalping"
  | "ai_analyst"
  | "portfolio"
  | "narrative"
  | "quant";

export type FocusMode =
  | "none"
  | "execution_deep"
  | "chart_isolated"
  | "ai_briefing"
  | "macro_command"
  | "asset_war_room";

export type WorkflowPhase =
  | "observing"
  | "analyzing"
  | "executing"
  | "reviewing"
  | "idle";

export type ExecutionContextState =
  | "flat"
  | "staging"
  | "active_order"
  | "in_position"
  | "closing";

export interface WorkspaceContextSnapshot {
  activeCoin: string;
  workflowPhase: WorkflowPhase;
  executionState: ExecutionContextState;
  marketRegime: MarketRegime;
  volatilityScore: number;
  spreadBps: number | null;
  orderPending: boolean;
  positionCount: number;
  alertPressure: number;
  slippageRiskTier: "low" | "elevated" | "high" | "critical";
  cognitiveFriction: number;
  focusPanelId: string | null;
  sessionMinutes: number;
  updatedAt: number;
}

export interface PanelPriorityScore {
  panelId: string;
  relevance: number;
  urgency: number;
  activity: number;
  affinity: number;
  composite: number;
  emphasize: boolean;
  collapse: boolean;
  hide: boolean;
}

export interface CognitiveLoadModel {
  overloadRisk: number;
  visualNoiseIndex: number;
  alertFatigue: number;
  focusDispersion: number;
  recommendedMode: TerminalMode;
  suppressFlashes: boolean;
  suppressDuplicateIntel: boolean;
  throttleAlerts: boolean;
  updatedAt: number;
}

export interface LayoutOrchestrationResult {
  layout: Layout[];
  mode: TerminalMode;
  focusMode: FocusMode;
  scores: PanelPriorityScore[];
  collapsedPanelIds: string[];
  hiddenPanelIds: string[];
  reason: string;
  appliedAt: number;
}

export interface AdaptiveLayoutProposal {
  layout: Layout[];
  reason: string;
  confidence: number;
  source: "mode" | "regime" | "telemetry" | "focus" | "manual";
}

export const ALL_WORKSPACE_PANEL_IDS = [
  "macro",
  "hyperbook",
  "chart",
  "intelligence",
  "copilot",
  "proactive",
  "ticket",
  "positions",
  "teamdesk",
  "alerts",
  "diagnostics",
  "alphalab",
  "infra",
  "domladder",
  "slippageradar",
  "decision",
  "surveillance",
  "knowledgegraph",
  "traderjournal",
  "research",
  "dailyops",
  "marketcoverage",
  "reliability",
  "newswire",
  "ingestion",
  "intelengine",
  "collab",
  "enterpriseops",
  "integrations",
  "propintel",
  "ecosystem",
] as const;

export type WorkspacePanelId = (typeof ALL_WORKSPACE_PANEL_IDS)[number];
