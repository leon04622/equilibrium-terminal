"use client";

import { cn } from "@/lib/utils";

const MARKS = [0, 25, 50, 75, 100] as const;
const FILL = "#00e5ff";
const TRACK = "#1e293b";

const RANGE =
  "h-10 w-full cursor-pointer appearance-none rounded-sm " +
  "[&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-sm " +
  "[&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm " +
  "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-cyan-200 " +
  "[&::-webkit-slider-thumb]:bg-[#00e5ff] " +
  "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgb(0_229_255/0.65)] " +
  "[&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-sm [&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-sm " +
  "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-cyan-200 " +
  "[&::-moz-range-thumb]:bg-[#00e5ff]";

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
        style={{ background: `linear-gradient(to right, ${FILL} ${pct}%, ${TRACK} ${pct}%)` }}
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
              "font-mono text-[10px] uppercase tabular-nums",
              pct >= mark ? "text-[#00e5ff]" : "text-slate-600",
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
