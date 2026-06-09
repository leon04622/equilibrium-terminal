/** Phase 41 — controlled institutional alpha launch & operational iteration. */

export type AlphaCohort =
  | "hl_power_user"
  | "professional_scalper"
  | "liquidity_trader"
  | "small_desk"
  | "execution_heavy";

export type AlphaFeatureFlag =
  | "execution"
  | "intelligence_feed"
  | "alerts"
  | "advanced_panels"
  | "stress_replay"
  | "collaboration";

export interface AlphaFeatureFlagState {
  id: AlphaFeatureFlag;
  label: string;
  enabled: boolean;
  killSwitch: boolean;
}

export type RetentionSignal = "forming" | "emerging" | "weak" | "unknown";

export interface RetentionMetrics {
  sessions7d: number;
  avgSessionMin: number;
  workflowDepthScore: number;
  panelEngagementScore: number;
  omniBarUsageScore: number;
  habitFormationScore: number;
  dependencySignal: RetentionSignal;
  dailyReturnLikelihood: number;
}

export interface TrustValidationRow {
  dimension: string;
  score: number;
  trend: "up" | "stable" | "down";
  detail: string;
}

export interface WorkflowObservationRow {
  signal: string;
  value: string;
  weight: "high" | "medium" | "low";
}

export interface FeedbackPainPoint {
  id: string;
  category: "friction" | "execution" | "intel" | "workspace" | "infra";
  summary: string;
  priority: "p0" | "p1" | "p2";
  occurrences: number;
}

export interface AlphaSuccessIndicator {
  label: string;
  met: boolean;
  detail: string;
}

export interface AlphaLaunchSnapshot {
  inviteActive: boolean;
  inviteValidated: boolean;
  cohort: AlphaCohort | null;
  rolloutPct: number;
  environmentIsolated: boolean;
  killSwitchActive: boolean;
  featureFlags: AlphaFeatureFlagState[];
  retention: RetentionMetrics;
  trust: TrustValidationRow[];
  workflowObservations: WorkflowObservationRow[];
  painPoints: FeedbackPainPoint[];
  successIndicators: AlphaSuccessIndicator[];
  operationalScore: number;
  iterationFocus: string[];
  updatedAt: number;
}
