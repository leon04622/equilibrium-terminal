import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DataIngestionSnapshot } from "@/types/data-ingestion";

export type IngestionTab = "sources" | "pipeline" | "events" | "processing" | "quality" | "storage";

export interface DataIngestionState {
  snapshot: DataIngestionSnapshot | null;
  activeTab: IngestionTab;
  pipelineActive: boolean;
  ingestVersion: number;

  setSnapshot: (snapshot: DataIngestionSnapshot) => void;
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
