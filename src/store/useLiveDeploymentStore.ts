import { create } from "zustand";
import type { LiveDeploymentModeId, LiveDeploymentSnapshot } from "@/types/live-deployment";

export type LiveDeploymentTab =
  | "alpha"
  | "infra"
  | "telemetry"
  | "retention"
  | "feedback"
  | "hardening"
  | "support"
  | "enterprise"
  | "success"
  | "modes";

interface LiveDeploymentState {
  snapshot: LiveDeploymentSnapshot | null;
  activeTab: LiveDeploymentTab;
  setSnapshot: (snapshot: LiveDeploymentSnapshot) => void;
  setActiveTab: (tab: LiveDeploymentTab) => void;
  setActiveMode: (mode: LiveDeploymentModeId) => void;
}

export const useLiveDeploymentStore = create<LiveDeploymentState>((set) => ({
  snapshot: null,
  activeTab: "alpha",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
