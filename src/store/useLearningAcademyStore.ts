import { create } from "zustand";

/** LEARNING COMMAND CENTER — hub open/close + refresh tick for progress reads. */
export interface LearningAcademyState {
  active: boolean;
  progressVersion: number;
  open: () => void;
  close: () => void;
  bumpProgress: () => void;
}

export const useLearningAcademyStore = create<LearningAcademyState>((set) => ({
  active: false,
  progressVersion: 0,
  open: () => set((s) => ({ active: true, progressVersion: s.progressVersion + 1 })),
  close: () => set({ active: false }),
  bumpProgress: () => set((s) => ({ progressVersion: s.progressVersion + 1 })),
}));
