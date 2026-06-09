/** Phase 55 — AI-assisted operator, workflow acceleration & contextual intelligence. */

export type OperatorAiModeId =
  | "desk_assist"
  | "intel_compress"
  | "research_flow"
  | "cross_context"
  | "briefing_ops";

export interface ContextualInsightRow {
  id: string;
  domain: string;
  summary: string;
  confidence: number;
}

export interface IntelSummaryRow {
  id: string;
  category: string;
  headline: string;
  severity: string;
}

export interface WorkflowSuggestionRow {
  id: string;
  command: string;
  description: string;
}

export interface ResearchAssistRow {
  id: string;
  label: string;
  detail: string;
}

export interface SystemContextRow {
  system: string;
  status: string;
  score: number | null;
}

export interface BriefingRow {
  id: string;
  category: string;
  headline: string;
  severity: string;
}

export interface RetrievalHitRow {
  id: string;
  source: string;
  snippet: string;
  relevance: number;
}

export interface SafetyBoundaryRow {
  id: string;
  rule: string;
  enforced: boolean;
}

export interface InferenceInfraRow {
  id: string;
  component: string;
  latencyMs: number;
  status: string;
}

export interface OperatorAiDashboardMode {
  id: OperatorAiModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface OperatorAiTelemetrySnapshot {
  contextSources: number;
  summariesGenerated: number;
  retrievalHits: number;
  inferenceLatencyMs: number;
  assistantScore: number;
}

export interface OperatorAiSnapshot {
  asset: string;
  contextualInsights: ContextualInsightRow[];
  intelSummaries: IntelSummaryRow[];
  workflowSuggestions: WorkflowSuggestionRow[];
  researchAssist: ResearchAssistRow[];
  systemContext: SystemContextRow[];
  briefings: BriefingRow[];
  retrievalHits: RetrievalHitRow[];
  safetyBoundaries: SafetyBoundaryRow[];
  inferenceInfra: InferenceInfraRow[];
  operatorBrief: string;
  dashboardModes: OperatorAiDashboardMode[];
  activeMode: OperatorAiModeId;
  lastQuery: string | null;
  telemetry: OperatorAiTelemetrySnapshot;
  assistantScore: number;
  updatedAt: number;
}
