export const PAPER_STARTING_EQUITY = 10_000;

export type PaperFillReason = "order" | "tp" | "sl" | "liq";

export interface PaperFill {
  id: string;
  coin: string;
  isBuy: boolean;
  size: number;
  px: number;
  at: number;
  reason?: PaperFillReason;
}

export interface PaperPosition {
  coin: string;
  size: number;
  avgPx: number;
  leverage: number;
  isCross: boolean;
  takeProfitPx: number | null;
  stopLossPx: number | null;
  updatedAt: number;
}

/** Maintenance margin ratio — Hyperliquid-style half of initial margin, floored. */
export function maintenanceMarginRatio(leverage: number): number {
  const imr = 1 / Math.max(leverage, 1);
  return Math.min(imr * 0.5, 0.05);
}

export function positionNotional(size: number, px: number): number {
  return Math.abs(size) * px;
}

export function positionMargin(size: number, px: number, leverage: number): number {
  return positionNotional(size, px) / Math.max(leverage, 1);
}

/**
 * Isolated liquidation price.
 * Long: mark <= entry * (1 - 1/lev) / (1 - mmr)
 * Short: mark >= entry * (1 + 1/lev) / (1 + mmr)
 */
export function isolatedLiqPx(position: Pick<PaperPosition, "size" | "avgPx" | "leverage">): number | null {
  if (!position.size || position.avgPx <= 0) return null;
  const lev = Math.max(position.leverage, 1);
  const mmr = maintenanceMarginRatio(lev);
  if (position.size > 0) {
    const num = 1 - 1 / lev;
    const den = 1 - mmr;
    if (den <= 0) return position.avgPx;
    return position.avgPx * (num / den);
  }
  const num = 1 + 1 / lev;
  const den = 1 + mmr;
  return position.avgPx * (num / den);
}

export function unrealizedPnl(position: Pick<PaperPosition, "size" | "avgPx">, markPx: number): number {
  if (!markPx || markPx <= 0) return 0;
  return (markPx - position.avgPx) * position.size;
}

export interface PaperAccountSnapshot {
  starting: number;
  realized: number;
  unrealized: number;
  equity: number;
  marginUsed: number;
  available: number;
  openCount: number;
}

export function paperAccountSnapshot(
  positions: PaperPosition[],
  realized: number,
  starting: number,
  marks: Record<string, number>,
): PaperAccountSnapshot {
  let unrealized = 0;
  let marginUsed = 0;
  let openCount = 0;
  for (const p of positions) {
    if (Math.abs(p.size) < 1e-12) continue;
    openCount += 1;
    const mark = marks[p.coin] ?? p.avgPx;
    unrealized += unrealizedPnl(p, mark);
    marginUsed += positionMargin(p.size, mark, p.leverage);
  }
  const equity = starting + realized + unrealized;
  return {
    starting,
    realized,
    unrealized,
    equity,
    marginUsed,
    available: equity - marginUsed,
    openCount,
  };
}

export type PaperCloseReason = "tp" | "sl" | "liq";

export function paperCloseTrigger(position: PaperPosition, markPx: number): PaperCloseReason | null {
  if (!markPx || markPx <= 0 || Math.abs(position.size) < 1e-12) return null;
  const liq = isolatedLiqPx(position);
  if (liq != null) {
    if (position.size > 0 && markPx <= liq) return "liq";
    if (position.size < 0 && markPx >= liq) return "liq";
  }
  if (position.size > 0) {
    if (position.stopLossPx != null && markPx <= position.stopLossPx) return "sl";
    if (position.takeProfitPx != null && markPx >= position.takeProfitPx) return "tp";
    return null;
  }
  if (position.stopLossPx != null && markPx >= position.stopLossPx) return "sl";
  if (position.takeProfitPx != null && markPx <= position.takeProfitPx) return "tp";
  return null;
}

export interface PaperFillInput {
  coin: string;
  isBuy: boolean;
  size: number;
  px: number;
  leverage: number;
  isCross: boolean;
  reduceOnly?: boolean;
  isSpot?: boolean;
  takeProfitPx?: number | null;
  stopLossPx?: number | null;
}

export interface PaperFillResult {
  positions: PaperPosition[];
  realizedDelta: number;
  error?: string;
}

