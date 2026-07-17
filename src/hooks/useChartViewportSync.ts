"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { DrawingViewportPrimitive } from "@/lib/charting/drawingViewportPrimitive";

/**
 * Repaint SVG interaction overlays when the chart viewport moves. The canvas
 * primitive handles its own kinetic sync; this hook only updates React layers
 * (hit targets, live edit, draft preview) when they are mounted.
 */
export function useChartViewportSync(
  primitiveRef: RefObject<DrawingViewportPrimitive | null>,
  enabled: boolean,
  onFrame: () => void,
): void {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) return;

    const primitive = primitiveRef.current;
    if (!primitive) return;

    let bumpRaf = 0;
    let queued = false;

    const scheduleFrame = () => {
      if (queued) return;
      queued = true;
      bumpRaf = requestAnimationFrame(() => {
        queued = false;
        onFrameRef.current();
      });
    };

    const unsubPrimitive = primitive.subscribe(scheduleFrame);

    return () => {
      cancelAnimationFrame(bumpRaf);
      unsubPrimitive();
    };
  }, [enabled, primitiveRef]);
}
