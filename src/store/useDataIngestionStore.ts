import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { MarketDataPlatformSnapshot } from "@/types/market-data-backbone";

export type IngestionTab =
  | "sources"
  | "workers"
  | "streams"
  | "pipeline"
  | "events"
  | "processing"
  | "quality"
  | "storage";

export interface DataIngestionState {
  snapshot: MarketDataPlatformSnapshot | null;
  activeTab: IngestionTab;
  pipelineActive: boolean;
  ingestVersion: number;

  setSnapshot: (snapshot: MarketDataPlatformSnapshot) => void;
  setActiveTab: (tab: IngestionTab) => void;
}

export const useDataIngestionStore = create<DataIngestionState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "sources",
    pipelineActive: false,
    ingestVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        pipelineActive: true,
        ingestVersion: s.ingestVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
