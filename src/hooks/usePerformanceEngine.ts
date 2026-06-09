"use client";

import { useEffect } from "react";
import { stressModeController } from "@/lib/performance/StressModeController";
import { terminalBus } from "@/store/eventBus";
import { usePerformanceStore } from "@/store/usePerformanceStore";

/** Bridges stream status into performance vitals + stress hints. */
export function usePerformanceEngine(): void {
  useEffect(() => {
    const off = terminalBus.on("stream:status", (payload) => {
      if (payload.status === "reconnecting") {
        stressModeController.recordMessages(30);
      }
    });
    return off;
  }, []);

  useEffect(() => {
    const hydrated =
      typeof window !== "undefined" &&
      localStorage.getItem("eq-perf-hud") === "1";
    if (hydrated) usePerformanceStore.getState().setShowHud(true);
  }, []);
}
