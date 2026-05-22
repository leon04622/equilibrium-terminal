"use client";

import { useEffect } from "react";
import { agenticRuntimeLoop } from "@/lib/agentic/AgenticRuntimeLoop";
import { terminalBus } from "@/store/eventBus";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useAlertStore } from "@/store/useAlertStore";

/** Boots Phase 8 background cognition loop and bridges alert events into agent context. */
export function useAgenticLoop(): void {
  useEffect(() => {
    agenticRuntimeLoop.start();

    const offAlert = terminalBus.on("alert:triggered", ({ id }) => {
      const trigger = useAlertStore.getState().triggers.find((t) => t.id === id);
      if (!trigger) return;
      useAgentOperationsStore.getState().ingestMarketEvent(trigger.event);
    });

    return () => {
      offAlert();
      agenticRuntimeLoop.stop();
    };
  }, []);
}
