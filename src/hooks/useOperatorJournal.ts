"use client";

import { useEffect } from "react";
import { OperatorJournalOrchestrator } from "@/lib/operator-journal/OperatorJournalOrchestrator";
import { useOperatorJournalStore } from "@/store/useOperatorJournalStore";

const TICK_MS = 15_000;

export function useOperatorJournal(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const store = useOperatorJournalStore.getState();
    store.hydrate();
    store.ensureSession();

    // `force` runs the compute even when the tab is hidden — required so the
    // first snapshot always lands (otherwise the console can stick on "Booting…").
    const refresh = (force = false) => {
      if (!force && typeof document !== "undefined" && document.hidden) return;
      useOperatorJournalStore.getState().observeContext();
      useOperatorJournalStore.getState().setSnapshot(OperatorJournalOrchestrator.snapshot());
    };

    refresh(true);
    const id = window.setInterval(() => refresh(), TICK_MS);

    // Subscribe to the decisions array reference (not just length) so logging a
    // decision, editing a reflection, or hitting the 200-cap all refresh the UI
    // immediately rather than waiting for the next interval tick.
    const unsubDecisions = useOperatorJournalStore.subscribe(
      (s) => s.decisions,
      () => {
        useOperatorJournalStore.getState().setSnapshot(OperatorJournalOrchestrator.snapshot());
      },
    );

    const onVisible = () => {
      if (!document.hidden) refresh(true);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(id);
      unsubDecisions();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}
