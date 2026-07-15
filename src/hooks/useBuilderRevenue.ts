"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchBuilderReferralState } from "@/lib/hyperliquid/api";
import { EQUILIBRIUM_BUILDER_ADDRESS } from "@/lib/hyperliquid/builder";
import type { HlReferralState } from "@/types/hyperliquid-referral";

const POLL_MS = 60_000;

export function useBuilderRevenue() {
  const [state, setState] = useState<HlReferralState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchBuilderReferralState(EQUILIBRIUM_BUILDER_ADDRESS);
      setState(data);
      setError(null);
      setUpdatedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Builder stats unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return {
    builderAddress: EQUILIBRIUM_BUILDER_ADDRESS,
    state,
    loading,
    error,
    updatedAt,
    refresh,
  };
}
