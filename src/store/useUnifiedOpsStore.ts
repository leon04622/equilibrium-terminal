import { create } from "zustand";
import type { UnifiedOpsModeId, UnifiedOpsSnapshot } from "@/types/unified-operations";

export type UnifiedOpsTab =
  | "orchestration"
  | "context"
  | "propagation"
  | "modes"
  | "continuity"
  | "immersion"
  | "design"
  | "crossdevice"
  | "ai"
  | "dashboard";

interface UnifiedOpsState {
  snapshot: UnifiedOpsSnapshot | null;
  activeTab: UnifiedOpsTab;
  setSnapshot: (snapshot: UnifiedOpsSnapshot) => void;
  setActiveTab: (tab: UnifiedOpsTab) => void;
  setActiveMode: (mode: UnifiedOpsModeId) => void;
}

export const useUnifiedOpsStore = create<UnifiedOpsState>((set) => ({
  snapshot: null,
  activeTab: "orchestration",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
