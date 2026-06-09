"use client";

import { useEffect } from "react";
import { OperatorGuideOrchestrator } from "@/lib/operator-guide/OperatorGuideOrchestrator";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import { terminalBus } from "@/store/eventBus";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const TICK_MS = 1_500;

export function useOperatorGuide(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    useOperatorGuideStore.getState().hydrate();

    const refresh = () => {
      useOperatorGuideStore.getState().setSnapshot(OperatorGuideOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);

    const offSelect = terminalBus.on("guide:select", ({ targetId }) => {
      OperatorGuideOrchestrator.selectTarget(targetId);
    });

    const offReplay = terminalBus.on("chart:replay", () => {
      if (useOperatorGuideStore.getState().activeReplay) refresh();
    });

    const unsubGuide = useOperatorGuideStore.subscribe(
      (s) => s.explainModeActive,
      refresh,
    );

    const unsubReplay = useOperatorGuideStore.subscribe(
      (s) => s.activeReplay?.scenarioId,
      refresh,
    );
    const unsubTarget = useOperatorGuideStore.subscribe(
      (s) => s.selectedTargetId,
      refresh,
    );
    const unsubAudience = useOperatorGuideStore.subscribe(
      (s) => s.selectedAudience,
      refresh,
    );

    return () => {
      window.clearInterval(id);
      offSelect();
      offReplay();
      unsubGuide();
      unsubReplay();
      unsubTarget();
      unsubAudience();
      if (useOperatorGuideStore.getState().activeReplay) {
        chartReplayEngine.goLive();
      }
    };
  }, [enabled]);
}
