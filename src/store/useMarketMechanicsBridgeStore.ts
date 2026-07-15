import { create } from "zustand";

const MEMORY_KEY = "eq-market-mechanics-bridge-memory-v1";

export interface MarketMechanicsBridgeMemory {
  simulatorCompleted: boolean;
  bridgeCompleted: boolean;
  conceptsMastered: string[];
}

const DEFAULT: MarketMechanicsBridgeMemory = {
  simulatorCompleted: false,
  bridgeCompleted: false,
  conceptsMastered: [],
};

function loadMemory(): MarketMechanicsBridgeMemory {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<MarketMechanicsBridgeMemory>;
    return {
      simulatorCompleted: Boolean(p.simulatorCompleted),
      bridgeCompleted: Boolean(p.bridgeCompleted),
      conceptsMastered: Array.isArray(p.conceptsMastered) ? p.conceptsMastered.slice(0, 50) : [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

function saveMemory(m: MarketMechanicsBridgeMemory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export interface MarketMechanicsBridgeState {
  active: boolean;
  runId: number;
  step: number;
  memory: MarketMechanicsBridgeMemory;
  recognized: string[];

  start: () => void;
  close: () => void;
  setStep: (step: number) => void;
  markSimulatorCompleted: () => void;
  markBridgeCompleted: () => void;
  markRecognized: (id: string) => void;
}

export const useMarketMechanicsBridgeStore = create<MarketMechanicsBridgeState>((set, get) => ({
  active: false,
  runId: 0,
  step: 0,
  memory: loadMemory(),
  recognized: [],

  start: () =>
    set((s) => ({
      active: true,
      runId: s.runId + 1,
      step: 0,
      recognized: [],
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
    const recognized = s.recognized.includes(id) ? s.recognized : [...s.recognized, id];
    const mastered = new Set(s.memory.conceptsMastered);
    mastered.add(id);
    const checks = ["find-hyperbook", "find-chart", "find-market-data"];
    if (checks.every((c) => recognized.includes(c)) && !recognized.includes("live-terminal-ready")) {
      recognized.push("live-terminal-ready");
      mastered.add("live-terminal-ready");
    }
    const memory = { ...s.memory, conceptsMastered: Array.from(mastered).slice(0, 50) };
    saveMemory(memory);
    set({ recognized, memory });
  },
}));
