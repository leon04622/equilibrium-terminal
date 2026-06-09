import { create } from "zustand";
import type { OpsCommandModeId, OpsCommandSnapshot } from "@/types/ops-command";

export type OpsCommandTab =
  | "admin"
  | "observe"
  | "incidents"
  | "flags"
  | "orgs"
  | "runtime"
  | "support"
  | "audit"
  | "billing"
  | "intel"
  | "modes";

interface OpsCommandState {
  snapshot: OpsCommandSnapshot | null;
  activeTab: OpsCommandTab;
  setSnapshot: (snapshot: OpsCommandSnapshot) => void;
  setActiveTab: (tab: OpsCommandTab) => void;
  setActiveMode: (mode: OpsCommandModeId) => void;
}

export const useOpsCommandStore = create<OpsCommandState>((set) => ({
  snapshot: null,
  activeTab: "admin",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
