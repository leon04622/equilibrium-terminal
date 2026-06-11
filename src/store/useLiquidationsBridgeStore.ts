import { create } from "zustand";

const MEMORY_KEY = "eq-liquidations-bridge-memory-v1";

export interface LiquidationsBridgeMemory {
  simulatorCompleted: boolean;
  bridgeCompleted: boolean;
  certified: boolean;
  conceptsMastered: string[];
}

const DEFAULT: LiquidationsBridgeMemory = {
  simulatorCompleted: false,
  bridgeCompleted: false,
  certified: false,
  conceptsMastered: [],
};

function loadMemory(): LiquidationsBridgeMemory {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<LiquidationsBridgeMemory>;
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

function saveMemory(m: LiquidationsBridgeMemory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export interface LiquidationsBridgeState {
  active: boolean;
  runId: number;
  step: number;
  memory: LiquidationsBridgeMemory;
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

export const useLiquidationsBridgeStore = create<LiquidationsBridgeState>((set, get) => ({
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
        new Set([...get().memory.conceptsMastered, "liquidations-certified"]),
      ).slice(0, 50),
    };
    saveMemory(memory);
    set({ memory });
  },

  markRecognized: (id) => {
    const s = get();
    let recognized = s.recognized.includes(id) ? s.recognized : [...s.recognized, id];
    const checks = [
      "check-liq-pressure",
      "check-crowding-liq",
      "check-leverage-risk",
      "check-volatility-liq",
      "check-liq-distance",
    ];
    if (checks.every((c) => recognized.includes(c)) && !recognized.includes("liquidations-pre-risk-ready")) {
      recognized = [...recognized, "liquidations-pre-risk-ready"];
    }
    const mastered = new Set(s.memory.conceptsMastered);
    mastered.add(id);
    if (recognized.includes("liquidations-pre-risk-ready")) mastered.add("liquidations-pre-risk-ready");
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
