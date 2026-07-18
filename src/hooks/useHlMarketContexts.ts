"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { MarketContextRow, MarketContextsSnapshot } from "@/types/market-search";

const POLL_MS = 60_000;
const STALE_MS = 55_000;

let sharedSnapshot: MarketContextsSnapshot = { rows: [], updatedAt: 0 };
let inflight: Promise<void> | null = null;
let pollTimer: ReturnType<typeof window.setInterval> | null = null;
let subscriberCount = 0;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

async function fetchContexts(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/market/contexts", { cache: "no-store" });
      if (!res.ok) return;
      const body = (await res.json()) as MarketContextsSnapshot;
      sharedSnapshot = { rows: body.rows ?? [], updatedAt: body.updatedAt ?? Date.now() };
      emit();
    } catch {
      /* keep last snapshot */
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function startPolling(): void {
  if (pollTimer) return;
  const tick = () => {
    if (Date.now() - sharedSnapshot.updatedAt >= STALE_MS) void fetchContexts();
  };
  pollTimer = window.setInterval(tick, POLL_MS);
}

function stopPolling(): void {
  if (pollTimer) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
}

function subscribeShared(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    void fetchContexts();
    startPolling();
  }
  return () => {
    listeners.delete(onStoreChange);
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0) stopPolling();
  };
}

function getSharedSnapshot(): MarketContextsSnapshot {
  return sharedSnapshot;
}

export function useHlMarketContexts(enabled = true): {
  rows: MarketContextRow[];
  updatedAt: number;
  loading: boolean;
  refresh: () => void;
} {
  const snapshot = useSyncExternalStore(
    enabled ? subscribeShared : () => () => {},
    getSharedSnapshot,
    getSharedSnapshot,
  );
  const [loading, setLoading] = useState(() => enabled && snapshot.rows.length === 0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    await fetchContexts();
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (snapshot.rows.length > 0) setLoading(false);
  }, [enabled, snapshot.rows.length, snapshot.updatedAt]);

  return {
    rows: enabled ? snapshot.rows : [],
    updatedAt: snapshot.updatedAt,
    loading: enabled && loading && snapshot.rows.length === 0,
    refresh,
  };
}

export function marketRowForCoin(rows: MarketContextRow[], coin: string): MarketContextRow | null {
  return rows.find((r) => r.coin === coin) ?? null;
}
