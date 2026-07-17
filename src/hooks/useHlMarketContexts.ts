"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketContextRow, MarketContextsSnapshot } from "@/types/market-search";

const POLL_MS = 20_000;

export function useHlMarketContexts(enabled = true): {
  rows: MarketContextRow[];
  updatedAt: number;
  loading: boolean;
  refresh: () => void;
} {
  const [snapshot, setSnapshot] = useState<MarketContextsSnapshot>({ rows: [], updatedAt: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/market/contexts", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as MarketContextsSnapshot;
      setSnapshot({ rows: body.rows ?? [], updatedAt: body.updatedAt ?? Date.now() });
    } catch {
      /* keep last snapshot */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const id = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  return { rows: snapshot.rows, updatedAt: snapshot.updatedAt, loading, refresh };
}

export function marketRowForCoin(rows: MarketContextRow[], coin: string): MarketContextRow | null {
  return rows.find((r) => r.coin === coin) ?? null;
}
