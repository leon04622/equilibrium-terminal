import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  DailyOperationsSnapshot,
  MarketMemoryEntry,
  PersonalOpsDashboard,
  PrioritizedAlertRow,
} from "@/types/daily-operations";

const PERSONAL_KEY = "eq-personal-ops-v1";

interface PersonalPersist {
  pinnedHeadlines: string[];
  favoriteCoins: string[];
  checklist: PersonalOpsDashboard["checklist"];
}

function loadPersonal(): PersonalPersist {
  if (typeof window === "undefined") {
    return { pinnedHeadlines: [], favoriteCoins: ["BTC", "ETH"], checklist: defaultChecklist() };
  }
  try {
    const raw = localStorage.getItem(PERSONAL_KEY);
    if (!raw) return { pinnedHeadlines: [], favoriteCoins: ["BTC", "ETH"], checklist: defaultChecklist() };
    return JSON.parse(raw) as PersonalPersist;
  } catch {
    return { pinnedHeadlines: [], favoriteCoins: ["BTC", "ETH"], checklist: defaultChecklist() };
  }
}

function defaultChecklist(): PersonalOpsDashboard["checklist"] {
  return [
    { id: "c1", label: "Review daily brief", done: false },
    { id: "c2", label: "Check macro calendar", done: false },
    { id: "c3", label: "Confirm watchlist", done: false },
  ];
}

function savePersonal(data: PersonalPersist): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PERSONAL_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export interface DailyOperationsState {
  snapshot: DailyOperationsSnapshot | null;
  memory: MarketMemoryEntry[];
  prioritizedAlerts: PrioritizedAlertRow[];
  lastBriefingAt: number | null;
  personalPins: string[];
  favoriteCoins: string[];
  checklist: PersonalOpsDashboard["checklist"];
  activeTab: "brief" | "state" | "session" | "ops" | "routines";

  setSnapshot: (snapshot: DailyOperationsSnapshot) => void;
  setMemory: (memory: MarketMemoryEntry[]) => void;
  setPrioritizedAlerts: (rows: PrioritizedAlertRow[]) => void;
  setActiveTab: (tab: DailyOperationsState["activeTab"]) => void;
  toggleChecklist: (id: string) => void;
  pinHeadline: (headline: string) => void;
  hydratePersonal: () => void;
  persistPersonal: () => void;
}

export const useDailyOperationsStore = create<DailyOperationsState>()(
  subscribeWithSelector((set, get) => ({
    snapshot: null,
    memory: [],
    prioritizedAlerts: [],
    lastBriefingAt: null,
    personalPins: [],
    favoriteCoins: ["BTC", "ETH"],
    checklist: defaultChecklist(),
    activeTab: "brief",

    setSnapshot: (snapshot) =>
      set({ snapshot, lastBriefingAt: snapshot.briefing.generatedAt }),
    setMemory: (memory) => set({ memory }),
    setPrioritizedAlerts: (prioritizedAlerts) => set({ prioritizedAlerts }),
    setActiveTab: (activeTab) => set({ activeTab }),
    toggleChecklist: (id) => {
      set((s) => ({
        checklist: s.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)),
      }));
      get().persistPersonal();
    },
    pinHeadline: (headline) => {
      set((s) => ({
        personalPins: [headline, ...s.personalPins.filter((h) => h !== headline)].slice(0, 8),
      }));
      get().persistPersonal();
    },
    hydratePersonal: () => {
      const p = loadPersonal();
      set({
        personalPins: p.pinnedHeadlines,
        favoriteCoins: p.favoriteCoins,
        checklist: p.checklist.length ? p.checklist : defaultChecklist(),
      });
    },
    persistPersonal: () => {
      savePersonal({
        pinnedHeadlines: get().personalPins,
        favoriteCoins: get().favoriteCoins,
        checklist: get().checklist,
      });
    },
  })),
);
