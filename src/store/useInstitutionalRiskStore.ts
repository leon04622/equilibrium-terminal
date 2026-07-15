import { create } from "zustand";

import {

  DEFAULT_PRE_TRADE_LIMITS,

  DEFAULT_VAR_LIMITS,

  type PreTradeRiskLimits,

  type VaRLimits,

} from "@/types/institutional-capabilities";



const PRE_TRADE_KEY = "eq-pre-trade-limits-v1";

const VAR_LIMITS_KEY = "eq-var-limits-v1";

const RISK_ALERTS_ARMED_KEY = "eq-risk-alerts-armed";



function loadLimits(): PreTradeRiskLimits {

  if (typeof window === "undefined") return DEFAULT_PRE_TRADE_LIMITS;

  try {

    const raw = localStorage.getItem(PRE_TRADE_KEY);

    if (!raw) return DEFAULT_PRE_TRADE_LIMITS;

    return { ...DEFAULT_PRE_TRADE_LIMITS, ...JSON.parse(raw) };

  } catch {

    return DEFAULT_PRE_TRADE_LIMITS;

  }

}



function saveLimits(limits: PreTradeRiskLimits): void {

  if (typeof window === "undefined") return;

  try {

    localStorage.setItem(PRE_TRADE_KEY, JSON.stringify(limits));

  } catch {

    /* ignore */

  }

}



function loadVarLimits(): VaRLimits {

  if (typeof window === "undefined") return DEFAULT_VAR_LIMITS;

  try {

    const raw = localStorage.getItem(VAR_LIMITS_KEY);

    if (!raw) return DEFAULT_VAR_LIMITS;

    return { ...DEFAULT_VAR_LIMITS, ...JSON.parse(raw) };

  } catch {

    return DEFAULT_VAR_LIMITS;

  }

}



function saveVarLimits(limits: VaRLimits): void {

  if (typeof window === "undefined") return;

  try {

    localStorage.setItem(VAR_LIMITS_KEY, JSON.stringify(limits));

  } catch {

    /* ignore */

  }

}



function loadRiskAlertsArmed(): boolean {

  if (typeof window === "undefined") return true;

  try {

    return localStorage.getItem(RISK_ALERTS_ARMED_KEY) !== "0";

  } catch {

    return true;

  }

}



function persistRiskAlertsArmed(armed: boolean): void {

  if (typeof window === "undefined") return;

  try {

    localStorage.setItem(RISK_ALERTS_ARMED_KEY, armed ? "1" : "0");

  } catch {

    /* ignore */

  }

}



interface InstitutionalRiskState {

  limits: PreTradeRiskLimits;

  varLimits: VaRLimits;

  riskAlertsArmed: boolean;

  setLimits: (patch: Partial<PreTradeRiskLimits>) => void;

  setVarLimits: (patch: Partial<VaRLimits>) => void;

  setRiskAlertsArmed: (armed: boolean) => void;

  resetLimits: () => void;

  resetVarLimits: () => void;

  hydrate: () => void;

}



export const useInstitutionalRiskStore = create<InstitutionalRiskState>((set, get) => ({

  limits: loadLimits(),

  varLimits: loadVarLimits(),

  riskAlertsArmed: loadRiskAlertsArmed(),

  setLimits: (patch) => {

    const limits = { ...get().limits, ...patch };

    saveLimits(limits);

    set({ limits });

  },

  setVarLimits: (patch) => {

    const varLimits = { ...get().varLimits, ...patch };

    saveVarLimits(varLimits);

    set({ varLimits });

  },

  setRiskAlertsArmed: (armed) => {

    persistRiskAlertsArmed(armed);

    set({ riskAlertsArmed: armed });

  },

  resetLimits: () => {

    saveLimits(DEFAULT_PRE_TRADE_LIMITS);

    set({ limits: DEFAULT_PRE_TRADE_LIMITS });

  },

  resetVarLimits: () => {

    saveVarLimits(DEFAULT_VAR_LIMITS);

    set({ varLimits: DEFAULT_VAR_LIMITS });

  },

  hydrate: () =>

    set({

      limits: loadLimits(),

      varLimits: loadVarLimits(),

      riskAlertsArmed: loadRiskAlertsArmed(),

    }),

}));


