"use client";

import { cn } from "@/lib/utils";

const MARKS = [0, 25, 50, 75, 100] as const;
export const HL_TEAL = "#50d2c1";

const RANGE =
  "h-8 w-full cursor-pointer appearance-none bg-transparent " +
  "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full " +
  "[&::-webkit-slider-runnable-track]:bg-[#2b3139] " +
  "[&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#50d2c1] " +
  "[&::-webkit-slider-thumb]:bg-[#0b0e11] " +
  "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#2b3139] " +
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#50d2c1] [&::-moz-range-thumb]:bg-[#0b0e11]";

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
    <div className="flex flex-col gap-1" data-trade-region="capital-slider">
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        disabled={blocked}
        onChange={(e) => onPctChange(Number.parseInt(e.target.value, 10))}
        className={cn(RANGE, "disabled:cursor-not-allowed disabled:opacity-40")}
        aria-label="Trade size as percent of available capital"
      />
      <div className="flex items-center justify-between px-0.5">
        {MARKS.map((mark) => (
          <button
            key={mark}
            type="button"
            disabled={blocked}
            onClick={() => onPctChange(mark)}
            className={cn(
              "text-[11px] tabular-nums",
              pct >= mark ? "text-[#50d2c1]" : "text-[#5d656f]",
              "disabled:opacity-40",
            )}
          >
            {mark}%
          </button>
        ))}
      </div>
    </div>
  );
}
