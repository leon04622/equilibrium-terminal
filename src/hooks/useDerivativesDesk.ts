"use client";

import { useEffect } from "react";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { OptionsIngestionEngine } from "@/lib/derivatives/OptionsIngestionEngine";
import { useDerivativesDeskStore } from "@/store/useDerivativesDeskStore";
import { useTerminalStore } from "@/store/terminalStore";

const TICK_MS = 2_000;
const OPTIONS_INGEST_MS = 20_000;

export function useDerivativesDesk(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      useDerivativesDeskStore
        .getState()
        .setSnapshot(DerivativesIntelligenceOrchestrator.snapshot(asset));
    };

    const ingest = () => {
      const asset = useTerminalStore.getState().selectedCoin;
      void OptionsIngestionEngine.ingest(asset).then(() => refresh());
    };

    ingest();
    refresh();

    const tickId = window.setInterval(refresh, TICK_MS);
    const ingestId = window.setInterval(ingest, OPTIONS_INGEST_MS);

    const unsubBook = useTerminalStore.subscribe((s) => s.bookVersion, () => refresh());
    const unsubCandles = useTerminalStore.subscribe((s) => s.candles.length, () => refresh());
    const unsubCoin = useTerminalStore.subscribe((s) => s.selectedCoin, () => {
      ingest();
      refresh();
    });

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(ingestId);
      unsubBook();
      unsubCandles();
      unsubCoin();
    };
  }, [enabled]);
}
