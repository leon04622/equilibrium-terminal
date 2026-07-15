import { useExternalNewsStore } from "@/store/useExternalNewsStore";
import { useTerminalStore } from "@/store/terminalStore";
import {
  DEFAULT_SCREENER_FILTER,
  type MarketScreenerFilter,
  type MarketScreenerRow,
  type MarketScreenerSnapshot,
} from "@/types/institutional-capabilities";

export class MarketScreenerEngine {
  static snapshot(filter: MarketScreenerFilter = DEFAULT_SCREENER_FILTER): MarketScreenerSnapshot {
    const terminal = useTerminalStore.getState();
    const news = useExternalNewsStore.getState().headlines ?? [];
    const mids = terminal.mids.mids;
    const rows: MarketScreenerRow[] = [];

    const newsByCoin = new Map<string, number>();
    for (const h of news) {
      if (!h.coin) continue;
      const coin = h.coin.toUpperCase();
      const score =
        h.tier === "squawk" ? 90 : h.tier === "regulatory" ? 80 : h.tier === "macro" ? 65 : 45;
      newsByCoin.set(coin, Math.max(newsByCoin.get(coin) ?? 0, score));
    }

    for (const asset of terminal.assets) {
      if (filter.market === "perp" && asset.market !== "perp") continue;
      if (filter.market === "spot" && asset.market !== "spot") continue;

      const mid = mids[asset.coin] ?? mids[asset.symbol];
      if (!mid || mid <= 0) continue;

      const book = terminal.book?.coin === asset.coin ? terminal.book : null;
      const spreadBps = book?.spreadBps ?? 8;
      const changePct = this.estimateChange(asset.coin, mid);
      if (Math.abs(changePct) < filter.minChangePct && filter.minChangePct > 0) continue;

      const liquidityScore = Math.max(0, Math.min(100, Math.round(100 - spreadBps * 4)));
      const fundingScore = asset.market === "perp" ? Math.min(100, Math.abs(changePct) * 12 + 20) : 0;
      const newsScore = newsByCoin.get(asset.coin.toUpperCase()) ?? 0;
      const compositeScore = Math.round(
        Math.abs(changePct) * 22 +
          liquidityScore * 0.25 +
          fundingScore * 0.2 +
          newsScore * 0.35,
      );

      if (compositeScore < filter.minComposite) continue;

      const tags: string[] = [];
      if (Math.abs(changePct) >= 3) tags.push("MOVER");
      if (spreadBps > 15) tags.push("WIDE");
      if (newsScore >= 70) tags.push("NEWS");
      if (asset.market === "perp") tags.push("PERP");

      rows.push({
        rank: 0,
        coin: asset.coin,
        symbol: asset.symbol,
        mid,
        changePct: Math.round(changePct * 100) / 100,
        fundingScore,
        liquidityScore,
        newsScore,
        compositeScore,
        tags,
      });
    }

    rows.sort((a, b) => b.compositeScore - a.compositeScore);
    const limited = rows.slice(0, filter.limit).map((r, i) => ({ ...r, rank: i + 1 }));

    return {
      rows: limited,
      universeSize: terminal.assets.length,
      computedAt: Date.now(),
      filter,
    };
  }

  private static prevMids = new Map<string, number>();

  private static estimateChange(coin: string, mid: number): number {
    const prev = this.prevMids.get(coin);
    this.prevMids.set(coin, mid);
    if (!prev || prev <= 0) return 0;
    return ((mid - prev) / prev) * 100;
  }
}
