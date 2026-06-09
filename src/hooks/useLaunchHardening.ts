"use client";

import { useEffect } from "react";
import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useHardeningStore } from "@/store/useHardeningStore";
import { useTerminalStore } from "@/store/terminalStore";

const POLL_MS = 6_000;

export function useLaunchHardening(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useHardeningStore.getState().setSnapshot(HardeningOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, POLL_MS);

    const offStream = terminalBus.on("stream:status", () => refresh());
    const unsubConn = useTerminalStore.subscribe((s) => s.connectionStatus, () => refresh());

    return () => {
      window.clearInterval(id);
      offStream();
      unsubConn();
    };
  }, [enabled]);
}
