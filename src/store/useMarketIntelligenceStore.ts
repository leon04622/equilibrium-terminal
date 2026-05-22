import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { MarketIntelligenceSnapshot } from "@/types/market-intelligence";

export type IntelligenceTab = "events" | "state" | "assets" | "narrative" | "brief";

export interface MarketIntelligenceState {
  snapshot: MarketIntelligenceSnapshot | null;
  activeTab: IntelligenceTab;
  intelVersion: number;

  setSnapshot: (snapshot: MarketIntelligenceSnapshot) => void;
  setActiveTab: (tab: IntelligenceTab) => void;
}

export const useMarketIntelligenceStore = create<MarketIntelligenceState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "events",
    intelVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        intelVersion: s.intelVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
