import { create } from "zustand";
import type {
  PortfolioDashboardModeId,
  PortfolioDeskSnapshot,
} from "@/types/portfolio-risk-treasury";

export type PortfolioDeskTab =
  | "portfolio"
  | "risk"
  | "var"
  | "stress"
  | "treasury"
  | "analytics"
  | "collateral"
  | "margin"
  | "cross"
  | "limits"
  | "alerts"
  | "history"
  | "modes";

interface PortfolioDeskState {
  snapshot: PortfolioDeskSnapshot | null;
  activeTab: PortfolioDeskTab;
  setSnapshot: (snapshot: PortfolioDeskSnapshot) => void;
  setActiveTab: (tab: PortfolioDeskTab) => void;
  setActiveMode: (mode: PortfolioDashboardModeId) => void;
}

export const usePortfolioDeskStore = create<PortfolioDeskState>((set) => ({
  snapshot: null,
  activeTab: "portfolio",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) =>
      s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {},
    );
  },
}));
