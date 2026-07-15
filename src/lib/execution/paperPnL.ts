import type { PaperFill, PaperPosition } from "@/store/useDeskExecutionStore";

export function unrealizedPnl(position: PaperPosition, markPx: number): number {
  if (!markPx || markPx <= 0) return 0;
  return (markPx - position.avgPx) * position.size;
}

export function realizedFromFills(_fills: PaperFill[]): number {
  return 0;
}

export function paperBookSummary(
  positions: PaperPosition[],
  marks: Record<string, number>,
): { unrealized: number; openCount: number } {
  let unrealized = 0;
  for (const p of positions) {
    const mark = marks[p.coin];
    if (mark) unrealized += unrealizedPnl(p, mark);
  }
  return { unrealized, openCount: positions.length };
}
