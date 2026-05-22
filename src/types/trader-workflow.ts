/** Phase 19 — Unified Trader Workflow System. */

import type { Layout } from "react-grid-layout";

export type JournalEntryKind =
  | "trade_note"
  | "thesis"
  | "execution"
  | "session"
  | "review"
  | "psychology"
  | "alert_response";

export interface JournalEntry {
  id: string;
  kind: JournalEntryKind;
  coin: string | null;
  title: string;
  body: string;
  tags: string[];
  linkedAlertId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ThesisBoard {
  id: string;
  coin: string;
  thesis: string;
  invalidation: string;
  status: "active" | "closed" | "invalidated";
  notes: string;
  updatedAt: number;
}

export interface SavedMarketView {
  id: string;
  name: string;
  coin: string | null;
  description: string;
  panelFocus: string[];
  createdAt: number;
}

export interface WatchlistIntelRow {
  coin: string;
  volatilityRank: number;
  liquidityRank: number;
  narrativeShift: string;
  fundingNote: string;
  alertCount: number;
  execReadiness: number;
  summary: string;
}

export type AssetWorkspaceMode = "standard" | "execution" | "research" | "surveillance";

export interface AssetWorkspaceProfile {
  coin: string;
  mode: AssetWorkspaceMode;
  panelSequence: string[];
  updatedAt: number;
}

export interface AlertWorkflowContext {
  alertId: string;
  coin: string;
  severity: "info" | "watch" | "critical";
  title: string;
  stepsCompleted: string[];
  startedAt: number;
}

export interface TraderSessionState {
  version: 1;
  selectedCoin: string | null;
  assetWorkspaceMode: AssetWorkspaceMode;
  activeThesisId: string | null;
  lastJournalEntryId: string | null;
  savedAt: number;
}

export interface WorkflowSnapshotExtension {
  journal: JournalEntry[];
  theses: ThesisBoard[];
  savedViews: SavedMarketView[];
  session: TraderSessionState;
}
