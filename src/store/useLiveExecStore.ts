import { create } from "zustand";
import type { LiveExecModeId, LiveExecSnapshot } from "@/types/live-execution";

export type LiveExecTab =
  | "desks"
  | "surfaces"
  | "context"
  | "multi"
  | "response"
  | "coord"
  | "perf"
  | "continuity"
  | "keys"
  | "modes";

interface LiveExecState {
  snapshot: LiveExecSnapshot | null;
  activeTab: LiveExecTab;
  setSnapshot: (snapshot: LiveExecSnapshot) => void;
  setActiveTab: (tab: LiveExecTab) => void;
  setActiveMode: (mode: LiveExecModeId) => void;
}

export const useLiveExecStore = create<LiveExecState>((set) => ({
  snapshot: null,
  activeTab: "desks",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
