"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Layout } from "react-grid-layout";
import { layoutsEqual } from "@/lib/telemetry/layoutUtils";
import { telemetryPipeline } from "@/lib/telemetry/TelemetryPipeline";
import { terminalBus } from "@/store/eventBus";
import {
  useTraderTelemetryStore,
  type TraderTelemetryState,
} from "@/store/useTraderTelemetryStore";

function panelFromTarget(target: EventTarget | null): string | undefined {
  if (!target || !(target instanceof Element)) return undefined;
  const panel = target.closest("[data-panel-id]");
  if (panel instanceof HTMLElement && panel.dataset.panelId) {
    return panel.dataset.panelId;
  }
  return undefined;
}

export interface UseTraderTelemetryOptions {
  baseLayout: Layout[];
  onAdaptiveLayout?: (layout: Layout[]) => void;
  /** Default false — programmatic layout patches can loop with react-grid-layout. */
  autoApplyLayout?: boolean;
}

/**
 * Boots Phase 11 telemetry — bus bridges, capture-phase clicks, hesitation tracking.
 * All ingestion routes through the off-render event buffer.
 */
export function useTraderTelemetry(options: UseTraderTelemetryOptions): void {
  const { baseLayout, onAdaptiveLayout, autoApplyLayout = false } = options;
  const layoutRef = useRef(baseLayout);
  const onLayoutRef = useRef(onAdaptiveLayout);
  const lastAppliedReasonRef = useRef<string | null>(null);
  const applyingLayoutRef = useRef(false);

  layoutRef.current = baseLayout;
  onLayoutRef.current = onAdaptiveLayout;

  const enqueue = useCallback((input: Parameters<TraderTelemetryState["trackInteraction"]>[0]) => {
    const ev = useTraderTelemetryStore.getState().trackInteraction(input);
    telemetryPipeline.enqueue(ev);
    useTraderTelemetryStore.getState().refreshPriorityCap();
    return ev;
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      telemetryPipeline.start(layoutRef.current);
    }, 0);
    return () => {
      window.clearTimeout(id);
      telemetryPipeline.stop();
    };
  }, []);

  useEffect(() => {
    if (applyingLayoutRef.current) return;
    telemetryPipeline.updateBaseLayout(baseLayout);
  }, [baseLayout]);

  useEffect(() => {
    const unsubs = [
      terminalBus.on("asset:select", ({ coin, source }) => {
        useTraderTelemetryStore.getState().registerAssetFocus(source);
        enqueue({
          kind: "asset_focus",
          panelId: "chart",
          coin,
          routeParts: ["asset", source, coin],
        });
      }),

      terminalBus.on("alert:triggered", ({ id, severity }) => {
        useTraderTelemetryStore.getState().registerAlertSignal(id, severity);
        enqueue({
          kind: "alert_view",
          panelId: "alerts",
          routeParts: ["alert", id],
          severity,
        });
      }),

      terminalBus.on("intelligence:signal", ({ id, coin }) => {
        useTraderTelemetryStore.getState().registerIntelligenceSignal(id, "watch");
        enqueue({
          kind: "intel_wire",
          panelId: "intelligence",
          coin,
          routeParts: ["intel", id],
          severity: "watch",
        });
      }),

      terminalBus.on("widget:focus", ({ widgetId }) => {
        enqueue({
          kind: "widget_focus",
          panelId: widgetId,
          routeParts: ["widget", widgetId],
        });
      }),

      terminalBus.on("ai:prompt", ({ source }) => {
        enqueue({
          kind: "omnibar_command",
          panelId: "copilot",
          routeParts: ["omni", source],
        });
      }),

      terminalBus.on("stream:status", ({ status }) => {
        telemetryPipeline.noteStreamStatus(status);
        enqueue({
          kind: "stream_status",
          routeParts: ["stream", status],
        });
      }),

      terminalBus.on("layout:refresh", () => {
        enqueue({
          kind: "layout_change",
          panelId: "workspace",
          routeParts: ["layout", "refresh"],
        });
      }),

      terminalBus.on("network:layout", () => {
        enqueue({
          kind: "layout_change",
          panelId: "workspace",
          routeParts: ["layout", "network"],
        });
      }),
    ];

    return () => {
      for (const off of unsubs) off();
    };
  }, [enqueue]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const panelId = panelFromTarget(e.target);
      enqueue({
        kind: "click",
        panelId,
        routeParts: ["click", panelId ?? "root"],
      });
    };

    window.addEventListener("click", onClick, { capture: true, passive: true });
    return () => window.removeEventListener("click", onClick, { capture: true });
  }, [enqueue]);

  useEffect(() => {
    if (!autoApplyLayout) return;
    return useTraderTelemetryStore.subscribe(
      (s) => s.adaptiveSuggestion,
      (suggestion) => {
        if (!suggestion || !autoApplyLayout) return;
        if (suggestion.appliedAt != null) return;
        if (suggestion.reason === lastAppliedReasonRef.current) return;
        if (layoutsEqual(suggestion.layout, layoutRef.current)) {
          useTraderTelemetryStore.getState().markSuggestionApplied();
          return;
        }

        lastAppliedReasonRef.current = suggestion.reason;
        applyingLayoutRef.current = true;
        onLayoutRef.current?.(suggestion.layout);
        useTraderTelemetryStore.getState().markSuggestionApplied();
        queueMicrotask(() => {
          applyingLayoutRef.current = false;
        });
      },
      {
        equalityFn: (a, b) =>
          a?.reason === b?.reason && a?.appliedAt === b?.appliedAt,
      },
    );
  }, [autoApplyLayout]);
}
