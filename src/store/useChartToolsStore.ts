import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  ChartDrawTool,
  ChartHorizontalLine,
  ChartIndicatorId,
  ChartTicketPreview,
} from "@/types/chart-tools";

const STORAGE_KEY = "eq-chart-tools-v1";

interface Persisted {
  indicators: ChartIndicatorId[];
  showPositionLines: boolean;
  linesByCoin: Record<string, ChartHorizontalLine[]>;
}

function loadPersist(): Persisted {
  if (typeof window === "undefined") {
    return { indicators: ["ema21"], showPositionLines: true, linesByCoin: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { indicators: ["ema21"], showPositionLines: true, linesByCoin: {} };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : ["ema21"],
      showPositionLines: parsed.showPositionLines !== false,
      linesByCoin: parsed.linesByCoin ?? {},
    };
  } catch {
    return { indicators: ["ema21"], showPositionLines: true, linesByCoin: {} };
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

export interface ChartToolsState {
  indicators: ChartIndicatorId[];
  drawTool: ChartDrawTool;
  showPositionLines: boolean;
  linesByCoin: Record<string, ChartHorizontalLine[]>;
  ticketPreview: ChartTicketPreview | null;

  toggleIndicator: (id: ChartIndicatorId) => void;
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
    drawTool: "none",
    showPositionLines: persisted.showPositionLines,
    linesByCoin: persisted.linesByCoin,
    ticketPreview: null,

    toggleIndicator: (id) => {
      const cur = get().indicators;
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      set({ indicators: next });
      savePersist({
        indicators: next,
        showPositionLines: get().showPositionLines,
        linesByCoin: get().linesByCoin,
      });
    },

    setDrawTool: (drawTool) => set({ drawTool }),

    setShowPositionLines: (showPositionLines) => {
      set({ showPositionLines });
      savePersist({
        indicators: get().indicators,
        showPositionLines,
        linesByCoin: get().linesByCoin,
      });
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
      savePersist({
        indicators: get().indicators,
        showPositionLines: get().showPositionLines,
        linesByCoin,
      });
    },

    removeHorizontalLine: (coin, id) => {
      const linesByCoin = {
        ...get().linesByCoin,
        [coin]: (get().linesByCoin[coin] ?? []).filter((l) => l.id !== id),
      };
      set({ linesByCoin });
      savePersist({
        indicators: get().indicators,
        showPositionLines: get().showPositionLines,
        linesByCoin,
      });
    },

    clearHorizontalLines: (coin) => {
      const linesByCoin = { ...get().linesByCoin, [coin]: [] };
      set({ linesByCoin });
      savePersist({
        indicators: get().indicators,
        showPositionLines: get().showPositionLines,
        linesByCoin,
      });
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
