import { create } from "zustand";

const PROGRESS_KEY = "eq-market-state-progress-v1";

interface Progress {
  completed: boolean;
  lastStep: number;
}

const DEFAULT: Progress = { completed: false, lastStep: 0 };

function loadProgress(): Progress {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: Boolean(p.completed),
      lastStep: Number.isFinite(p.lastStep) ? Number(p.lastStep) : 0,
    };
  } catch {
    return { ...DEFAULT };
  }
}

function saveProgress(p: Progress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export interface MarketStateLessonState {
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

export const useMarketStateLessonStore = create<MarketStateLessonState>((set, get) => {
  const initial = loadProgress();
  return {
    active: false,
    runId: 0,
    startStep: 0,
    completed: initial.completed,
    lastStep: initial.lastStep,

    open: () => {
      const s = get();
      set({ active: true, runId: s.runId + 1, startStep: s.completed ? 0 : Math.max(0, s.lastStep) });
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
