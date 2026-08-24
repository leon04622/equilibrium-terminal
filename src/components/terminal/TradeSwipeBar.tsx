"use client";

import { cn } from "@/lib/utils";

const MARKS = [0, 25, 50, 75, 100] as const;

type TradeSwipeBarProps = {
  fillPct: number;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  onMark: (markPct: number) => void;
  box: string;
  disabled?: boolean;
  ariaLabel: string;
};

export function TradeSwipeBar({
  fillPct,
  min,
  max,
  step = 1,
  value,
  onChange,
  onMark,
  box,
  disabled,
  ariaLabel,
}: TradeSwipeBarProps) {
  const fill = Math.min(100, Math.max(0, fillPct));

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-slate-800" />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#00e5ff] shadow-[0_0_10px_rgb(0_229_255/0.7)]"
          style={{ width: `${fill}%` }}
        />
        {MARKS.map((mark) => (
          <button
            key={mark}
            type="button"
            disabled={disabled}
            aria-label={`${mark} percent`}
            onClick={() => onMark(mark)}
            className={cn(
              "absolute top-1/2 z-[1] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00e5ff]",
              fill >= mark ? "bg-[#00e5ff]" : "bg-slate-950",
              "disabled:opacity-40",
            )}
            style={{ left: `${mark}%` }}
          />
        ))}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
          className={cn(
            "absolute inset-0 z-[2] w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-[#00e5ff] [&::-webkit-slider-thumb]:bg-slate-950",
            "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgb(0_229_255/0.85)]",
            "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#00e5ff]",
            "[&::-moz-range-thumb]:bg-slate-950",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label={ariaLabel}
        />
      </div>
      <div className="flex h-10 w-[52px] shrink-0 items-center justify-center border-[0.5px] border-[#00e5ff] bg-slate-950 font-mono text-[12px] tabular-nums text-[#00e5ff] shadow-[0_0_8px_rgb(0_229_255/0.35)]">
        {box}
      </div>
    </div>
  );
}
