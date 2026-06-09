import { create } from "zustand";
import type {
  MarketMemoryDashboardModeId,
  MarketMemorySnapshot,
} from "@/types/market-memory";

export type MarketMemoryTab =
  | "replay"
  | "archive"
  | "regime"
  | "search"
  | "analogs"
  | "liquidity"
  | "narrative"
  | "portfolio"
  | "research"
  | "modes";

interface MarketMemoryState {
  snapshot: MarketMemorySnapshot | null;
  activeTab: MarketMemoryTab;
  searchQuery: string;
  setSnapshot: (snapshot: MarketMemorySnapshot) => void;
  setActiveTab: (tab: MarketMemoryTab) => void;
  setSearchQuery: (q: string) => void;
  setActiveMode: (mode: MarketMemoryDashboardModeId) => void;
}

export const useMarketMemoryStore = create<MarketMemoryState>((set) => ({
  snapshot: null,
  activeTab: "replay",
  searchQuery: "",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
