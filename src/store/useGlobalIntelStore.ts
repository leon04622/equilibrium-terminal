import { create } from "zustand";
import type { GlobalIntelModeId, GlobalIntelSnapshot } from "@/types/global-intelligence";

export type GlobalIntelTab =
  | "wire"
  | "events"
  | "macro"
  | "etf"
  | "regulation"
  | "cross"
  | "propagation"
  | "alerts"
  | "calendar"
  | "modes";

interface GlobalIntelState {
  snapshot: GlobalIntelSnapshot | null;
  activeTab: GlobalIntelTab;
  setSnapshot: (snapshot: GlobalIntelSnapshot) => void;
  setActiveTab: (tab: GlobalIntelTab) => void;
  setActiveMode: (mode: GlobalIntelModeId) => void;
}

export const useGlobalIntelStore = create<GlobalIntelState>((set) => ({
  snapshot: null,
  activeTab: "wire",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
