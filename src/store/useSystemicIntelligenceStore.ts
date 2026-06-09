import { create } from "zustand";
import type {
  SystemicDashboardModeId,
  SystemicIntelligenceSnapshot,
} from "@/types/systemic-intelligence";

export type SystemicIntelTab =
  | "graph"
  | "risk"
  | "narrative"
  | "flows"
  | "cascade"
  | "context"
  | "memory"
  | "alerts"
  | "modes";

interface SystemicIntelligenceState {
  snapshot: SystemicIntelligenceSnapshot | null;
  activeTab: SystemicIntelTab;
  setSnapshot: (snapshot: SystemicIntelligenceSnapshot) => void;
  setActiveTab: (tab: SystemicIntelTab) => void;
  setActiveMode: (mode: SystemicDashboardModeId) => void;
}

export const useSystemicIntelligenceStore = create<SystemicIntelligenceState>((set) => ({
  snapshot: null,
  activeTab: "graph",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
