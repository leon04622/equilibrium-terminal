import { create } from "zustand";
import type {
  PlatformDeskModeId,
  PlatformDeskSnapshot,
} from "@/types/platform-extensibility";

export type PlatformDeskTab =
  | "gateway"
  | "sdk"
  | "plugins"
  | "quant"
  | "webhooks"
  | "enterprise"
  | "auth"
  | "devx"
  | "embed"
  | "observe"
  | "modes";

interface PlatformDeskState {
  snapshot: PlatformDeskSnapshot | null;
  activeTab: PlatformDeskTab;
  setSnapshot: (snapshot: PlatformDeskSnapshot) => void;
  setActiveTab: (tab: PlatformDeskTab) => void;
  setActiveMode: (mode: PlatformDeskModeId) => void;
}

export const usePlatformDeskStore = create<PlatformDeskState>((set) => ({
  snapshot: null,
  activeTab: "gateway",
  setSnapshot: (snapshot) => set({ snapshot }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveMode: (activeMode) => {
    set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, activeMode } } : {}));
  },
}));
