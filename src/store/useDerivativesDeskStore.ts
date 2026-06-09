import { create } from "zustand";
import type {
  DerivativesDashboardModeId,
  DerivativesIntelligenceSnapshot,
} from "@/types/derivatives-intelligence";

export type DerivativesDeskTab =
  | "vol"
  | "options"
  | "gamma"
  | "funding"
  | "state"
  | "cross"
  | "chain"
  | "alerts"
  | "modes";

interface DerivativesDeskState {
  snapshot: DerivativesIntelligenceSnapshot | null;
  activeTab: DerivativesDeskTab;
  setSnapshot: (snapshot: DerivativesIntelligenceSnapshot) => void;
  setActiveTab: (tab: DerivativesDeskTab) => void;
  setActiveMode: (mode: DerivativesDashboardModeId) => void;
}

export const useDerivativesDeskStore = create<DerivativesDeskState>((set) => ({
  snapshot: null,
  activeTab: "vol",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
