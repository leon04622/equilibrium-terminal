import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  DEFAULT_FAVORITE_IDS,
  INDICATOR_BY_ID,
  migrateIndicatorId,
} from "@/lib/charting/indicatorCatalog";
import {
  defaultIndicatorDisplay,
  indicatorDisplayEqual,
  resolveIndicatorDisplay,
  sanitizeIndicatorDisplay,
  type IndicatorDisplaySettings,
} from "@/lib/charting/indicatorDisplay";
import {
  hasIndicatorSettings,
  resolveIndicatorParams,
  sanitizeIndicatorSettings,
  type IndicatorParamValues,
} from "@/lib/charting/indicatorParams";
import {
  DEFAULT_DRAWING_PREFS,
  type ChartDrawTool,
  type ChartDrawingPrefs,
  type ChartHorizontalLine,
  type ChartIndicatorId,
  type ChartTicketPreview,
  type ChartTrendLine,
} from "@/types/chart-tools";

const STORAGE_KEY = "eq-chart-tools-v5";

interface Persisted {
  indicators: ChartIndicatorId[];
  favorites: ChartIndicatorId[];
  indicatorSettings: Record<string, IndicatorParamValues>;
  indicatorDisplay: Record<string, IndicatorDisplaySettings>;
  showPositionLines: boolean;
  linesByCoin: Record<string, ChartHorizontalLine[]>;
  trendLinesByCoin: Record<string, ChartTrendLine[]>;
  drawingPrefs: ChartDrawingPrefs;
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
    indicatorDisplay: {},
    showPositionLines: true,
    linesByCoin: {},
    trendLinesByCoin: {},
    drawingPrefs: { ...DEFAULT_DRAWING_PREFS },
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("eq-chart-tools-v4") ??
      localStorage.getItem("eq-chart-tools-v3") ??
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
      indicatorDisplay: sanitizeIndicatorDisplay(parsed.indicatorDisplay),
      showPositionLines: parsed.showPositionLines !== false,
      linesByCoin: parsed.linesByCoin ?? {},
      trendLinesByCoin: parsed.trendLinesByCoin ?? {},
      drawingPrefs: { ...DEFAULT_DRAWING_PREFS, ...parsed.drawingPrefs },
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
    indicatorDisplay: state.indicatorDisplay,
    showPositionLines: state.showPositionLines,
    linesByCoin: state.linesByCoin,
    trendLinesByCoin: state.trendLinesByCoin,
    drawingPrefs: state.drawingPrefs,
  };
}

export interface ChartToolsState {
  indicators: ChartIndicatorId[];
  favorites: ChartIndicatorId[];
  indicatorSettings: Record<string, IndicatorParamValues>;
  indicatorDisplay: Record<string, IndicatorDisplaySettings>;
  indicatorsModalOpen: boolean;
  settingsTargetId: string | null;
  drawTool: ChartDrawTool;
  drawingPrefs: ChartDrawingPrefs;
  showPositionLines: boolean;
  linesByCoin: Record<string, ChartHorizontalLine[]>;
  trendLinesByCoin: Record<string, ChartTrendLine[]>;
  ticketPreview: ChartTicketPreview | null;

  setIndicatorsModalOpen: (open: boolean) => void;
  setSettingsTarget: (id: string | null) => void;
  updateIndicatorSettings: (id: ChartIndicatorId, values: IndicatorParamValues) => void;
  updateIndicatorDisplay: (id: ChartIndicatorId, values: Partial<IndicatorDisplaySettings>) => void;
  toggleIndicator: (id: ChartIndicatorId) => void;
  removeIndicator: (id: ChartIndicatorId) => void;
  toggleFavorite: (id: ChartIndicatorId) => void;
  setDrawTool: (tool: ChartDrawTool) => void;
  toggleDrawingPref: (key: keyof ChartDrawingPrefs) => void;
  setShowPositionLines: (on: boolean) => void;
  addHorizontalLine: (coin: string, price: number, label?: string) => void;
  addTrendLine: (
    coin: string,
    time1: number,
    price1: number,
    time2: number,
    price2: number,
  ) => void;
  removeHorizontalLine: (coin: string, id: string) => void;
  clearHorizontalLines: (coin: string) => void;
  clearDrawings: (coin: string) => void;
  linesForCoin: (coin: string) => ChartHorizontalLine[];
  setTicketPreview: (preview: ChartTicketPreview | null) => void;
}

const persisted = loadPersist();

