/** Phase 20 — Daily Market Operating Environment. */

import type { MarketRegime } from "@/types/market-atmosphere";
import type { AlertSeverity } from "@/types/alerts";

export type TradingSessionId = "asia" | "europe" | "us" | "overlap" | "weekend_crypto";

export type SessionWorkflowPreset =
  | "asia_open"
  | "london_open"
  | "ny_open"
  | "weekend_crypto"
  | "post_fomc"
  | "etf_hours";

export type RoutineId =
  | "morning_briefing"
  | "volatility_scan"
  | "liquidity_check"
  | "funding_scan"
  | "narrative_scan"
  | "execution_prep"
  | "post_session_review";

export interface SessionClockSnapshot {
  utcHour: number;
  activeSession: TradingSessionId;
  label: string;
  liquidityPhase: "building" | "peak" | "fading" | "thin";
  nextTransitionLabel: string;
  nextTransitionAt: number;
  updatedAt: number;
}

export interface BriefingBullet {
  id: string;
  category:
    | "overnight"
    | "session"
    | "volatility"
    | "funding"
    | "liquidation"
    | "macro"
    | "etf"
    | "stablecoin"
    | "narrative"
    | "liquidity";
  headline: string;
  detail: string;
  severity: "info" | "watch" | "critical";
}

export interface DailyBriefing {
  generatedAt: number;
  session: TradingSessionId;
  headline: string;
  bullets: BriefingBullet[];
  macroEventsToday: number;
  alertPressure: number;
}

export interface MarketConditionLayer {
  regime: MarketRegime;
  volatilityState: "compressed" | "normal" | "elevated" | "extreme";
  liquidityState: "deep" | "adequate" | "thin" | "stressed";
  fundingEnvironment: "neutral" | "long_pays" | "short_pays" | "extreme";
  sentimentEnvironment: "risk-on" | "risk-off" | "mixed";
  macroRiskLevel: "low" | "moderate" | "elevated" | "event";
  riskOnOff: "risk-on" | "risk-off" | "neutral";
  breadthScore: number;
  compositeLabel: string;
  updatedAt: number;
}

export interface MarketMemoryEntry {
  id: string;
  session: TradingSessionId;
  savedAt: number;
  summary: string;
  regime: MarketRegime;
  stressScore: number;
  topMovers: string[];
}

export interface OperationalRoutine {
  id: RoutineId;
  label: string;
  description: string;
  panelSequence: string[];
  checklist: string[];
}

export interface PersonalOpsDashboard {
  watchlistCount: number;
  activeAlerts: number;
  journalEntries: number;
  savedViews: number;
  pinnedHeadlines: string[];
  favoriteCoins: string[];
  checklist: { id: string; label: string; done: boolean }[];
  updatedAt: number;
}

export interface PrioritizedAlertRow {
  id: string;
  coin: string;
  title: string;
  severity: AlertSeverity;
  priorityScore: number;
  reason: string;
  timestamp: number;
}

export interface DailyOperationsSnapshot {
  clock: SessionClockSnapshot;
  briefing: DailyBriefing;
  marketState: MarketConditionLayer;
  memory: MarketMemoryEntry[];
  personal: PersonalOpsDashboard;
  prioritizedAlerts: PrioritizedAlertRow[];
}
