/** Phase 62 — Contextual explain mode & replay-based learning. */



export type OperatorGuideTab =

  | "glossary"

  | "scenarios"

  | "workflows"

  | "replay"

  | "modes";



export type OperatorGuideModeId =

  | "desk_mastery"

  | "execution_ops"

  | "intel_surveillance"

  | "replay_training";



export type ScenarioCategory =

  | "liquidation_cascade"

  | "volatility_spike"

  | "trend_continuation"

  | "gamma_squeeze"

  | "stablecoin_stress"

  | "macro_event"

  | "exchange_failure"

  | "funding_squeeze"

  | "cross_venue_divergence";



export type WorkflowId =

  | "monitor_liquidity"

  | "read_order_flow"

  | "interpret_funding"

  | "read_volatility"

  | "execute_with_context"

  | "alert_response";



export type ExplainAudience = "scalp" | "swing" | "beginner" | "advanced";



export type ExplainVisualCueType =

  | "spread_widen"

  | "spread_compress"

  | "bid_stack"

  | "ask_reload"

  | "tape_buy"

  | "tape_sell"

  | "vol_expand"

  | "funding_flip"

  | "liquidation"

  | "breakout"

  | "flow_imbalance";



export type ProNextAction =

  | "wait"

  | "reduce_size"

  | "avoid_market"

  | "use_limit"

  | "monitor_funding"

  | "watch_continuation"

  | "check_liquidity"

  | "hedge"

  | "stand_aside";



export interface ExplainVisualCue {

  type: ExplainVisualCueType;

  label: string;

  caption: string;

}



export interface ProAction {

  action: ProNextAction;

  detail: string;

}



export interface ComponentGuideEntry {

  id: string;

  title: string;

  telemetry: string;

  operationalExplanation: string;

  whyItMatters: string;

  professionalUsage: string;

  marketInterpretation: string;

  relatedSystems: string[];

  workflowConnections: string[];

  shortcuts: string[];

  useCases: string[];

  relatedMetrics: string[];

}



/** Panel-specific operational education — trader workflow, not architecture. */

export interface OperationalPlaybook {

  panelRole: string;

  lookFirst: string[];

  whatChangesMatter: string;

  bullish: string;

  bearish: string;

  confirms: string;

  invalidates: string;

  dangerZone: string;

  proMonitors: string[];

  proDoesNext: ProAction;

  beginnerMistakes: string[];

  workflowSteps: string[];

  visualCues: ExplainVisualCue[];

  replayScenarioId: string;

  focusPanelsOnReplay: string[];

}



/** One progressive attention step in a guided visual lesson. */

/** A temporary instructional label drawn directly on the focused panel. */
export type ExplainLabelTone = "neutral" | "good" | "bad" | "warn";
export type ExplainLabelAnchor =
  | "tl"
  | "tr"
  | "bl"
  | "br"
  | "center"
  | "left"
  | "right";

export interface ExplainLabel {
  text: string;
  anchor: ExplainLabelAnchor;
  tone?: ExplainLabelTone;
}

export interface GuidedLessonStep {
  id: string;
  order: number;
  instruction: string;
  focusPanel: string;
  visualCue: ExplainVisualCueType;
  cause: string;
  effect: string;
  beginnerNote: string;
  proNote: string;
  /** PHASE 4 — labels overlaid on the focused panel for this step. */
  labels?: ExplainLabel[];
  /**
   * PHASE 3 — calm spoken narration (plain English) for this step. When absent
   * the player falls back to the instruction + beginner note. Pro mode speaks
   * the proNote instead.
   */
  narration?: string;
}

export interface GuidedLesson {
  id: string;
  panelId: string;
  title: string;
  objective: string;
  replayScenarioId: string;
  steps: GuidedLessonStep[];
}

/** Live-enriched operational explanation shown in the guide drawer. */

export interface OperationalExplanation {

  panelRole: string;

  lookFirst: string[];

  whatChangesMatter: string;

  liveReading: string;

  bullish: string;

  bearish: string;

  confirms: string;

  invalidates: string;

  dangerZone: string;

  proMonitors: string[];

  proDoesNext: ProAction;

  beginnerMistakes: string[];

  workflowSteps: string[];

  visualCues: ExplainVisualCue[];

  connectedPanels: string[];

  replayScenarioId: string;

}



/** @deprecated Use OperationalExplanation — kept for snapshot compatibility. */

export interface ContextualExplanation {

  whatThisIs: string;

  whyThisMattersNow: string;

  professionalUsageNow: string;

  liveReadingMeaning: string;

  beginnerExplanation: string;

  advancedExplanation: string;

  bullishInterpretation: string;

  bearishInterpretation: string;

  liveMarketContext: string;

  commonMistakes: string[];

  panelConnections: string[];

  howToUseInTrade: string;

}



export interface ScenarioLibraryEntry {

  id: string;

  category: ScenarioCategory;

  title: string;

  headline: string;

  asset: string;

  durationSec: number;

  severity: "info" | "watch" | "critical";

  professionalContext: string;

  focusPanels: string[];

  replayReady: boolean;

}



export interface ReplayAnnotation {

  id: string;

  progressPct: number;

  headline: string;

  explanation: string;

  riskNote: string;

  focusPanel: string | null;

  visualCue?: ExplainVisualCueType;

}



export interface ActiveReplayState {

  scenarioId: string;

  title: string;

  progressPct: number;

  mode: string;

  playheadTime: number | null;

  annotations: ReplayAnnotation[];

  activeAnnotation: ReplayAnnotation | null;

}



export interface WorkflowStep {

  id: string;

  order: number;

  title: string;

  detail: string;

  focusPanel: string;

  explainTarget: string;

}



export interface WorkflowWalkthrough {

  id: WorkflowId;

  title: string;

  objective: string;

  steps: WorkflowStep[];

}



export interface OperatorGuideTelemetry {

  registrySize: number;

  scenarioCount: number;

  workflowCount: number;

  explainSessions: number;

  replaysStarted: number;

  guideScore: number;

}



export interface OperatorGuideDashboardMode {

  id: OperatorGuideModeId;

  label: string;

  description: string;

  panels: string[];

}



export interface OperatorGuideSnapshot {

  asset: string;

  explainModeActive: boolean;

  sidePanelOpen: boolean;

  selectedTargetId: string | null;

  selectedEntry: ComponentGuideEntry | null;

  selectedAudience: ExplainAudience;

  operational: OperationalExplanation | null;

  /** @deprecated */

  contextual: ContextualExplanation | null;

  registry: ComponentGuideEntry[];

  scenarios: ScenarioLibraryEntry[];

  workflows: WorkflowWalkthrough[];

  activeWorkflow: WorkflowWalkthrough | null;

  activeWorkflowStep: number;

  activeReplay: ActiveReplayState | null;

  dashboardModes: OperatorGuideDashboardMode[];

  activeMode: OperatorGuideModeId;

  telemetry: OperatorGuideTelemetry;

  guideScore: number;

  updatedAt: number;

}


