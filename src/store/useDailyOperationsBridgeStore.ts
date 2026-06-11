import { create } from "zustand";

const MEMORY_KEY = "eq-daily-operations-bridge-memory-v1";

export interface DailyOperationsBridgeMemory {
  simulatorCompleted: boolean;
  bridgeCompleted: boolean;
  certified: boolean;
  conceptsMastered: string[];
}

const DEFAULT: DailyOperationsBridgeMemory = {
  simulatorCompleted: false,
  bridgeCompleted: false,
  certified: false,
  conceptsMastered: [],
};

function loadMemory(): DailyOperationsBridgeMemory {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<DailyOperationsBridgeMemory>;
    return {
      simulatorCompleted: Boolean(p.simulatorCompleted),
      bridgeCompleted: Boolean(p.bridgeCompleted),
      certified: Boolean(p.certified),
      conceptsMastered: Array.isArray(p.conceptsMastered) ? p.conceptsMastered.slice(0, 50) : [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

function saveMemory(m: DailyOperationsBridgeMemory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export interface DailyOperationsBridgeState {
  active: boolean;
  runId: number;
  step: number;
  memory: DailyOperationsBridgeMemory;
  recognized: string[];
  decisionsPassed: string[];

  start: () => void;
  close: () => void;
  setStep: (step: number) => void;
  markSimulatorCompleted: () => void;
  markBridgeCompleted: () => void;
  markRecognized: (id: string) => void;
  markDecision: (stepId: string) => void;
}

export const useDailyOperationsBridgeStore = create<DailyOperationsBridgeState>((set, get) => ({
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

  markSimulatorCompleted: () => {
    const memory = { ...get().memory, simulatorCompleted: true };
    saveMemory(memory);
    set({ memory });
  },

  markBridgeCompleted: () => {
    const memory = {
      ...get().memory,
      bridgeCompleted: true,
      certified: true,
      conceptsMastered: Array.from(
        new Set([...get().memory.conceptsMastered, "daily-operations-certified"]),
      ).slice(0, 50),
    };
    saveMemory(memory);
    set({ memory });
  },

  markRecognized: (id) => {
    const s = get();
    let recognized = s.recognized.includes(id) ? s.recognized : [...s.recognized, id];
    const checks = ["identify-brief", "identify-volatility", "identify-liquidity", "identify-risk", "identify-checklist"];
    if (checks.every((c) => recognized.includes(c)) && !recognized.includes("daily-ops-pretrade-ready")) {
      recognized = [...recognized, "daily-ops-pretrade-ready"];
    }
    const mastered = new Set(s.memory.conceptsMastered);
    mastered.add(id);
    if (recognized.includes("daily-ops-pretrade-ready")) mastered.add("daily-ops-pretrade-ready");
    const memory = { ...s.memory, conceptsMastered: Array.from(mastered).slice(0, 50) };
    saveMemory(memory);
    set({ recognized, memory });
  },

  markDecision: (stepId) => {
    const passed = get().decisionsPassed;
    if (passed.includes(stepId)) return;
    set({ decisionsPassed: [...passed, stepId] });
  },
}));
