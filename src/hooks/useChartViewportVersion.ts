"use client";

import { useEffect, useReducer, type RefObject } from "react";
import type { IChartApi } from "lightweight-charts";
import { DrawingViewportPrimitive } from "@/lib/charting/drawingViewportPrimitive";

const KINETIC_SYNC_MS = 900;

export function useChartViewportVersion(
  chartRef: RefObject<IChartApi | null>,
  primitiveRef: RefObject<DrawingViewportPrimitive | null>,
  enabled = true,
): number {
  const [version, bumpVersion] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!enabled) return;

    const primitive = primitiveRef.current;
    const chart = chartRef.current;
    if (!primitive || !chart) return;

    let bumpRaf = 0;
    let loopRaf = 0;
    let queued = false;
    let activeUntil = 0;

    const onViewportChange = () => {
      if (queued) return;
      queued = true;
      bumpRaf = requestAnimationFrame(() => {
        queued = false;
        bumpVersion();
      });
    };

    const keepSyncing = () => {
      activeUntil = performance.now() + KINETIC_SYNC_MS;
      onViewportChange();
    };

    const syncLoop = () => {
      if (performance.now() < activeUntil) {
        onViewportChange();
      }
      loopRaf = requestAnimationFrame(syncLoop);
    };

    primitive.setListener(onViewportChange);

    const ts = chart.timeScale();
    ts.subscribeVisibleLogicalRangeChange(keepSyncing);
    ts.subscribeVisibleTimeRangeChange(keepSyncing);
    ts.subscribeSizeChange(keepSyncing);
    chart.subscribeCrosshairMove(keepSyncing);

    const el = chart.chartElement();
    const onWheel = () => keepSyncing();
    const onPointerDown = () => keepSyncing();
    const onPointerUp = () => keepSyncing();
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    loopRaf = requestAnimationFrame(syncLoop);

    return () => {
      cancelAnimationFrame(bumpRaf);
      cancelAnimationFrame(loopRaf);
      primitive.setListener(null);
      ts.unsubscribeVisibleLogicalRangeChange(keepSyncing);
      ts.unsubscribeVisibleTimeRangeChange(keepSyncing);
      ts.unsubscribeSizeChange(keepSyncing);
      chart.unsubscribeCrosshairMove(keepSyncing);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [chartRef, enabled, primitiveRef]);

  return version;
}
