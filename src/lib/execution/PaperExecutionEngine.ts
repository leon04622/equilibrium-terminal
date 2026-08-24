import type { ExecuteOrderParams } from "@/types/exchange";

export function resolvePaperMarkPx(args: {
  coin: string;
  selectedCoin?: string | null;
  lastTradePx?: number | null;
  bookCoin?: string | null;
  bookMid?: number | null;
  candleClose?: number | null;
  midPx?: number | null;
  fallbackPx?: number | null;
}): number | null {
  const bookMid =
    args.bookCoin === args.coin && args.bookMid && args.bookMid > 0 ? args.bookMid : null;
  const candleClose =
    args.selectedCoin === args.coin && args.candleClose && args.candleClose > 0
      ? args.candleClose
      : null;
  const picks = [candleClose, args.lastTradePx, bookMid, args.midPx, args.fallbackPx];
  for (const px of picks) {
    if (typeof px === "number" && Number.isFinite(px) && px > 0) return px;
  }
  return null;
}

function roundPaperPx(px: number, szDecimals: number, isSpot: boolean): number {
  const decimalPlaces = Math.max(0, (isSpot ? 8 : 6) - szDecimals);
  return Number(px.toFixed(decimalPlaces));
}

/** Paper market fills at the live mark the chart/tape shows — no live-exchange slip. */
export function paperFillPrice(params: ExecuteOrderParams, markPx: number): number {
  if (params.mode === "limit" && params.limitPx && params.limitPx > 0) {
    return params.limitPx;
  }
  if (params.mode === "stop" && params.stopPx && params.stopPx > 0) {
    return params.stopPx;
  }
  const szDecimals = params.szDecimals ?? 4;
  const isSpot = params.isSpot === true || params.asset >= 10_000;
  return roundPaperPx(markPx, szDecimals, isSpot);
}
