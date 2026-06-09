import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { GlobalInfrastructureSnapshot } from "@/types/global-infrastructure";

export type GlobalStrategyTab =
  | "tiers"
  | "scale"
  | "infra"
  | "ops"
  | "gtm"
  | "trust"
  | "adopt"
  | "position"
  | "moat"
  | "ready";

export interface GlobalStrategyState {
  snapshot: GlobalInfrastructureSnapshot | null;
  activeTab: GlobalStrategyTab;
  strategyVersion: number;

  setSnapshot: (snapshot: GlobalInfrastructureSnapshot) => void;
  setActiveTab: (tab: GlobalStrategyTab) => void;
}

export const useGlobalStrategyStore = create<GlobalStrategyState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "tiers",
    strategyVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        strategyVersion: s.strategyVersion + 1,
      })),
    setActiveTab: (tab) => set({ activeTab: tab }),
  })),
);
