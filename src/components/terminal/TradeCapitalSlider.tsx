"use client";

import { cn } from "@/lib/utils";

const MARKS = [0, 25, 50, 75, 100] as const;
export const HL_TEAL = "#50d2c1";

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

  return (
    <div className="flex items-center gap-3 px-0.5" data-trade-region="capital-slider">
      <div className="relative h-6 min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#2b3139]" />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#50d2c1]"
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
              "absolute top-1/2 z-[1] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#50d2c1]",
              pct >= mark ? "bg-[#50d2c1]" : "bg-[#0b0e11]",
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
          className={cn(
            "absolute inset-0 z-[2] w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#50d2c1]",
            "[&::-webkit-slider-thumb]:bg-[#0b0e11]",
            "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-[#50d2c1] [&::-moz-range-thumb]:bg-[#0b0e11]",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Trade size as percent of available capital"
        />
      </div>
      <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-[#8a9199]">
        {pct} %
      </span>
    </div>
  );
}
