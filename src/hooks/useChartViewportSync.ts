"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { IChartApi } from "lightweight-charts";
import type { DrawingViewportPrimitive } from "@/lib/charting/drawingViewportPrimitive";

const KINETIC_SYNC_MS = 750;

/**
 * Repaint drawing overlays when the chart viewport moves. Callback is scoped to
 * the overlay component so ChartWidget does not re-render on every pan frame.
 */
export function useChartViewportSync(
  chartRef: RefObject<IChartApi | null>,
  primitiveRef: RefObject<DrawingViewportPrimitive | null>,
  enabled: boolean,
  onFrame: () => void,
): void {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) return;

    const primitive = primitiveRef.current;
    const chart = chartRef.current;
    if (!primitive || !chart) return;

    let bumpRaf = 0;
    let loopRaf = 0;
    let queued = false;
    let activeUntil = 0;

    const scheduleFrame = () => {
      if (queued) return;
      queued = true;
      bumpRaf = requestAnimationFrame(() => {
        queued = false;
        onFrameRef.current();
      });
    };

    const keepSyncing = () => {
      activeUntil = performance.now() + KINETIC_SYNC_MS;
      scheduleFrame();
      if (loopRaf) return;
      const kineticLoop = () => {
        if (performance.now() >= activeUntil) {
          loopRaf = 0;
          return;
        }
        scheduleFrame();
        loopRaf = requestAnimationFrame(kineticLoop);
      };
      loopRaf = requestAnimationFrame(kineticLoop);
    };

    const unsubPrimitive = primitive.subscribe(scheduleFrame);

    const ts = chart.timeScale();
    ts.subscribeVisibleLogicalRangeChange(keepSyncing);
    ts.subscribeVisibleTimeRangeChange(keepSyncing);
    ts.subscribeSizeChange(keepSyncing);

    const el = chart.chartElement();
    const onWheel = () => keepSyncing();
    const onPointerDown = () => keepSyncing();
    const onPointerUp = () => keepSyncing();
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(bumpRaf);
      cancelAnimationFrame(loopRaf);
      unsubPrimitive();
      ts.unsubscribeVisibleLogicalRangeChange(keepSyncing);
      ts.unsubscribeVisibleTimeRangeChange(keepSyncing);
      ts.unsubscribeSizeChange(keepSyncing);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [chartRef, enabled, primitiveRef]);
}
