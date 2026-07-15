import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  activePhase,
  emptyDayTasks,
  morningTaskFromWidget,
  todayKey,
  type MorningTaskId,
  type OperatorDayTasks,
  type OperatorPhase,
  type ReviewTaskId,
  type TradingTaskId,
} from "@/lib/operator-mode/OperatorModeEngine";
import {
  EMPTY_PRO,
  clampPhaseTab,
  resolveProCapabilities,
  type OperatorProCapabilities,
} from "@/lib/operator-mode/operatorModePro";
import { readAcademyProgress } from "@/lib/education/learningProgressSnapshot";

const STORAGE_KEY = "eq-operator-mode-v2";
const LEGACY_KEY = "eq-operator-mode-v1";

interface OperatorModePersist {
  active: boolean;
  liteWelcomeSeen: boolean;
  today: OperatorDayTasks;
}

function rollDay(today: OperatorDayTasks): OperatorDayTasks {
  if (today.dateKey === todayKey()) return today;
  return emptyDayTasks();
}

function load(): OperatorModePersist {
  const fresh: OperatorModePersist = {
    active: true,
    liteWelcomeSeen: false,
    today: emptyDayTasks(),
  };
  if (typeof window === "undefined") return fresh;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const old = JSON.parse(legacy) as {
          unlocked?: boolean;
          graduationPromptSeen?: boolean;
          today?: OperatorDayTasks;
        };
        const migrated: OperatorModePersist = {
          active: true,
          liteWelcomeSeen: Boolean(old.graduationPromptSeen || old.unlocked),
          today: rollDay({ ...emptyDayTasks(), ...(old.today ?? {}) }),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return fresh;
    }
    const p = JSON.parse(raw) as Partial<OperatorModePersist>;
    return {
      active: p.active !== false,
      liteWelcomeSeen: Boolean(p.liteWelcomeSeen),
      today: rollDay({ ...emptyDayTasks(), ...(p.today as OperatorDayTasks | undefined) }),
    };
  } catch {
    return fresh;
  }
}

function save(state: OperatorModePersist): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function syncPro(): OperatorProCapabilities {
  return resolveProCapabilities(readAcademyProgress());
}

export interface OperatorModeState {
  active: boolean;
  liteWelcomeSeen: boolean;
  showLiteWelcome: boolean;
  proCaps: OperatorProCapabilities;
  today: OperatorDayTasks;
  activePhaseTab: OperatorPhase;

  hydrate: () => void;
  syncProFromAcademy: () => void;
  activateLite: () => void;
  dismissLiteWelcome: () => void;
  setActivePhaseTab: (phase: OperatorPhase) => void;
  completeMorning: (id: MorningTaskId) => void;
  toggleMorning: (id: MorningTaskId) => void;
  toggleTrading: (id: TradingTaskId) => void;
  autoCompleteTrading: (id: TradingTaskId) => void;
  toggleReview: (id: ReviewTaskId) => void;
  setExecutionPlanNote: (note: string) => void;
  onWidgetFocused: (widgetId: string) => void;
  resetToday: () => void;
  startTodayWorkflow: () => void;
}

export const useOperatorModeStore = create<OperatorModeState>()(
  subscribeWithSelector((set, get) => {
    const initial = load();
    const initialPro = syncPro();

    const persist = (patch: Partial<OperatorModePersist>) => {
      const next: OperatorModePersist = {
        active: get().active,
        liteWelcomeSeen: get().liteWelcomeSeen,
        today: get().today,
        ...patch,
      };
      save(next);
    };

    return {
      active: initial.active,
      liteWelcomeSeen: initial.liteWelcomeSeen,
      showLiteWelcome: false,
      proCaps: initialPro,
      today: initial.today,
      activePhaseTab: clampPhaseTab(activePhase(initial.today, initialPro), initialPro),

      hydrate: () => {
        const data = load();
        const pro = syncPro();
        set({
          active: data.active,
          liteWelcomeSeen: data.liteWelcomeSeen,
          proCaps: pro,
          today: data.today,
          activePhaseTab: clampPhaseTab(activePhase(data.today, pro), pro),
        });
      },

      syncProFromAcademy: () => {
        const pro = syncPro();
        const today = get().today;
        set({ proCaps: pro, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
      },

      activateLite: () => {
        const s = get();
        if (!s.active) {
          set({ active: true });
          persist({ active: true });
        }
        if (!s.liteWelcomeSeen) {
          set({ showLiteWelcome: true });
        }
      },

      dismissLiteWelcome: () => {
        set({ showLiteWelcome: false, liteWelcomeSeen: true });
        persist({ liteWelcomeSeen: true });
      },

      setActivePhaseTab: (phase) => set({ activePhaseTab: phase }),

      completeMorning: (id) => {
        const pro = get().proCaps;
        const today = { ...get().today, morning: { ...get().today.morning, [id]: true }, updatedAt: Date.now() };
        set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
        persist({ today });
      },

      toggleMorning: (id) => {
        const pro = get().proCaps;
        const today = {
          ...get().today,
          morning: { ...get().today.morning, [id]: !get().today.morning[id] },
          updatedAt: Date.now(),
        };
        set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
        persist({ today });
      },

      toggleTrading: (id) => {
        const pro = get().proCaps;
        const today = {
          ...get().today,
          trading: { ...get().today.trading, [id]: !get().today.trading[id] },
          updatedAt: Date.now(),
        };
        set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
        persist({ today });
      },

      autoCompleteTrading: (id) => {
        if (!get().active || !(get().proCaps.orderBookChecks || get().proCaps.executionGuidance)) return;
        if (get().today.trading[id]) return;
        const pro = get().proCaps;
        const today = {
          ...get().today,
          trading: { ...get().today.trading, [id]: true },
          updatedAt: Date.now(),
        };
        set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
        persist({ today });
      },

      toggleReview: (id) => {
        const pro = get().proCaps;
        const today = {
          ...get().today,
          review: { ...get().today.review, [id]: !get().today.review[id] },
          updatedAt: Date.now(),
        };
        set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
        persist({ today });
      },

      setExecutionPlanNote: (note) => {
        const today = { ...get().today, executionPlanNote: note.slice(0, 500), updatedAt: Date.now() };
        set({ today });
        persist({ today });
      },

      onWidgetFocused: (widgetId) => {
        if (!get().active) return;
        const morningId = morningTaskFromWidget(widgetId);
        if (morningId && !get().today.morning[morningId]) {
          get().completeMorning(morningId);
        }
        if (
          (widgetId === "operatorjournal" || widgetId === "traderjournal") &&
          get().proCaps.journalReview
        ) {
          const review = { ...get().today.review };
          if (!review["journal-updated"]) review["journal-updated"] = true;
          const pro = get().proCaps;
          const today = { ...get().today, review, updatedAt: Date.now() };
          set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
          persist({ today });
        }
        if (widgetId === "memorydesk" && get().proCaps.contextWorkflow) {
          const review = { ...get().today.review };
          if (!review["lessons-recorded"]) review["lessons-recorded"] = true;
          const pro = get().proCaps;
          const today = { ...get().today, review, updatedAt: Date.now() };
          set({ today, activePhaseTab: clampPhaseTab(activePhase(today, pro), pro) });
          persist({ today });
        }
      },

      resetToday: () => {
        const pro = get().proCaps;
        const today = emptyDayTasks();
        set({ today, activePhaseTab: "morning" });
        persist({ today });
      },

      startTodayWorkflow: () => {
        get().dismissLiteWelcome();
        set({ activePhaseTab: "morning" });
      },
    };
  }),
);

export { EMPTY_PRO };