function clampReduceOnly(existingSize: number, signedDelta: number): number | { error: string } {
  if (Math.abs(existingSize) < 1e-12) {
    return { error: "Reduce-only: no position to reduce" };
  }
  if (Math.sign(signedDelta) === Math.sign(existingSize)) {
    return { error: "Reduce-only: order would increase position" };
  }
  const closeCap = -existingSize;
  if (Math.abs(signedDelta) > Math.abs(closeCap)) return closeCap;
  return signedDelta;
}

export function applyPaperFill(
  positions: PaperPosition[],
  fill: PaperFillInput,
  realized: number,
  starting: number,
  marks: Record<string, number>,
): PaperFillResult {
  if (!Number.isFinite(fill.size) || fill.size <= 0) {
    return { positions, realizedDelta: 0, error: "Size must be greater than 0" };
  }
  if (!Number.isFinite(fill.px) || fill.px <= 0) {
    return { positions, realizedDelta: 0, error: "Fill price unavailable" };
  }

  let signedDelta = fill.isBuy ? fill.size : -fill.size;
  const next = positions.map((p) => ({ ...p }));
  const idx = next.findIndex((p) => p.coin === fill.coin);
  const existing = idx >= 0 ? next[idx] : null;

  if (fill.reduceOnly) {
    const reduced = clampReduceOnly(existing?.size ?? 0, signedDelta);
    if (typeof reduced === "object") {
      return { positions, realizedDelta: 0, error: reduced.error };
    }
    signedDelta = reduced;
  }

  if (fill.isSpot && signedDelta < 0) {
    const hold = existing && existing.size > 0 ? existing.size : 0;
    if (Math.abs(signedDelta) > hold + 1e-12) {
      return { positions, realizedDelta: 0, error: "Insufficient spot inventory" };
    }
  }

  const leverage = Math.max(1, fill.leverage);
  const now = Date.now();
  let realizedDelta = 0;

  if (!existing) {
    if (fill.isSpot && signedDelta < 0) {
      return { positions, realizedDelta: 0, error: "Insufficient spot inventory" };
    }
    next.push({
      coin: fill.coin,
      size: signedDelta,
      avgPx: fill.px,
      leverage: fill.isSpot ? 1 : leverage,
      isCross: fill.isSpot ? true : fill.isCross,
      takeProfitPx: fill.takeProfitPx ?? null,
      stopLossPx: fill.stopLossPx ?? null,
      updatedAt: now,
    });
  } else {
    const cur = existing;
    const sameWay = Math.sign(cur.size) === Math.sign(signedDelta) || cur.size === 0;
    if (sameWay) {
      const total = Math.abs(cur.size) + Math.abs(signedDelta);
      const avgPx =
        total > 0
          ? (Math.abs(cur.size) * cur.avgPx + Math.abs(signedDelta) * fill.px) / total
          : fill.px;
      next[idx] = {
        ...cur,
        size: cur.size + signedDelta,
        avgPx,
        leverage: fill.isSpot ? 1 : leverage,
        isCross: fill.isSpot ? true : fill.isCross,
        takeProfitPx: fill.takeProfitPx ?? cur.takeProfitPx,
        stopLossPx: fill.stopLossPx ?? cur.stopLossPx,
        updatedAt: now,
      };
    } else {
      const closing = Math.min(Math.abs(cur.size), Math.abs(signedDelta));
      const side = Math.sign(cur.size);
      realizedDelta = (fill.px - cur.avgPx) * closing * side;
      const leftover = Math.abs(cur.size) - Math.abs(signedDelta);
      if (leftover > 1e-12) {
        next[idx] = {
          ...cur,
          size: side * leftover,
          updatedAt: now,
        };
      } else if (leftover < -1e-12) {
        next[idx] = {
          coin: fill.coin,
          size: signedDelta + cur.size,
          avgPx: fill.px,
          leverage: fill.isSpot ? 1 : leverage,
          isCross: fill.isSpot ? true : fill.isCross,
          takeProfitPx: fill.takeProfitPx ?? null,
          stopLossPx: fill.stopLossPx ?? null,
          updatedAt: now,
        };
      } else {
        next.splice(idx, 1);
      }
    }
  }

  const cleaned = next.filter((p) => Math.abs(p.size) >= 1e-12);
  const snapshot = paperAccountSnapshot(
    cleaned,
    realized + realizedDelta,
    starting,
    { ...marks, [fill.coin]: fill.px },
  );
  if (snapshot.available < -0.05) {
    return { positions, realizedDelta: 0, error: "Insufficient margin" };
  }

  return { positions: cleaned, realizedDelta };
}

