import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  DEFAULT_FAVORITE_IDS,
  INDICATOR_BY_ID,
  migrateIndicatorId,
} from "@/lib/charting/indicatorCatalog";
import {
  hasIndicatorSettings,
  resolveIndicatorParams,
  sanitizeIndicatorSettings,
  type IndicatorParamValues,
} from "@/lib/charting/indicatorParams";
import type {
  ChartDrawTool,
  ChartHorizontalLine,
  ChartIndicatorId,
  ChartTicketPreview,
} from "@/types/chart-tools";

const STORAGE_KEY = "eq-chart-tools-v3";

interface Persisted {
  indicators: ChartIndicatorId[];
  favorites: ChartIndicatorId[];
  indicatorSettings: Record<string, IndicatorParamValues>;
  showPositionLines: boolean;
  linesByCoin: Record<string, ChartHorizontalLine[]>;
}

function defaultFavorites(): ChartIndicatorId[] {
  return [...DEFAULT_FAVORITE_IDS];
}

function sanitizeIndicators(ids: unknown): ChartIndicatorId[] {
  if (!Array.isArray(ids)) return ["ema"];
  const migrated = ids.map((id) => migrateIndicatorId(String(id)));
  return migrated.filter((id) => INDICATOR_BY_ID[id]?.implemented);
}

function loadPersist(): Persisted {
  const fallback: Persisted = {
    indicators: ["ema"],
    favorites: defaultFavorites(),
    indicatorSettings: {},
    showPositionLines: true,
    linesByCoin: {},
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("eq-chart-tools-v2") ??
      localStorage.getItem("eq-chart-tools-v1");
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const indicators = sanitizeIndicators(parsed.indicators);
    const favorites = Array.isArray(parsed.favorites)
      ? parsed.favorites.filter((id) => INDICATOR_BY_ID[id])
      : defaultFavorites();
    return {
      indicators: indicators.length ? indicators : ["ema"],
      favorites: favorites.length ? favorites : defaultFavorites(),
      indicatorSettings: sanitizeIndicatorSettings(parsed.indicatorSettings),
      showPositionLines: parsed.showPositionLines !== false,
      linesByCoin: parsed.linesByCoin ?? {},
    };
  } catch {
    return fallback;
  }
}

function savePersist(state: Persisted): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function snapshot(state: ChartToolsState): Persisted {
  return {
    indicators: state.indicators,
    favorites: state.favorites,
    indicatorSettings: state.indicatorSettings,
    showPositionLines: state.showPositionLines,
    linesByCoin: state.linesByCoin,
  };
}

export interface ChartToolsState {
  indicators: ChartIndicatorId[];
  favorites: ChartIndicatorId[];
  indicatorSettings: Record<string, IndicatorParamValues>;
  indicatorsModalOpen: boolean;
  settingsTargetId: string | null;
  drawTool: ChartDrawTool;
  showPositionLines: boolean;
  linesByCoin: Record<string, ChartHorizontalLine[]>;
  ticketPreview: ChartTicketPreview | null;

  setIndicatorsModalOpen: (open: boolean) => void;
  setSettingsTarget: (id: string | null) => void;
  updateIndicatorSettings: (id: ChartIndicatorId, values: IndicatorParamValues) => void;
  toggleIndicator: (id: ChartIndicatorId) => void;
  removeIndicator: (id: ChartIndicatorId) => void;
  toggleFavorite: (id: ChartIndicatorId) => void;
  setDrawTool: (tool: ChartDrawTool) => void;
  setShowPositionLines: (on: boolean) => void;
  addHorizontalLine: (coin: string, price: number, label?: string) => void;
  removeHorizontalLine: (coin: string, id: string) => void;
  clearHorizontalLines: (coin: string) => void;
  linesForCoin: (coin: string) => ChartHorizontalLine[];
  setTicketPreview: (preview: ChartTicketPreview | null) => void;
}

const persisted = loadPersist();

