import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ExecuteOrderParams } from "@/types/exchange";

export type DeskExecutionMode = "paper" | "live";

export interface PaperFill {
  id: string;
  coin: string;
  isBuy: boolean;
  size: number;
  px: number;
  at: number;
}

export interface PaperPosition {
  coin: string;
  size: number;
  avgPx: number;
  updatedAt: number;
}

const STORAGE_KEY = "eq-desk-execution-v2";

interface DeskExecutionPersist {
  mode: DeskExecutionMode;
  paperPositions: PaperPosition[];
  paperFills: PaperFill[];
}

function loadPersist(): DeskExecutionPersist {
  const fresh: DeskExecutionPersist = {
    mode: "paper",
    paperPositions: [],
    paperFills: [],
  };
  if (typeof window === "undefined") return fresh;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("eq-desk-execution-v1");
      if (legacy) {
        const p = JSON.parse(legacy) as { mode?: DeskExecutionMode };
        return { ...fresh, mode: p.mode === "live" ? "live" : "paper" };
      }
      return fresh;
    }
    const p = JSON.parse(raw) as Partial<DeskExecutionPersist>;
    return {
      mode: p.mode === "live" ? "live" : "paper",
      paperPositions: Array.isArray(p.paperPositions) ? p.paperPositions.slice(0, 24) : [],
      paperFills: Array.isArray(p.paperFills) ? p.paperFills.slice(0, 64) : [],
    };
  } catch {
    return fresh;
  }
}

function savePersist(state: DeskExecutionPersist): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

interface DeskExecutionState extends DeskExecutionPersist {
  lastPaperFillAt: number | null;
  setMode: (mode: DeskExecutionMode) => void;
  recordPaperFill: (params: ExecuteOrderParams, fillPx: number) => void;
  resetPaperBook: () => void;
}

const initial = loadPersist();

export const useDeskExecutionStore = create<DeskExecutionState>()(
  subscribeWithSelector((set, get) => ({
    mode: initial.mode,
    paperPositions: initial.paperPositions,
    paperFills: initial.paperFills,
    lastPaperFillAt: initial.paperFills[0]?.at ?? null,

    setMode: (mode) => {
      set({ mode });
      savePersist({ ...get(), mode });
    },

    recordPaperFill: (params, fillPx) => {
      const fill: PaperFill = {
        id: `paper-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        coin: params.coin,
        isBuy: params.isBuy,
        size: params.size,
        px: fillPx,
        at: Date.now(),
      };

      const positions = [...get().paperPositions];
      const idx = positions.findIndex((p) => p.coin === params.coin);
      const signedDelta = params.isBuy ? params.size : -params.size;

      if (idx < 0) {
        positions.push({
          coin: params.coin,
          size: signedDelta,
          avgPx: fillPx,
          updatedAt: Date.now(),
        });
      } else {
        const cur = positions[idx];
        const nextSize = cur.size + signedDelta;
        if (Math.abs(nextSize) < 1e-9) {
          positions.splice(idx, 1);
        } else if (Math.sign(nextSize) === Math.sign(cur.size) || cur.size === 0) {
          const total = Math.abs(cur.size) + params.size;
          const avgPx =
            total > 0
              ? (Math.abs(cur.size) * cur.avgPx + params.size * fillPx) / total
              : fillPx;
          positions[idx] = { ...cur, size: nextSize, avgPx, updatedAt: Date.now() };
        } else {
          positions[idx] = { ...cur, size: nextSize, avgPx: fillPx, updatedAt: Date.now() };
        }
      }

      const paperFills = [fill, ...get().paperFills].slice(0, 64);
      set({ paperPositions: positions, paperFills, lastPaperFillAt: fill.at });
      savePersist({ mode: get().mode, paperPositions: positions, paperFills });
    },

    resetPaperBook: () => {
      set({ paperPositions: [], paperFills: [], lastPaperFillAt: null });
      savePersist({ mode: get().mode, paperPositions: [], paperFills: [] });
    },
  })),
);
