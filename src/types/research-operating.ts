/** Phase 48 — Institutional research, annotation & market journaling. */

import type { AnnotationKind } from "@/types/collaboration";
import type { JournalEntryKind } from "@/types/trader-workflow";

export type ResearchDeskModeId =
  | "analyst_workspace"
  | "journal_focus"
  | "thesis_lab"
  | "collab_review"
  | "memory_linked";

export type ResearchLinkKind =
  | "intelligence"
  | "historical_event"
  | "asset"
  | "derivatives"
  | "macro"
  | "liquidity"
  | "narrative"
  | "replay";

export interface ResearchNotebook {
  id: string;
  name: string;
  coin: string | null;
  description: string;
  panelFocus: string[];
  updatedAt: number;
}

export interface ResearchCollection {
  id: string;
  title: string;
  coins: string[];
  entryCount: number;
  updatedAt: number;
}

export interface MarketJournalRow {
  id: string;
  kind: JournalEntryKind | "volatility" | "liquidity" | "macro" | "execution_review";
  coin: string | null;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
}

export interface PersistedAnnotation {
  id: string;
  kind: AnnotationKind;
  coin: string;
  label: string;
  body: string;
  price: number | null;
  linkedEventId: string | null;
  timestamp: number;
  pinned: boolean;
}

export interface ThesisLifecycle {
  id: string;
  coin: string;
  thesis: string;
  invalidation: string;
  status: "active" | "closed" | "invalidated";
  hypothesisStatus: "forming" | "testing" | "confirmed" | "invalidated";
  narrativePhase: string;
  evidenceIds: string[];
  updatedAt: number;
}

export interface ResearchLink {
  id: string;
  sourceId: string;
  sourceKind: ResearchLinkKind;
  targetLabel: string;
  weight: number;
}

export interface DeskCommentaryRow {
  id: string;
  author: string;
  headline: string;
  body: string;
  coin: string | null;
  timestamp: number;
}

export interface MemoryIntegrationContext {
  analogCount: number;
  archiveHits: number;
  replayLinked: boolean;
  regimeLabel: string;
}

export interface ResearchSearchHit {
  id: string;
  category: "journal" | "thesis" | "annotation" | "commentary";
  title: string;
  snippet: string;
  score: number;
  timestamp: number;
}

export interface ResearchDeskDashboardMode {
  id: ResearchDeskModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface ResearchDeskTelemetrySnapshot {
  journalCount: number;
  thesisCount: number;
  annotationCount: number;
  computeLatencyMs: number;
  continuityScore: number;
}

export interface ResearchDeskSnapshot {
  asset: string;
  notebooks: ResearchNotebook[];
  collections: ResearchCollection[];
  journal: MarketJournalRow[];
  annotations: PersistedAnnotation[];
  theses: ThesisLifecycle[];
  links: ResearchLink[];
  commentary: DeskCommentaryRow[];
  memoryContext: MemoryIntegrationContext;
  searchHits: ResearchSearchHit[];
  aiBrief: string;
  dashboardModes: ResearchDeskDashboardMode[];
  activeMode: ResearchDeskModeId;
  telemetry: ResearchDeskTelemetrySnapshot;
  researchScore: number;
  updatedAt: number;
}
