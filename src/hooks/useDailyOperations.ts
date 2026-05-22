"use client";

import { useEffect } from "react";
import {
  AlertPrioritizer,
  DailyBriefingEngine,
  MarketMemoryArchive,
  MarketStateLayer,
  PersonalOpsEngine,
  SessionClockEngine,
} from "@/lib/daily";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";

const TICK_MS = 4_000;
const MEMORY_MS = 120_000;

export function useDailyOperations(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    useDailyOperationsStore.getState().hydratePersonal();
    const memory = MarketMemoryArchive.load();
    useDailyOperationsStore.getState().setMemory(memory);

    const refresh = () => {
      const clock = SessionClockEngine.snapshot();
      const briefing = DailyBriefingEngine.build();
      const marketState = MarketStateLayer.build();
      const store = useDailyOperationsStore.getState();
      const personal = PersonalOpsEngine.build(
        store.personalPins,
        store.checklist,
        store.favoriteCoins,
      );
      const prioritizedAlerts = AlertPrioritizer.rank();
      const snapshot = {
        clock,
        briefing,
        marketState,
        memory: store.memory,
        personal,
        prioritizedAlerts,
      };
      store.setSnapshot(snapshot);
      store.setPrioritizedAlerts(prioritizedAlerts);
    };

    refresh();
    const tickId = window.setInterval(refresh, TICK_MS);
    const memoryId = window.setInterval(() => {
      const snap = useDailyOperationsStore.getState().snapshot;
      if (!snap) return;
      const next = MarketMemoryArchive.appendFromSnapshot(snap);
      useDailyOperationsStore.getState().setMemory(next);
    }, MEMORY_MS);

    return () => {
      window.clearInterval(tickId);
      window.clearInterval(memoryId);
    };
  }, [enabled]);
}
