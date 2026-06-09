"use client";

import { useCallback, useEffect, useRef } from "react";
import { tacticalOverlayRenderer } from "@/lib/presence";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";

export interface TacticalChartOverlayProps {
  className?: string;
}

/**
 * Canvas overlay for liquidity gradients, liquidation zones, and execution markers.
 * Redraws only when overlay.version changes (data-driven, no decorative CSS motion).
 */
export function TacticalChartOverlay({ className }: TacticalChartOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayVersion = useMarketAtmosphereStore((s) => s.overlay.version);
  const overlay = useMarketAtmosphereStore((s) => s.overlay);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const regime = useMarketAtmosphereStore.getState().regime.regime;
    const stressScore = useMarketAtmosphereStore.getState().stress.score;
    tacticalOverlayRenderer.draw(
      ctx,
      overlay,
      {
        width: w,
        height: h,
        paddingTop: 28,
        paddingBottom: 28,
        paddingLeft: 12,
        paddingRight: 56,
      },
      { regime, stressScore },
    );
  }, [overlay]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => paint());
    ro.observe(container);
    paint();
    return () => ro.disconnect();
  }, [overlayVersion, paint]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 rounded-none" />
    </div>
  );
}
