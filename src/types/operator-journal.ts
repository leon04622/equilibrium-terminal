/** Phase 63 — Live session tracking, decision journal & operator performance review. */

export type EmotionalState =
  | "calm"
  | "confident"
  | "anxious"
  | "frustrated"
  | "fomo"
  | "fatigued";

export type DecisionKind = "entry" | "exit" | "adjust" | "skip" | "observation";

export type BehavioralFlagKind =
  | "revenge_trading"
  | "overtrading"
  | "volatility_chasing"
  | "poor_liquidity_exec"
  | "oversized_risk"
  | "emotional_deterioration";

export interface MarketContextStamp {
  regime: string;
  volatilityState: string;
  liquidityState: string;
  fundingEnvironment: string;
  riskOnOff: string;
  spreadBps: number | null;
  markPrice: number | null;
  session: string;
  label: string;
}

export interface DecisionEntry {
  id: string;
  at: number;
  coin: string;
  kind: DecisionKind;
  thesis: string;
  confidence: number; // 1..5
  emotion: EmotionalState;
  riskNote: string;
  context: MarketContextStamp;
  /** Post-replay reflection added during decision review. */
  reflection?: string;
}

export interface ExecutionQuality {
  score: number; // 0..100
  slippageBias: "favorable" | "neutral" | "adverse";
  chaseRate: number; // 0..1
  overtradingPressure: number; // 0..1
  lowLiquidityExec: number; // 0..1
  notes: string[];
}

export interface BehavioralFlag {
  id: string;
  kind: BehavioralFlagKind;
  severity: "info" | "watch" | "critical";
  message: string;
  at: number;
}

export interface OperatorSession {
  id: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number;
  decisionsCount: number;
  regimesParticipated: string[];
  volatilityExposure: string[];
  liquidityConditions: string[];
  macroParticipation: boolean;
  peakStressLabel: string;
}

export interface SessionReview {
  generatedAt: number;
  sessionId: string;
  qualityScore: number;
  executionScore: number;
  disciplineScore: number;
  bestDecision: DecisionEntry | null;
  worstDecision: DecisionEntry | null;
  dangerousBehaviors: string[];
  volatilityAdaptation: string;
  missedOpportunities: string;
  observations: string[];
}

export interface PerformancePattern {
  id: string;
  label: string;
  detail: string;
  polarity: "strength" | "weakness" | "neutral";
  confidence: number; // 0..100
}

export interface OperatorScorecard {
  execution: number;
  discipline: number;
  decisionQuality: number;
  consistency: number;
  composite: number;
  grade: "A" | "B" | "C" | "D" | "F";
}

export interface OperatorJournalSnapshot {
  session: OperatorSession;
  decisions: DecisionEntry[];
  executionQuality: ExecutionQuality;
  behavioralFlags: BehavioralFlag[];
  review: SessionReview | null;
  patterns: PerformancePattern[];
  scorecard: OperatorScorecard;
  history: OperatorSession[];
  context: MarketContextStamp;
  updatedAt: number;
}
