import type {
  HlAssetPosition,
  HlClearinghouseState,
  PositionRow,
} from "@/types/account";
import { resolveAssetIndex } from "@/lib/asset-index";
import { fetchClearinghouseState } from "@/lib/hyperliquid-api";

export async function fetchUserClearinghouse(
  user: string,
): Promise<HlClearinghouseState> {
  return fetchClearinghouseState(user);
}

export async function mapPositions(
  state: HlClearinghouseState,
  mids: Record<string, string>,
  prevRows: PositionRow[] = [],
): Promise<PositionRow[]> {
  const prevPnl = new Map(prevRows.map((r) => [r.coin, r.unrealizedPnl]));

  const rows: PositionRow[] = [];
  for (const ap of state.assetPositions) {
    const row = await assetPositionToRow(ap, mids, prevPnl.get(ap.position.coin));
    if (row) rows.push(row);
  }
  return rows;
}

async function assetPositionToRow(
  ap: HlAssetPosition,
  mids: Record<string, string>,
  prevPnl?: number,
): Promise<PositionRow | null> {
  const p = ap.position;
  const size = parseFloat(p.szi);
  if (Math.abs(size) < 1e-12) return null;

  let assetIndex: number;
  try {
    assetIndex = await resolveAssetIndex(p.coin);
  } catch {
    return null;
  }

  const markFromMid = mids[p.coin] ? parseFloat(mids[p.coin]) : NaN;
  const markPrice = Number.isFinite(markFromMid)
    ? markFromMid
    : parseFloat(p.positionValue) / Math.abs(size);

  const unrealizedPnl = parseFloat(p.unrealizedPnl);
  let pnlFlash: "up" | "down" | null = null;
  if (prevPnl !== undefined && unrealizedPnl !== prevPnl) {
    pnlFlash = unrealizedPnl > prevPnl ? "up" : "down";
  }

  return {
    id: p.coin,
    coin: p.coin,
    assetIndex,
    size,
    entryPrice: parseFloat(p.entryPx),
    markPrice,
    marginType: p.leverage.type === "cross" ? "Cross" : "Isolated",
    leverage: p.leverage.value,
    unrealizedPnl,
    pnlFlash,
  };
}

export function parseAccountValue(state: HlClearinghouseState): number {
  return parseFloat(state.marginSummary.accountValue);
}

export function parseWithdrawable(state: HlClearinghouseState): number {
  return parseFloat(state.withdrawable);
}