export const useChartToolsStore = create<ChartToolsState>()(
  subscribeWithSelector((set, get) => ({
    indicators: persisted.indicators,
    favorites: persisted.favorites,
    indicatorSettings: persisted.indicatorSettings,
    indicatorDisplay: persisted.indicatorDisplay,
    indicatorsModalOpen: false,
    settingsTargetId: null,
    drawTool: "none",
    drawingPrefs: persisted.drawingPrefs,
    showPositionLines: persisted.showPositionLines,
    linesByCoin: persisted.linesByCoin,
    trendLinesByCoin: persisted.trendLinesByCoin,
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

    updateIndicatorDisplay: (id, values) => {
      const prev = get().indicatorDisplay[id];
      const resolved = resolveIndicatorDisplay(id, { ...prev, ...values });
      const before = resolveIndicatorDisplay(id, prev);
      if (indicatorDisplayEqual(before, resolved)) return;

      const next = {
        ...get().indicatorDisplay,
        [id]: resolved,
      };
      set({ indicatorDisplay: next });
      savePersist({ ...snapshot(get()), indicatorDisplay: next });
    },

    toggleIndicator: (id) => {
      const def = INDICATOR_BY_ID[id];
      if (!def?.implemented) return;
      const cur = get().indicators;
      const adding = !cur.includes(id);
      const next = adding ? [...cur, id] : cur.filter((x) => x !== id);
      const nextDisplay = adding
        ? {
            ...get().indicatorDisplay,
            [id]: get().indicatorDisplay[id] ?? defaultIndicatorDisplay(id),
          }
        : get().indicatorDisplay;
      set({
        indicators: next,
        indicatorDisplay: nextDisplay,
        indicatorsModalOpen: adding && hasIndicatorSettings(id) ? false : get().indicatorsModalOpen,
        settingsTargetId: adding && hasIndicatorSettings(id) ? id : get().settingsTargetId,
      });
      savePersist({ ...snapshot(get()), indicators: next, indicatorDisplay: nextDisplay });
    },

    removeIndicator: (id) => {
      const next = get().indicators.filter((x) => x !== id);
      const { [id]: _s, ...restSettings } = get().indicatorSettings;
      const { [id]: _d, ...restDisplay } = get().indicatorDisplay;
      set({
        indicators: next,
        indicatorSettings: restSettings,
        indicatorDisplay: restDisplay,
        settingsTargetId: get().settingsTargetId === id ? null : get().settingsTargetId,
      });
      savePersist({
        ...snapshot(get()),
        indicators: next,
        indicatorSettings: restSettings,
        indicatorDisplay: restDisplay,
      });
    },

    toggleFavorite: (id) => {
      if (!INDICATOR_BY_ID[id]) return;
      const cur = get().favorites;
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      set({ favorites: next });
      savePersist({ ...snapshot(get()), favorites: next });
    },

    setDrawTool: (drawTool) => set({ drawTool }),

    toggleDrawingPref: (key) => {
      const drawingPrefs = {
        ...get().drawingPrefs,
        [key]: !get().drawingPrefs[key],
      };
      set({ drawingPrefs });
      savePersist({ ...snapshot(get()), drawingPrefs });
    },

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
        [coin]: [...(get().linesByCoin[coin] ?? []), line].slice(-24),
      };
      const nextDrawTool = get().drawingPrefs.stayInDrawingMode ? get().drawTool : "none";
      set({ linesByCoin, drawTool: nextDrawTool });
      savePersist({ ...snapshot(get()), linesByCoin });
    },

    addTrendLine: (coin, time1, price1, time2, price2) => {
      const line: ChartTrendLine = {
        id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        coin,
        time1,
        price1,
        time2,
        price2,
        color: "#787b86",
        createdAt: Date.now(),
      };
      const trendLinesByCoin = {
        ...get().trendLinesByCoin,
        [coin]: [...(get().trendLinesByCoin[coin] ?? []), line].slice(-24),
      };
      const nextDrawTool = get().drawingPrefs.stayInDrawingMode ? get().drawTool : "none";
      set({ trendLinesByCoin, drawTool: nextDrawTool });
      savePersist({ ...snapshot(get()), trendLinesByCoin });
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

    clearDrawings: (coin) => {
      const linesByCoin = { ...get().linesByCoin, [coin]: [] };
      const trendLinesByCoin = { ...get().trendLinesByCoin, [coin]: [] };
      set({ linesByCoin, trendLinesByCoin });
      savePersist({ ...snapshot(get()), linesByCoin, trendLinesByCoin });
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
