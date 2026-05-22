import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ProprietaryIntelligenceSnapshot } from "@/types/proprietary-intelligence";

export type ProprietaryIntelTab =
  | "metrics"
  | "structure"
  | "benchmarks"
  | "network"
  | "embedding"
  | "signature"
  | "memory"
  | "distribution";

export interface ProprietaryIntelligenceState {
  snapshot: ProprietaryIntelligenceSnapshot | null;
  activeTab: ProprietaryIntelTab;
  propVersion: number;

  setSnapshot: (snapshot: ProprietaryIntelligenceSnapshot) => void;
  setActiveTab: (tab: ProprietaryIntelTab) => void;
}

export const useProprietaryIntelligenceStore = create<ProprietaryIntelligenceState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "metrics",
    propVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        propVersion: s.propVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
