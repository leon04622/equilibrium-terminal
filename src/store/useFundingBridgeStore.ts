import { create } from "zustand";

const MEMORY_KEY = "eq-funding-bridge-memory-v1";

export interface FundingBridgeMemory {
  simulatorCompleted: boolean;
  bridgeCompleted: boolean;
  conceptsMastered: string[];
}

const DEFAULT: FundingBridgeMemory = {
  simulatorCompleted: false,
  bridgeCompleted: false,
  conceptsMastered: [],
};

function loadMemory(): FundingBridgeMemory {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<FundingBridgeMemory>;
    return {
      simulatorCompleted: Boolean(p.simulatorCompleted),
      bridgeCompleted: Boolean(p.bridgeCompleted),
      conceptsMastered: Array.isArray(p.conceptsMastered) ? p.conceptsMastered.slice(0, 50) : [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

function saveMemory(m: FundingBridgeMemory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export interface FundingBridgeState {
  active: boolean;
  runId: number;
  step: number;
  memory: FundingBridgeMemory;
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

export const useFundingBridgeStore = create<FundingBridgeState>((set, get) => ({
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
    const memory = { ...get().memory, bridgeCompleted: true };
    saveMemory(memory);
    set({ memory });
  },

  markRecognized: (id) => {
    const s = get();
    let recognized = s.recognized.includes(id) ? s.recognized : [...s.recognized, id];
    const checks = ["check-funding-rate", "check-crowding", "check-squeeze"];
    if (checks.every((c) => recognized.includes(c)) && !recognized.includes("funding-pretrade-ready")) {
      recognized = [...recognized, "funding-pretrade-ready"];
    }
    const mastered = new Set(s.memory.conceptsMastered);
    mastered.add(id);
    if (recognized.includes("funding-pretrade-ready")) mastered.add("funding-pretrade-ready");
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
