"use client";

import { useEffect } from "react";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import { usePortfolioDeskStore } from "@/store/usePortfolioDeskStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_000;

export function usePortfolioDesk(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      usePortfolioDeskStore
        .getState()
        .setSnapshot(PortfolioDeskOrchestrator.snapshot(asset));
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const unsubPositions = useTerminalStore.subscribe(
      (s) => s.positionsVersion,
      () => refresh(),
    );
    const unsubAccount = useTerminalStore.subscribe(
      (s) => s.accountValue,
      () => refresh(),
    );
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => refresh());

    return () => {
      window.clearInterval(id);
      unsubPositions();
      unsubAccount();
      unsubCoin();
    };
  }, [enabled]);
}
