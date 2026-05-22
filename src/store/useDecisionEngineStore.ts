import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DecisionSnapshot, DecisionTraderMode } from "@/types/decision-engine";

export interface DecisionEngineState {
  traderMode: DecisionTraderMode;
  snapshot: DecisionSnapshot | null;
  version: number;
  pipelineActive: boolean;

  setTraderMode: (mode: DecisionTraderMode) => void;
  setSnapshot: (snapshot: DecisionSnapshot) => void;
  setPipelineActive: (active: boolean) => void;
}

export const useDecisionEngineStore = create<DecisionEngineState>()(
  subscribeWithSelector((set) => ({
    traderMode: "balanced",
    snapshot: null,
    version: 0,
    pipelineActive: false,

    setTraderMode: (traderMode) => set({ traderMode }),
    setSnapshot: (snapshot) =>
      set((s) => ({ snapshot, version: s.version + 1 })),
    setPipelineActive: (pipelineActive) => set({ pipelineActive }),
  })),
);
