"use client";

import { useEffect } from "react";
import { InstrumentMasterEngine } from "@/lib/institutional/InstrumentMasterEngine";
import { useInstrumentMasterStore } from "@/store/useInstrumentMasterStore";

const TICK_MS = 5 * 60_000;

export function useInstrumentMaster(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      useInstrumentMasterStore.getState().setLoading(true);
      try {
        const snapshot = await InstrumentMasterEngine.snapshot();
        useInstrumentMasterStore.getState().setSnapshot(snapshot);
      } catch {
        useInstrumentMasterStore.getState().setLoading(false);
      }
    };

    void refresh();
    const id = window.setInterval(() => void refresh(), TICK_MS);
    return () => window.clearInterval(id);
  }, [enabled]);
}
