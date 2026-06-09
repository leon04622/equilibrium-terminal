import type { NormalizedCandle } from "@/types/terminal-schema";
import type { BehavioralFlagKind, DecisionEntry } from "@/types/operator-journal";

export type ReplayWindowMinutes = 1 | 5 | 15 | 30;

export interface DecisionReplayPayload {
  decisionId: string;
  at: number;
  asset: string;
  kind: DecisionEntry["kind"];
  confidence: number;
  emotion: string;
  thesis: string;
  riskNote: string;
  regime: string;
  volatilityState: string;
  liquidityState: string;
  fundingEnvironment: string;
  spreadBps: number | null;
  markPrice: number | null;
  session: string;
  label: string;
  flagKind: BehavioralFlagKind | null;
}

export interface ReplayCoaching {
  before: string;
  atPoint: string;
  after: string;
  liquidityVerdict: { tone: "good" | "neutral" | "poor"; text: string };
  volatilityVerdict: { tone: "good" | "neutral" | "poor"; text: string };
  spreadVerdict: { tone: "good" | "neutral" | "poor"; text: string };
  reviewPrompt: string;
}

export interface ExecutionReplayMetrics {
  applicable: boolean;
  spreadBps: number;
  depthScore: number; // 0..100
  slippageEstBps: number;
  chaseRisk: "low" | "elevated" | "high";
  timingQuality: string;
}

export interface DecisionReplayBundle {
  payload: DecisionReplayPayload;
  candles: NormalizedCandle[];
  decisionIndex: number;
  coaching: ReplayCoaching;
  execution: ExecutionReplayMetrics;
  behavioralHighlight: string | null;
  windowMinutes: ReplayWindowMinutes;
  priceMoveAfterPct: number;
  priceMoveBeforePct: number;
}
