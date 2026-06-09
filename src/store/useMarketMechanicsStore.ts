import { create } from "zustand";

/**
 * Controls the Market Mechanics Simulator — the first-principles module that
 * precedes the Order Book lesson. Kept separate so the immersive overlay has a
 * single, simple on/off and its own resume point.
 *
 * Progress (completed / last step) persists so a learner can leave mid-lesson
 * and resume. All localStorage access is wrapped so blocked storage never
 * throws.
 */

const PROGRESS_KEY = "eq-market-mechanics-progress-v1";

interface Progress {
  completed: boolean;
  lastStep: number;
}

const DEFAULT_PROGRESS: Progress = { completed: false, lastStep: 0 };

function loadProgress(): Progress {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: Boolean(parsed.completed),
      lastStep: Number.isFinite(parsed.lastStep) ? Number(parsed.lastStep) : 0,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress(p: Progress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — progress simply won't persist */
  }
}

export interface MarketMechanicsState {
  active: boolean;
  runId: number;
  startStep: number;
  completed: boolean;
  lastStep: number;
  open: () => void;
  restart: () => void;
  close: () => void;
  markStep: (step: number) => void;
  markCompleted: () => void;
}

export const useMarketMechanicsStore = create<MarketMechanicsState>((set, get) => {
  const initial = loadProgress();
  return {
    active: false,
    runId: 0,
    startStep: 0,
    completed: initial.completed,
    lastStep: initial.lastStep,

    open: () => {
      const s = get();
      const startStep = s.completed ? 0 : Math.max(0, s.lastStep);
      set({ active: true, runId: s.runId + 1, startStep });
    },

    restart: () => set({ active: true, runId: get().runId + 1, startStep: 0 }),

    close: () => set({ active: false }),

    markStep: (step) => {
      const s = get();
      if (step === s.lastStep) return;
      set({ lastStep: step });
      saveProgress({ completed: s.completed, lastStep: step });
    },

    markCompleted: () => {
      const s = get();
      if (s.completed) return;
      set({ completed: true });
      saveProgress({ completed: true, lastStep: s.lastStep });
    },
  };
});
