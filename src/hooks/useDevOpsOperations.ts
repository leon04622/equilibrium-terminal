"use client";

import { useEffect } from "react";
import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { StreamResilienceEngine } from "@/lib/devops/StreamResilienceEngine";
import { terminalBus } from "@/store/eventBus";
import { useDevOpsStore } from "@/store/useDevOpsStore";
import { useTerminalStore } from "@/store/terminalStore";

const POLL_MS = 5_000;

export function useDevOpsOperations(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useDevOpsStore.getState().setSnapshot(DevOpsOperationsOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, POLL_MS);

    const offStream = terminalBus.on("stream:status", (payload) => {
      if (payload.status === "reconnecting") {
        StreamResilienceEngine.noteReconnect();
      }
      refresh();
    });

    const unsubConn = useTerminalStore.subscribe(
      (s) => s.connectionStatus,
      () => refresh(),
    );

    return () => {
      window.clearInterval(id);
      offStream();
      unsubConn();
    };
  }, [enabled]);
}
