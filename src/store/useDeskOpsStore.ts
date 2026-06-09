import { create } from "zustand";
import type { DeskOpsModeId, DeskOpsSnapshot } from "@/types/desk-operations";

export type DeskOpsTab =
  | "workspaces"
  | "roles"
  | "intel"
  | "research"
  | "alerts"
  | "coordination"
  | "governance"
  | "tenants"
  | "memory"
  | "modes";

interface DeskOpsState {
  snapshot: DeskOpsSnapshot | null;
  activeTab: DeskOpsTab;
  setSnapshot: (snapshot: DeskOpsSnapshot) => void;
  setActiveTab: (tab: DeskOpsTab) => void;
  setActiveMode: (mode: DeskOpsModeId) => void;
}

export const useDeskOpsStore = create<DeskOpsState>((set) => ({
  snapshot: null,
  activeTab: "workspaces",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
