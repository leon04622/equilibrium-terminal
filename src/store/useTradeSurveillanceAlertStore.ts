import { create } from "zustand";
import {
  BUILTIN_TRADE_SURVEILLANCE_RULES,
  type TradeSurveillanceHit,
  type TradeSurveillanceRule,
} from "@/types/institutional-capabilities";

const RULES_KEY = "eq-trade-surveillance-rules-v1";
const ARMED_KEY = "eq-trade-surveillance-armed";

function loadRules(): TradeSurveillanceRule[] {
  if (typeof window === "undefined") {
    return BUILTIN_TRADE_SURVEILLANCE_RULES.map((r) => ({ ...r }));
  }
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return BUILTIN_TRADE_SURVEILLANCE_RULES.map((r) => ({ ...r }));
    const parsed = JSON.parse(raw) as TradeSurveillanceRule[];
    return parsed.length ? parsed : BUILTIN_TRADE_SURVEILLANCE_RULES.map((r) => ({ ...r }));
  } catch {
    return BUILTIN_TRADE_SURVEILLANCE_RULES.map((r) => ({ ...r }));
  }
}

function persistRules(rules: TradeSurveillanceRule[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  } catch {
    /* storage blocked */
  }
}

function loadArmed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(ARMED_KEY) !== "0";
  } catch {
    return true;
  }
}

function persistArmed(armed: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ARMED_KEY, armed ? "1" : "0");
  } catch {
    /* ignore */
  }
}

interface TradeSurveillanceAlertState {
  armed: boolean;
  rules: TradeSurveillanceRule[];
  recentHits: TradeSurveillanceHit[];
  cooldowns: Map<string, number>;
  setArmed: (armed: boolean) => void;
  toggleRule: (id: string, enabled: boolean) => void;
  removeRule: (id: string) => void;
  recordHits: (hits: TradeSurveillanceHit[]) => void;
  hydrate: () => void;
}

export const useTradeSurveillanceAlertStore = create<TradeSurveillanceAlertState>((set, get) => ({
  armed: loadArmed(),
  rules: loadRules(),
  recentHits: [],
  cooldowns: new Map(),
  setArmed: (armed) => {
    persistArmed(armed);
    set({ armed });
  },
  toggleRule: (id, enabled) => {
    const rules = get().rules.map((r) => (r.id === id ? { ...r, enabled } : r));
    persistRules(rules);
    set({ rules });
  },
  removeRule: (id) => {
    if (BUILTIN_TRADE_SURVEILLANCE_RULES.some((r) => r.id === id)) return;
    const rules = get().rules.filter((r) => r.id !== id);
    persistRules(rules);
    set({ rules });
  },
  recordHits: (hits) => {
    if (!hits.length) return;
    set((s) => ({
      recentHits: [...hits, ...s.recentHits].slice(0, 24),
    }));
  },
  hydrate: () => set({ rules: loadRules(), armed: loadArmed() }),
}));
