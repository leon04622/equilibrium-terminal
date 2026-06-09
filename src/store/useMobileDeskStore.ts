import { create } from "zustand";
import type { MobileDeskModeId, MobileDeskSnapshot } from "@/types/mobile-operational";

export type MobileDeskTab =
  | "arch"
  | "alerts"
  | "intel"
  | "portfolio"
  | "exec"
  | "watch"
  | "sync"
  | "incident"
  | "perf"
  | "modes";

interface MobileDeskState {
  snapshot: MobileDeskSnapshot | null;
  activeTab: MobileDeskTab;
  setSnapshot: (snapshot: MobileDeskSnapshot) => void;
  setActiveTab: (tab: MobileDeskTab) => void;
  setActiveMode: (mode: MobileDeskModeId) => void;
}

export const useMobileDeskStore = create<MobileDeskState>((set) => ({
  snapshot: null,
  activeTab: "alerts",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
