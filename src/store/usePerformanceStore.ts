import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { RuntimeVitals } from "@/types/terminal-performance";

const DEFAULT_VITALS: RuntimeVitals = {
  fps: 60,
  frameTimeMs: 16.7,
  frameTimeP95Ms: 18,
  longFrames: 0,
  droppedFrames: 0,
  streamEps: 0,
  streamCoalesced: 0,
  streamDropped: 0,
  lastFlushMs: 0,
  wsLatencyMs: 0,
  heapMb: 0,
  stressActive: false,
  stressReason: "none",
  updatedAt: 0,
};

interface PerformanceStoreState {
  engineActive: boolean;
  showHud: boolean;
  vitals: RuntimeVitals;
  setEngineActive: (on: boolean) => void;
  setShowHud: (on: boolean) => void;
  toggleHud: () => void;
  setVitals: (vitals: RuntimeVitals) => void;
}

export const usePerformanceStore = create<PerformanceStoreState>()(
  subscribeWithSelector((set) => ({
    engineActive: false,
    showHud: false,
    vitals: DEFAULT_VITALS,

    setEngineActive: (engineActive) => set({ engineActive }),
    setShowHud: (showHud) => set({ showHud }),
    toggleHud: () => set((s) => ({ showHud: !s.showHud })),
    setVitals: (vitals) => set({ vitals }),
  })),
);
