import { create } from "zustand";

/**
 * Controls the cinematic Order Book learning stage. Kept separate from the
 * generic operator-guide store so the immersive overlay has a single, simple
 * on/off without entangling the panel-level explain state.
 *
 * Learning progress (completed / last step / replay watched) is persisted so a
 * learner can leave mid-lesson and resume later. All localStorage access is
 * wrapped so a blocked/unavailable storage never throws.
 */

const PROGRESS_KEY = "eq-ob-lesson-progress-v2";

interface LessonProgress {
  completed: boolean;
  lastStep: number;
  replayWatched: boolean;
}

const DEFAULT_PROGRESS: LessonProgress = {
  completed: false,
  lastStep: 0,
  replayWatched: false,
};

function loadProgress(): LessonProgress {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<LessonProgress>;
    return {
      completed: Boolean(parsed.completed),
      lastStep: Number.isFinite(parsed.lastStep) ? Number(parsed.lastStep) : 0,
      replayWatched: Boolean(parsed.replayWatched),
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress(p: LessonProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — progress simply won't persist */
  }
}

export interface OrderBookLessonState {
  active: boolean;
  /** Bumped each time the lesson is (re)opened so the player resets. */
  runId: number;
  /** The step the player should start on when opened (resume point). */
  startStep: number;
  completed: boolean;
  lastStep: number;
  replayWatched: boolean;
  /** Open and resume from the saved step (unless completed → fresh start). */
  open: () => void;
  /** Open from the very beginning regardless of saved progress. */
  restart: () => void;
  close: () => void;
  markStep: (step: number) => void;
  markCompleted: () => void;
  markReplayWatched: () => void;
}

export const useOrderBookLessonStore = create<OrderBookLessonState>((set, get) => {
  const initial = loadProgress();
  return {
    active: false,
    runId: 0,
    startStep: 0,
    completed: initial.completed,
    lastStep: initial.lastStep,
    replayWatched: initial.replayWatched,

    open: () => {
      const s = get();
      // Resume mid-lesson; if already completed, begin a fresh run.
      const startStep = s.completed ? 0 : Math.max(0, s.lastStep);
      set({ active: true, runId: s.runId + 1, startStep });
    },

    restart: () => set({ active: true, runId: get().runId + 1, startStep: 0 }),

    close: () => set({ active: false }),

    markStep: (step) => {
      const s = get();
      if (step === s.lastStep) return;
      set({ lastStep: step });
      saveProgress({ completed: s.completed, lastStep: step, replayWatched: s.replayWatched });
    },

    markCompleted: () => {
      const s = get();
      if (s.completed) return;
      set({ completed: true });
      saveProgress({ completed: true, lastStep: s.lastStep, replayWatched: s.replayWatched });
    },

    markReplayWatched: () => {
      const s = get();
      if (s.replayWatched) return;
      set({ replayWatched: true });
      saveProgress({ completed: s.completed, lastStep: s.lastStep, replayWatched: true });
    },
  };
});
