import { create } from "zustand";
import {
  BUILTIN_SCREENER_ALERT_RULES,
  type ScreenerAlertHit,
  type ScreenerAlertRule,
} from "@/types/institutional-capabilities";

const RULES_KEY = "eq-screener-alert-rules-v1";
const ARMED_KEY = "eq-screener-alerts-armed";

function loadRules(): ScreenerAlertRule[] {
  if (typeof window === "undefined") return BUILTIN_SCREENER_ALERT_RULES.map((r) => ({ ...r }));
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return BUILTIN_SCREENER_ALERT_RULES.map((r) => ({ ...r }));
    const parsed = JSON.parse(raw) as ScreenerAlertRule[];
    return parsed.length ? parsed : BUILTIN_SCREENER_ALERT_RULES.map((r) => ({ ...r }));
  } catch {
    return BUILTIN_SCREENER_ALERT_RULES.map((r) => ({ ...r }));
  }
}

function persistRules(rules: ScreenerAlertRule[]) {
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
    const raw = localStorage.getItem(ARMED_KEY);
    return raw !== "0";
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

interface MarketScreenerAlertState {
  armed: boolean;
  rules: ScreenerAlertRule[];
  recentHits: ScreenerAlertHit[];
  cooldowns: Map<string, number>;
  setArmed: (armed: boolean) => void;
  toggleRule: (id: string, enabled: boolean) => void;
  addRuleFromPreset: (presetId: string, label: string, minChangePct: number, minComposite: number) => void;
  removeRule: (id: string) => void;
  recordHits: (hits: ScreenerAlertHit[]) => void;
  hydrate: () => void;
}

export const useMarketScreenerAlertStore = create<MarketScreenerAlertState>((set, get) => ({
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
  addRuleFromPreset: (presetId, label, minChangePct, minComposite) => {
    const rule: ScreenerAlertRule = {
      id: `user_alert_${Date.now()}`,
      label: label.slice(0, 40),
      enabled: true,
      presetId,
      minChangePct,
      minComposite,
      requireTag: null,
      cooldownMs: 120_000,
    };
    const rules = [...get().rules, rule];
    persistRules(rules);
    set({ rules });
  },
  removeRule: (id) => {
    if (BUILTIN_SCREENER_ALERT_RULES.some((r) => r.id === id)) return;
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
