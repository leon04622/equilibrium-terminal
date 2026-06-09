import { create } from "zustand";
import type {
  ExecutionAnalyticsSnapshot,
  ExecutionWorkspaceModeId,
} from "@/types/execution-analytics";

export type ExecutionAnalyticsTab =
  | "flow"
  | "liquidity"
  | "quality"
  | "micro"
  | "cross"
  | "alerts"
  | "modes";

interface ExecutionAnalyticsState {
  snapshot: ExecutionAnalyticsSnapshot | null;
  activeTab: ExecutionAnalyticsTab;
  setSnapshot: (snapshot: ExecutionAnalyticsSnapshot) => void;
  setActiveTab: (tab: ExecutionAnalyticsTab) => void;
  setActiveMode: (mode: ExecutionWorkspaceModeId) => void;
}

export const useExecutionAnalyticsStore = create<ExecutionAnalyticsState>((set) => ({
  snapshot: null,
  activeTab: "flow",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) =>
      s.snapshot
        ? { snapshot: { ...s.snapshot, activeMode } }
        : {},
    );
  },
}));
