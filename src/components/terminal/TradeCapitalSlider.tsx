"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const MARKS = [0, 25, 50, 75, 100] as const;

export function sizeFromCapitalPct(
  pct: number,
  maxSize: number,
  szDecimals: number,
): string {
  if (maxSize <= 0 || pct <= 0) return "";
  const sz = maxSize * (pct / 100);
  if (sz <= 0) return "";
  return sz.toFixed(szDecimals);
}

export function capitalPctFromSize(size: number, maxSize: number): number {
  if (maxSize <= 0 || size <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((size / maxSize) * 100)));
}

type TradeCapitalSliderProps = {
  pct: number;
  onPctChange: (pct: number) => void;
  maxSize: number;
  disabled?: boolean;
};

export function TradeCapitalSlider({
  pct,
  onPctChange,
  maxSize,
  disabled,
}: TradeCapitalSliderProps) {
  const blocked = disabled || maxSize <= 0;
  const [hot, setHot] = useState(false);

  return (
    <div className="flex items-center gap-2" data-trade-region="capital-slider">
      <div
        className="relative h-8 min-w-0 flex-1"
        onPointerDown={() => setHot(true)}
        onPointerUp={() => setHot(false)}
        onPointerLeave={() => setHot(false)}
        onPointerCancel={() => setHot(false)}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-slate-800",
            hot ? "h-[4px]" : "h-[2px]",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-[#00e5ff]",
            hot ? "h-[4px] shadow-[0_0_10px_rgb(0_229_255/0.7)]" : "h-[2px]",
          )}
          style={{ width: `${pct}%` }}
        />
        {MARKS.map((mark) => (
          <button
            key={mark}
            type="button"
            disabled={blocked}
            aria-label={`${mark} percent`}
            onClick={() => onPctChange(mark)}
            className={cn(
              "absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00e5ff]",
              hot ? "h-2.5 w-2.5" : "h-2 w-2",
              pct >= mark ? "bg-[#00e5ff]" : "bg-slate-950",
              "disabled:opacity-40",
            )}
            style={{ left: `${mark}%` }}
          />
        ))}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          disabled={blocked}
          onChange={(e) => onPctChange(Number.parseInt(e.target.value, 10))}
          onFocus={() => setHot(true)}
          onBlur={() => setHot(false)}
          className={cn(
            "absolute inset-0 z-[2] w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#00e5ff]",
            "[&::-webkit-slider-thumb]:bg-slate-950",
            hot
              ? "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgb(0_229_255/0.85)]"
              : "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-[#00e5ff] [&::-moz-range-thumb]:bg-slate-950",
            hot
              ? "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5"
              : "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Trade size as percent of available capital"
        />
      </div>
      <div
        className={cn(
          "flex h-10 w-[52px] shrink-0 items-center justify-center",
          "border-[0.5px] bg-slate-950 font-mono text-[12px] tabular-nums",
          hot
            ? "border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_rgb(0_229_255/0.35)]"
            : "border-slate-800 text-slate-200",
        )}
      >
        {pct} %
      </div>
    </div>
  );
}
