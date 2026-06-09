import { create } from "zustand";
import type { OperatorAiModeId, OperatorAiSnapshot } from "@/types/operator-ai";

export type OperatorAiTab =
  | "context"
  | "summarize"
  | "workflow"
  | "research"
  | "systems"
  | "briefing"
  | "query"
  | "safety"
  | "infer"
  | "modes";

interface OperatorAiState {
  snapshot: OperatorAiSnapshot | null;
  activeTab: OperatorAiTab;
  lastQuery: string | null;
  setSnapshot: (snapshot: OperatorAiSnapshot) => void;
  setActiveTab: (tab: OperatorAiTab) => void;
  setActiveMode: (mode: OperatorAiModeId) => void;
  setLastQuery: (query: string | null) => void;
}

export const useOperatorAiStore = create<OperatorAiState>((set) => ({
  snapshot: null,
  activeTab: "context",
  lastQuery: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
  setLastQuery: (lastQuery) => set({ lastQuery }),
}));
