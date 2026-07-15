"use client";

import { useEffect } from "react";
import { LiveBlotterEngine } from "@/lib/institutional/LiveBlotterEngine";
import { useLiveBlotterStore } from "@/store/useLiveBlotterStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 4_000;

export function useLiveBlotter(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      const wallet = useTerminalStore.getState().walletAddress;
      useLiveBlotterStore.getState().setLoading(true);
      const snapshot = await LiveBlotterEngine.snapshot(wallet);
      useLiveBlotterStore.getState().setSnapshot(snapshot);
    };

    void refresh();
    const id = window.setInterval(() => void refresh(), TICK_MS);

    const unsubWallet = useTerminalStore.subscribe(
      (s) => s.walletAddress,
      () => void refresh(),
    );

    return () => {
      window.clearInterval(id);
      unsubWallet();
    };
  }, [enabled]);
}
