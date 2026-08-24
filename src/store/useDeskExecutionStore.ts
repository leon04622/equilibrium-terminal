import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ExecuteOrderParams } from "@/types/exchange";
import {
  PAPER_STARTING_EQUITY,
  applyPaperFill,
  hydratePaperFill,
  hydratePaperPosition,
  isolatedLiqPx,
  paperCloseTrigger,
  type PaperFill,
  type PaperFillReason,
  type PaperPosition,
} from "@/lib/execution/paperLedger";

export type DeskExecutionMode = "paper" | "live";
export type { PaperFill, PaperFillReason, PaperPosition };

const STORAGE_KEY = "eq-desk-execution-v3";

interface DeskExecutionPersist {
  mode: DeskExecutionMode;
  paperPositions: PaperPosition[];
  paperFills: PaperFill[];
  paperStartingEquity: number;
  paperRealizedPnl: number;
}

function loadPersist(): DeskExecutionPersist {
  const fresh: DeskExecutionPersist = {
    mode: "paper",
    paperPositions: [],
    paperFills: [],
    paperStartingEquity: PAPER_STARTING_EQUITY,
    paperRealizedPnl: 0,
  };
  if (typeof window === "undefined") return fresh;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("eq-desk-execution-v2") ??
      localStorage.getItem("eq-desk-execution-v1");
    if (!raw) return fresh;
    const p = JSON.parse(raw) as Partial<DeskExecutionPersist> & { mode?: DeskExecutionMode };
    return {
      mode: p.mode === "live" ? "live" : "paper",
      paperPositions: Array.isArray(p.paperPositions)
        ? p.paperPositions
            .map(hydratePaperPosition)
            .filter((x): x is PaperPosition => x != null)
            .slice(0, 24)
        : [],
      paperFills: Array.isArray(p.paperFills)
        ? p.paperFills
            .map(hydratePaperFill)
            .filter((x): x is PaperFill => x != null)
            .slice(0, 64)
        : [],
      paperStartingEquity:
        typeof p.paperStartingEquity === "number" && p.paperStartingEquity > 0
          ? p.paperStartingEquity
          : PAPER_STARTING_EQUITY,
      paperRealizedPnl: typeof p.paperRealizedPnl === "number" ? p.paperRealizedPnl : 0,
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
  setPaperTpsl: (
    coin: string,
    tpsl: { takeProfitPx?: number | null; stopLossPx?: number | null },
  ) => void;
  forcePaperClose: (coin: string, px: number, reason: PaperFillReason) => void;
  tickPaperTriggers: (marks: Record<string, number>) => void;
  resetPaperBook: () => void;
}

const initial = loadPersist();

function persistNow(state: DeskExecutionState): void {
  savePersist({
    mode: state.mode,
    paperPositions: state.paperPositions,
    paperFills: state.paperFills,
    paperStartingEquity: state.paperStartingEquity,
    paperRealizedPnl: state.paperRealizedPnl,
  });
}

function commitFill(
  get: () => DeskExecutionState,
  set: (partial: Partial<DeskExecutionState>) => void,
  params: ExecuteOrderParams,
  fillPx: number,
  reason: PaperFillReason,
  marks: Record<string, number>,
): void {
  const state = get();
  const result = applyPaperFill(
    state.paperPositions,
    {
      coin: params.coin,
      isBuy: params.isBuy,
      size: params.size,
      px: fillPx,
      leverage: params.leverage ?? 10,
      isCross: params.isCross !== false,
      reduceOnly: params.reduceOnly,
      isSpot: params.isSpot ?? params.asset >= 10_000,
      takeProfitPx: params.takeProfitPx ?? null,
      stopLossPx: params.stopLossPx ?? null,
    },
    state.paperRealizedPnl,
    state.paperStartingEquity,
    marks,
  );
  if (result.error) throw new Error(result.error);

  const fill: PaperFill = {
    id: `paper-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    coin: params.coin,
    isBuy: params.isBuy,
    size: params.size,
    px: fillPx,
    at: Date.now(),
    reason,
  };
  const paperFills = [fill, ...state.paperFills].slice(0, 64);
  const paperRealizedPnl = state.paperRealizedPnl + result.realizedDelta;
  set({
    paperPositions: result.positions,
    paperFills,
    paperRealizedPnl,
    lastPaperFillAt: fill.at,
  });
  persistNow({
    ...get(),
    paperPositions: result.positions,
    paperFills,
    paperRealizedPnl,
  });
}

export const useDeskExecutionStore = create<DeskExecutionState>()(
  subscribeWithSelector((set, get) => ({
    mode: initial.mode,
    paperPositions: initial.paperPositions,
    paperFills: initial.paperFills,
    paperStartingEquity: initial.paperStartingEquity,
    paperRealizedPnl: initial.paperRealizedPnl,
    lastPaperFillAt: initial.paperFills[0]?.at ?? null,

    setMode: (mode) => {
      set({ mode });
      persistNow({ ...get(), mode });
    },

    recordPaperFill: (params, fillPx) => {
      commitFill(get, set, params, fillPx, "order", { [params.coin]: fillPx });
    },

    setPaperTpsl: (coin, tpsl) => {
      const paperPositions = get().paperPositions.map((p) => {
        if (p.coin !== coin || Math.abs(p.size) < 1e-12) return p;
        return {
          ...p,
          takeProfitPx: tpsl.takeProfitPx !== undefined ? tpsl.takeProfitPx : p.takeProfitPx,
          stopLossPx: tpsl.stopLossPx !== undefined ? tpsl.stopLossPx : p.stopLossPx,
          updatedAt: Date.now(),
        };
      });
      set({ paperPositions });
      persistNow({ ...get(), paperPositions });
    },

    forcePaperClose: (coin, px, reason) => {
      const pos = get().paperPositions.find((p) => p.coin === coin);
      if (!pos || Math.abs(pos.size) < 1e-12) return;
      commitFill(
        get,
        set,
        {
          coin,
          asset: 0,
          isBuy: pos.size < 0,
          size: Math.abs(pos.size),
          mode: "market",
          reduceOnly: true,
          leverage: pos.leverage,
          isCross: pos.isCross,
        },
        px,
        reason,
        { [coin]: px },
      );
    },

    tickPaperTriggers: (marks) => {
      const positions = get().paperPositions;
      if (positions.length === 0) return;
      for (const p of [...positions]) {
        const mark = marks[p.coin];
        if (!mark || mark <= 0) continue;
        const reason = paperCloseTrigger(p, mark);
        if (!reason) continue;
        const liq = isolatedLiqPx(p);
        get().forcePaperClose(p.coin, reason === "liq" && liq != null ? liq : mark, reason);
      }
    },

    resetPaperBook: () => {
      set({
        paperPositions: [],
        paperFills: [],
        paperRealizedPnl: 0,
        lastPaperFillAt: null,
      });
      persistNow({ ...get(), paperPositions: [], paperFills: [], paperRealizedPnl: 0 });
    },
  })),
);
