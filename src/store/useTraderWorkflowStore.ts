import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { SessionContinuity } from "@/lib/workflow/SessionContinuity";
import type {
  AlertWorkflowContext,
  AssetWorkspaceMode,
  JournalEntry,
  JournalEntryKind,
  SavedMarketView,
  ThesisBoard,
  WatchlistIntelRow,
} from "@/types/trader-workflow";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface TraderWorkflowState {
  journal: JournalEntry[];
  theses: ThesisBoard[];
  savedViews: SavedMarketView[];
  watchlistIntel: WatchlistIntelRow[];
  assetWorkspaceCoin: string | null;
  assetWorkspaceMode: AssetWorkspaceMode;
  alertWorkflow: AlertWorkflowContext | null;
  panelCycleIndex: number;
  hydrated: boolean;

  hydrate: (data: {
    journal: JournalEntry[];
    theses: ThesisBoard[];
    savedViews: SavedMarketView[];
  }) => void;
  addJournalEntry: (input: {
    kind: JournalEntryKind;
    coin: string | null;
    title: string;
    body: string;
    tags?: string[];
    linkedAlertId?: string | null;
  }) => JournalEntry;
  updateJournalEntry: (id: string, patch: Partial<Pick<JournalEntry, "title" | "body" | "tags">>) => void;
  upsertThesis: (input: Omit<ThesisBoard, "id" | "updatedAt"> & { id?: string }) => void;
  saveMarketView: (view: Omit<SavedMarketView, "id" | "createdAt">) => void;
  setWatchlistIntel: (rows: WatchlistIntelRow[]) => void;
  setAssetWorkspace: (coin: string, mode: AssetWorkspaceMode) => void;
  setAssetWorkspaceMode: (mode: AssetWorkspaceMode) => void;
  setAlertWorkflow: (ctx: AlertWorkflowContext | null) => void;
  cyclePanel: () => string;
  persist: () => void;
}

export const useTraderWorkflowStore = create<TraderWorkflowState>()(
  subscribeWithSelector((set, get) => ({
    journal: [],
    theses: [],
    savedViews: [
      {
        id: "view-default",
        name: "DEFAULT OPS",
        coin: null,
        description: "Chart · book · intel · ticket",
        panelFocus: ["chart", "hyperbook", "intelligence", "ticket"],
        createdAt: Date.now(),
      },
    ],
    watchlistIntel: [],
    assetWorkspaceCoin: null,
    assetWorkspaceMode: "standard",
    alertWorkflow: null,
    panelCycleIndex: 0,
    hydrated: false,

    hydrate: (data) =>
      set({
        journal: data.journal,
        theses: data.theses,
        savedViews: data.savedViews.length ? data.savedViews : get().savedViews,
        hydrated: true,
      }),

    addJournalEntry: (input) => {
      const entry: JournalEntry = {
        id: makeId("jnl"),
        kind: input.kind,
        coin: input.coin,
        title: input.title,
        body: input.body,
        tags: input.tags ?? [],
        linkedAlertId: input.linkedAlertId ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => ({ journal: [entry, ...s.journal].slice(0, 200) }));
      get().persist();
      return entry;
    },

    updateJournalEntry: (id, patch) => {
      set((s) => ({
        journal: s.journal.map((j) =>
          j.id === id ? { ...j, ...patch, updatedAt: Date.now() } : j,
        ),
      }));
      get().persist();
    },

    upsertThesis: (input) => {
      const id = input.id ?? makeId("thesis");
      const row: ThesisBoard = {
        id,
        coin: input.coin.toUpperCase(),
        thesis: input.thesis,
        invalidation: input.invalidation,
        status: input.status,
        notes: input.notes,
        updatedAt: Date.now(),
      };
      set((s) => {
        const rest = s.theses.filter((t) => t.id !== id);
        return { theses: [row, ...rest] };
      });
      get().persist();
    },

    saveMarketView: (view) => {
      const row: SavedMarketView = {
        ...view,
        id: makeId("view"),
        createdAt: Date.now(),
      };
      set((s) => ({ savedViews: [row, ...s.savedViews].slice(0, 24) }));
      get().persist();
    },

    setWatchlistIntel: (watchlistIntel) => set({ watchlistIntel }),
    setAssetWorkspace: (coin, mode) =>
      set({ assetWorkspaceCoin: coin.toUpperCase(), assetWorkspaceMode: mode }),
    setAssetWorkspaceMode: (mode) => set({ assetWorkspaceMode: mode }),
    setAlertWorkflow: (alertWorkflow) => set({ alertWorkflow }),
    cyclePanel: () => {
      const panels = [
        "chart",
        "hyperbook",
        "intelligence",
        "ticket",
        "surveillance",
        "knowledgegraph",
        "traderjournal",
        "research",
      ];
      const idx = (get().panelCycleIndex + 1) % panels.length;
      set({ panelCycleIndex: idx });
      return panels[idx];
    },
    persist: () => {
      const session = SessionContinuity.buildSessionState(get().assetWorkspaceCoin);
      session.assetWorkspaceMode = get().assetWorkspaceMode;
      SessionContinuity.save({
        journal: get().journal,
        theses: get().theses,
        savedViews: get().savedViews,
        session,
      });
    },
  })),
);