export const useChartToolsStore = create<ChartToolsState>()(
  subscribeWithSelector((set, get) => ({
    indicators: persisted.indicators,
    favorites: persisted.favorites,
    indicatorSettings: persisted.indicatorSettings,
    indicatorsModalOpen: false,
    settingsTargetId: null,
    drawTool: "none",
    showPositionLines: persisted.showPositionLines,
    linesByCoin: persisted.linesByCoin,
    ticketPreview: null,

    setIndicatorsModalOpen: (indicatorsModalOpen) =>
      set({ indicatorsModalOpen, settingsTargetId: indicatorsModalOpen ? null : get().settingsTargetId }),

    setSettingsTarget: (settingsTargetId) =>
      set({ settingsTargetId, indicatorsModalOpen: settingsTargetId ? false : get().indicatorsModalOpen }),

    updateIndicatorSettings: (id, values) => {
      const next = {
        ...get().indicatorSettings,
        [id]: resolveIndicatorParams(id, { ...get().indicatorSettings[id], ...values }),
      };
      set({ indicatorSettings: next });
      savePersist({ ...snapshot(get()), indicatorSettings: next });
    },

    toggleIndicator: (id) => {
      const def = INDICATOR_BY_ID[id];
      if (!def?.implemented) return;
      const cur = get().indicators;
      const adding = !cur.includes(id);
      const next = adding ? [...cur, id] : cur.filter((x) => x !== id);
      set({
        indicators: next,
        indicatorsModalOpen: adding && hasIndicatorSettings(id) ? false : get().indicatorsModalOpen,
        settingsTargetId: adding && hasIndicatorSettings(id) ? id : get().settingsTargetId,
      });
      savePersist({ ...snapshot(get()), indicators: next });
    },

    removeIndicator: (id) => {
      const next = get().indicators.filter((x) => x !== id);
      const { [id]: _, ...restSettings } = get().indicatorSettings;
      set({
        indicators: next,
        indicatorSettings: restSettings,
        settingsTargetId: get().settingsTargetId === id ? null : get().settingsTargetId,
      });
      savePersist({ ...snapshot(get()), indicators: next, indicatorSettings: restSettings });
    },

    toggleFavorite: (id) => {
      if (!INDICATOR_BY_ID[id]) return;
      const cur = get().favorites;
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      set({ favorites: next });
      savePersist({ ...snapshot(get()), favorites: next });
    },

    setDrawTool: (drawTool) => set({ drawTool }),

    setShowPositionLines: (showPositionLines) => {
      set({ showPositionLines });
      savePersist({ ...snapshot(get()), showPositionLines });
    },

    linesForCoin: (coin) => get().linesByCoin[coin] ?? [],

    addHorizontalLine: (coin, price, label = "LINE") => {
      const line: ChartHorizontalLine = {
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        coin,
        price,
        color: "#787b86",
        label,
        createdAt: Date.now(),
      };
      const linesByCoin = {
        ...get().linesByCoin,
        [coin]: [...(get().linesByCoin[coin] ?? []), line].slice(-12),
      };
      set({ linesByCoin, drawTool: "none" });
      savePersist({ ...snapshot(get()), linesByCoin });
    },

    removeHorizontalLine: (coin, id) => {
      const linesByCoin = {
        ...get().linesByCoin,
        [coin]: (get().linesByCoin[coin] ?? []).filter((l) => l.id !== id),
      };
      set({ linesByCoin });
      savePersist({ ...snapshot(get()), linesByCoin });
    },

    clearHorizontalLines: (coin) => {
      const linesByCoin = { ...get().linesByCoin, [coin]: [] };
      set({ linesByCoin });
      savePersist({ ...snapshot(get()), linesByCoin });
    },

    setTicketPreview: (ticketPreview) => {
      const cur = get().ticketPreview;
      if (cur === ticketPreview) return;
      if (
        cur &&
        ticketPreview &&
        cur.limit === ticketPreview.limit &&
        cur.stop === ticketPreview.stop
      ) {
        return;
      }
      if (!cur && !ticketPreview) return;
      set({ ticketPreview });
    },
  })),
);
