import { create } from "zustand";
import type {
  ResearchDeskModeId,
  ResearchDeskSnapshot,
} from "@/types/research-operating";

export type ResearchDeskTab =
  | "workspace"
  | "journal"
  | "annotate"
  | "thesis"
  | "links"
  | "collab"
  | "memory"
  | "search"
  | "ai"
  | "modes";

interface ResearchDeskState {
  snapshot: ResearchDeskSnapshot | null;
  activeTab: ResearchDeskTab;
  searchQuery: string;
  setSnapshot: (snapshot: ResearchDeskSnapshot) => void;
  setActiveTab: (tab: ResearchDeskTab) => void;
  setSearchQuery: (q: string) => void;
  setActiveMode: (mode: ResearchDeskModeId) => void;
}

export const useResearchDeskStore = create<ResearchDeskState>((set) => ({
  snapshot: null,
  activeTab: "workspace",
  searchQuery: "",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