export function maxOrderSize(args: {
  available: number;
  markPx: number;
  leverage: number;
  isBuy: boolean;
  isSpot: boolean;
  reduceOnly: boolean;
  existing?: PaperPosition | null;
}): number {
  const { markPx, leverage, isBuy, isSpot, reduceOnly, existing } = args;
  const available = Math.max(0, args.available);
  if (!markPx || markPx <= 0) return 0;
  const pos = existing && Math.abs(existing.size) > 1e-12 ? existing : null;

  if (reduceOnly) {
    if (!pos) return 0;
    const reducing = isBuy ? pos.size < 0 : pos.size > 0;
    return reducing ? Math.abs(pos.size) : 0;
  }

  if (isSpot) {
    if (isBuy) return available > 0 ? available / markPx : 0;
    return pos && pos.size > 0 ? pos.size : 0;
  }

  const lev = Math.max(leverage, 1);
  const fresh = (available * lev) / markPx;
  if (!pos) return fresh;
  const closing = isBuy ? (pos.size < 0 ? Math.abs(pos.size) : 0) : pos.size > 0 ? pos.size : 0;
  return fresh + closing;
}

export function estLiqAfterOrder(args: {
  existing?: PaperPosition | null;
  isBuy: boolean;
  size: number;
  px: number;
  leverage: number;
  isCross: boolean;
}): number | null {
  const signed = args.isBuy ? args.size : -args.size;
  if (!args.size || !args.px) return null;
  const cur = args.existing;
  let next: Pick<PaperPosition, "size" | "avgPx" | "leverage">;
  if (!cur || Math.abs(cur.size) < 1e-12) {
    next = { size: signed, avgPx: args.px, leverage: args.leverage };
  } else if (Math.sign(cur.size) === Math.sign(signed) || cur.size === 0) {
    const total = Math.abs(cur.size) + args.size;
    const avgPx =
      total > 0 ? (Math.abs(cur.size) * cur.avgPx + args.size * args.px) / total : args.px;
    next = { size: cur.size + signed, avgPx, leverage: args.leverage };
  } else {
    const leftover = cur.size + signed;
    if (Math.abs(leftover) < 1e-12) return null;
    if (Math.sign(leftover) === Math.sign(cur.size)) {
      next = { size: leftover, avgPx: cur.avgPx, leverage: cur.leverage };
    } else {
      next = { size: leftover, avgPx: args.px, leverage: args.leverage };
    }
  }
  return isolatedLiqPx(next);
}

export function paperBookSummary(
  positions: PaperPosition[],
  marks: Record<string, number>,
): { unrealized: number; openCount: number } {
  const snap = paperAccountSnapshot(positions, 0, 0, marks);
  return { unrealized: snap.unrealized, openCount: snap.openCount };
}

export function hydratePaperPosition(raw: unknown): PaperPosition | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<PaperPosition>;
  if (typeof p.coin !== "string" || typeof p.size !== "number") return null;
  if (!Number.isFinite(p.size) || !Number.isFinite(p.avgPx)) return null;
  return {
    coin: p.coin,
    size: p.size,
    avgPx: typeof p.avgPx === "number" ? p.avgPx : 0,
    leverage: typeof p.leverage === "number" && p.leverage >= 1 ? p.leverage : 10,
    isCross: p.isCross !== false,
    takeProfitPx: typeof p.takeProfitPx === "number" ? p.takeProfitPx : null,
    stopLossPx: typeof p.stopLossPx === "number" ? p.stopLossPx : null,
    updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
  };
}

export function hydratePaperFill(raw: unknown): PaperFill | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Partial<PaperFill>;
  if (typeof f.id !== "string" || typeof f.coin !== "string") return null;
  if (typeof f.size !== "number" || typeof f.px !== "number") return null;
  return {
    id: f.id,
    coin: f.coin,
    isBuy: Boolean(f.isBuy),
    size: f.size,
    px: f.px,
    at: typeof f.at === "number" ? f.at : Date.now(),
    reason: f.reason === "tp" || f.reason === "sl" || f.reason === "liq" ? f.reason : "order",
  };
}
