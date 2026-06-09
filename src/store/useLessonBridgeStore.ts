import { create } from "zustand";

/**
 * LESSON-TO-LIVE BRIDGE store.
 *
 * Drives the guided live walkthrough that runs AFTER a lesson, plus the
 * completion memory (Phase 8): which lesson/bridge/walkthrough a learner has
 * finished and which concepts they've now seen live. Persisted so progress and
 * the "revisit" options survive reloads.
 */

const MEMORY_KEY = "eq-lesson-bridge-memory-v1";

export interface BridgeMemory {
  lessonCompleted: boolean;
  bridgeCompleted: boolean;
  walkthroughCompleted: boolean;
  conceptsMastered: string[];
}

const DEFAULT_MEMORY: BridgeMemory = {
  lessonCompleted: false,
  bridgeCompleted: false,
  walkthroughCompleted: false,
  conceptsMastered: [],
};

function loadMemory(): BridgeMemory {
  if (typeof window === "undefined") return { ...DEFAULT_MEMORY };
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...DEFAULT_MEMORY };
    const parsed = JSON.parse(raw) as Partial<BridgeMemory>;
    return {
      lessonCompleted: Boolean(parsed.lessonCompleted),
      bridgeCompleted: Boolean(parsed.bridgeCompleted),
      walkthroughCompleted: Boolean(parsed.walkthroughCompleted),
      conceptsMastered: Array.isArray(parsed.conceptsMastered)
        ? parsed.conceptsMastered.slice(0, 50)
        : [],
    };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

function saveMemory(m: BridgeMemory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* storage unavailable — memory simply won't persist */
  }
}

export interface LessonBridgeState {
  active: boolean;
  runId: number;
  step: number;
  memory: BridgeMemory;
  /** Concepts recognized unassisted in the CURRENT run (Phase 9 validation). */
  recognized: string[];
  /** Operator decisions passed in the CURRENT run (Phase 3/6). */
  decisionsPassed: string[];

  start: () => void;
  close: () => void;
  setStep: (step: number) => void;
  markLessonCompleted: () => void;
  markBridgeCompleted: () => void;
  markConcept: (id: string) => void;
  markRecognized: (id: string) => void;
  markDecision: (stepId: string) => void;
}

export const useLessonBridgeStore = create<LessonBridgeState>((set, get) => ({
  active: false,
  runId: 0,
  step: 0,
  memory: loadMemory(),
  recognized: [],
  decisionsPassed: [],

  start: () =>
    set((s) => ({
      active: true,
      runId: s.runId + 1,
      step: 0,
      recognized: [],
      decisionsPassed: [],
    })),

  close: () => set({ active: false }),

  setStep: (step) => set({ step }),

  markLessonCompleted: () => {
    const memory = { ...get().memory, lessonCompleted: true };
    saveMemory(memory);
    set({ memory });
  },

  markBridgeCompleted: () => {
    const memory = { ...get().memory, bridgeCompleted: true, walkthroughCompleted: true };
    saveMemory(memory);
    set({ memory });
  },

  markConcept: (id) => {
    const current = get().memory;
    if (current.conceptsMastered.includes(id)) return;
    const memory = {
      ...current,
      conceptsMastered: [...current.conceptsMastered, id].slice(0, 50),
    };
    saveMemory(memory);
    set({ memory });
  },

  markRecognized: (id) => {
    const s = get();
    let recognized = s.recognized.includes(id) ? s.recognized : [...s.recognized, id];
    const checks = ["check-spread", "check-liquidity", "check-conditions"];
    if (checks.every((c) => recognized.includes(c)) && !recognized.includes("pretrade-ready")) {
      recognized = [...recognized, "pretrade-ready"];
    }
    const current = s.memory;
    const mastered = new Set(current.conceptsMastered);
    mastered.add(id);
    if (recognized.includes("pretrade-ready")) mastered.add("pretrade-ready");
    const memory = {
      ...current,
      conceptsMastered: Array.from(mastered).slice(0, 50),
    };
    if (JSON.stringify(memory.conceptsMastered) !== JSON.stringify(current.conceptsMastered)) {
      saveMemory(memory);
    }
    set({ recognized, memory });
  },

  markDecision: (stepId) => {
    const passed = get().decisionsPassed;
    if (passed.includes(stepId)) return;
    set({ decisionsPassed: [...passed, stepId] });
  },
}));
