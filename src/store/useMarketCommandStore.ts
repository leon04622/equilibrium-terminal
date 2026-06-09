import { create } from "zustand";
import type { MarketCommandModeId, MarketCommandSnapshot } from "@/types/market-command";

export type MarketCommandTab =
  | "overview"
  | "systemic"
  | "liquidity"
  | "volatility"
  | "incidents"
  | "cross"
  | "org"
  | "visual"
  | "ai"
  | "modes";

interface MarketCommandState {
  snapshot: MarketCommandSnapshot | null;
  activeTab: MarketCommandTab;
  setSnapshot: (snapshot: MarketCommandSnapshot) => void;
  setActiveTab: (tab: MarketCommandTab) => void;
  setActiveMode: (mode: MarketCommandModeId) => void;
}

export const useMarketCommandStore = create<MarketCommandState>((set) => ({
  snapshot: null,
  activeTab: "overview",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
