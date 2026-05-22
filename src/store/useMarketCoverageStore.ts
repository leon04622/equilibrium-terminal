import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { MarketCoverageSnapshot } from "@/types/market-coverage";

export type CoverageTab = "coverage" | "proprietary" | "onchain" | "health" | "events";

export interface MarketCoverageState {
  snapshot: MarketCoverageSnapshot | null;
  activeTab: CoverageTab;
  pipelineActive: boolean;

  setSnapshot: (snapshot: MarketCoverageSnapshot) => void;
  setActiveTab: (tab: CoverageTab) => void;
  setPipelineActive: (active: boolean) => void;
}

export const useMarketCoverageStore = create<MarketCoverageState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "coverage",
    pipelineActive: false,

    setSnapshot: (snapshot) => set({ snapshot, pipelineActive: true }),
    setActiveTab: (activeTab) => set({ activeTab }),
    setPipelineActive: (pipelineActive) => set({ pipelineActive }),
  })),
);
