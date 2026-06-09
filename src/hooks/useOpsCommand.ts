"use client";

import { useEffect } from "react";
import { OpsCommandOrchestrator } from "@/lib/ops-command/OpsCommandOrchestrator";
import { useOpsCommandStore } from "@/store/useOpsCommandStore";
import { useDevOpsStore } from "@/store/useDevOpsStore";

const TICK_MS = 3_000;

export function useOpsCommand(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useOpsCommandStore.getState().setSnapshot(OpsCommandOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsubOps = useDevOpsStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsubOps();
    };
  }, [enabled]);
}
