"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Layout } from "react-grid-layout";
import { layoutsEqual } from "@/lib/telemetry/layoutUtils";
import { LayoutOrchestrator } from "@/lib/adaptive/LayoutOrchestrator";
import { WorkspaceContextEngine } from "@/lib/adaptive/WorkspaceContextEngine";
import { AttentionGovernor } from "@/lib/adaptive/AttentionGovernor";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";

const TICK_MS = 8_000;

export interface UseAdaptiveWorkspaceOptions {
  baseLayout: Layout[];
  onLayoutCommit?: (layout: Layout[]) => void;
}

/**
 * Phase 15 — adaptive workspace orchestration loop.
 * Applies layout when autoAdapt is on and user has not locked layout manually.
 */
export function useAdaptiveWorkspace(options: UseAdaptiveWorkspaceOptions): void {
  const { baseLayout, onLayoutCommit } = options;
  const layoutRef = useRef(baseLayout);
  const applyingRef = useRef(false);

  layoutRef.current = baseLayout;

  const runOrchestration = useCallback(
    (applyLayout: boolean) => {
      const state = useAdaptiveWorkspaceStore.getState();
      const result = LayoutOrchestrator.orchestrate(
        layoutRef.current,
        state.mode,
        state.focusMode,
      );
      const context = WorkspaceContextEngine.build();
      const cognitive = AttentionGovernor.evaluate(
        context,
        useTraderTelemetryStore.getState().metrics,
        layoutRef.current.length,
      );
      const emphasis = LayoutOrchestrator.emphasisMap(result.scores);

      state.ingestOrchestration(result, context, cognitive, emphasis);

      if (
        applyLayout &&
        state.autoAdapt &&
        Date.now() > state.userLockedUntil &&
        onLayoutCommit &&
        !layoutsEqual(result.layout, layoutRef.current)
      ) {
        applyingRef.current = true;
        onLayoutCommit(result.layout);
        queueMicrotask(() => {
          applyingRef.current = false;
        });
      }

      return result;
    },
    [onLayoutCommit],
  );

  useEffect(() => {
    runOrchestration(false);
    const id = window.setInterval(() => {
      if (applyingRef.current) return;
      runOrchestration(true);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [runOrchestration]);

  useEffect(() => {
    return useAdaptiveWorkspaceStore.subscribe(
      (s) => s.mode,
      () => runOrchestration(useAdaptiveWorkspaceStore.getState().autoAdapt),
    );
  }, [runOrchestration]);

  useEffect(() => {
    return useAdaptiveWorkspaceStore.subscribe(
      (s) => s.focusMode,
      () => runOrchestration(useAdaptiveWorkspaceStore.getState().autoAdapt),
    );
  }, [runOrchestration]);

  useEffect(() => {
    return useAdaptiveWorkspaceStore.subscribe(
      (s) => s.autoAdapt,
      (auto) => {
        if (auto) runOrchestration(true);
      },
    );
  }, [runOrchestration]);
}
