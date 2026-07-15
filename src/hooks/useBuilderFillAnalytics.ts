"use client";

import { useCallback, useEffect, useState } from "react";
import { EQUILIBRIUM_BUILDER_ADDRESS } from "@/lib/hyperliquid/builder";
import type { BuilderFillAnalytics } from "@/types/builder-fills";

const POLL_MS = 5 * 60_000;

export function useBuilderFillAnalytics(lookbackDays = 7) {
  const [analytics, setAnalytics] = useState<BuilderFillAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/builder/fills?days=${lookbackDays}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as BuilderFillAnalytics;
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fill analytics unavailable");
    } finally {
      setLoading(false);
    }
  }, [lookbackDays]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {
    builderAddress: EQUILIBRIUM_BUILDER_ADDRESS,
    analytics,
    loading,
    error,
    refresh,
  };
}
