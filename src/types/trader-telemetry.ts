/** Phase 11 — Trader Operating Test Environment schemas. */

import type { Layout } from "react-grid-layout";

export type TraderSegment = "scalper" | "swing" | "analyst" | "passive" | "unknown";

export type InteractionKind =
  | "click"
  | "asset_focus"
  | "layout_change"
  | "omnibar_command"
  | "alert_view"
  | "alert_bypass"
  | "widget_focus"
  | "intel_wire"
  | "panel_maximize"
  | "stream_status";

export interface TraderInteractionEvent {
  id: string;
  kind: InteractionKind;
  at: number;
  durationMs?: number;
  panelId?: string;
  /** Anonymized asset reference — never raw wallet or order params */
  coinHash?: string;
  routeHash: string;
  severity?: "info" | "watch" | "critical";
  meta?: Record<string, string | number | boolean>;
}

export interface CognitiveLoadMetrics {
  alertFatigueIndex: number;
  hesitationLagMs: number;
  hesitationP95Ms: number;
  navigationRepetitionScore: number;
  bypassedCriticalAlerts: number;
  bypassedWatchAlerts: number;
  focusSwitchRatePerMin: number;
  cognitiveFrictionScore: number;
  samplesHesitation: number;
  updatedAt: number;
}

export interface PlatformVitals {
  eventBufferDepth: number;
  eventsPerSecond: number;
  avgProcessMs: number;
  lastProcessMs: number;
  droppedFrames: number;
  wsReconnectLagMs: number;
  lastStreamStatus: string;
  pipelineActive: boolean;
  memoryHintMb: number;
  updatedAt: number;
}

export interface LayoutFocusTrend {
  panelId: string;
  focusCount: number;
  totalDwellMs: number;
  lastFocusAt: number;
}

export interface AdaptiveLayoutSuggestion {
  layout: Layout[];
  reason: string;
  segment: TraderSegment;
  appliedAt: number | null;
}

export interface HesitationSample {
  alertEventHash: string;
  focusLagMs: number;
  severity: "info" | "watch" | "critical";
  recordedAt: number;
}
