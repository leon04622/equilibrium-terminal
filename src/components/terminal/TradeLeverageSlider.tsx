"use client";

import { cn } from "@/lib/utils";

const FILL = "#ffaa00";
const TRACK = "#1e293b";

const CHIP =
  "h-8 min-w-0 flex-1 border-[0.5px] border-slate-800 bg-slate-950 px-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-300 hover:border-slate-600";

const RANGE =
  "h-10 w-full cursor-pointer appearance-none rounded-sm " +
  "[&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-sm " +
  "[&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm " +
  "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-amber-200 " +
  "[&::-webkit-slider-thumb]:bg-[#ffaa00] " +
  "[&::-webkit-slider-thumb]:shadow-[0_0_10px_rgb(255_170_0/0.65)] " +
  "[&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-sm [&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-sm " +
  "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-amber-200 " +
  "[&::-moz-range-thumb]:bg-[#ffaa00]";

type TradeLeverageSliderProps = {
  leverage: number;
  maxLeverage: number;
  onLeverageChange: (lev: number) => void;
  isCross: boolean;
  onCrossChange: (isCross: boolean) => void;
  accountLabel?: string;
  disabled?: boolean;
};

export function TradeLeverageSlider({
  leverage,
  maxLeverage,
  onLeverageChange,
  isCross,
  onCrossChange,
  accountLabel,
  disabled,
}: TradeLeverageSliderProps) {
  const max = Math.max(1, Math.round(maxLeverage));
  const pct = max <= 1 ? 100 : ((Math.min(leverage, max) - 1) / (max - 1)) * 100;

  return (
    <div className="flex flex-col gap-2" data-trade-region="leverage">
      <div className={cn("grid gap-1", accountLabel ? "grid-cols-3" : "grid-cols-2")}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCrossChange(true)}
          className={cn(CHIP, isCross && "border-[#00e5ff]/70 text-[#00e5ff]")}
        >
          Cross
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCrossChange(false)}
          className={cn(CHIP, !isCross && "border-[#00e5ff]/70 text-[#00e5ff]")}
        >
          Isolated
        </button>
        {accountLabel ? (
          <div className={cn(CHIP, "flex items-center justify-center text-slate-500")}>
            {accountLabel}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wide">
        <span className="text-slate-500">Leverage</span>
        <span className="tabular-nums font-semibold text-[#ffaa00]">{leverage}x</span>
      </div>
      <input
        type="range"
        min={1}
        max={max}
        step={1}
        value={Math.min(leverage, max)}
        disabled={disabled}
        onChange={(e) => onLeverageChange(Number.parseInt(e.target.value, 10))}
        style={{ background: `linear-gradient(to right, ${FILL} ${pct}%, ${TRACK} ${pct}%)` }}
        className={cn(RANGE, "disabled:cursor-not-allowed disabled:opacity-40")}
        aria-label="Leverage"
      />
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-wide text-slate-600">
        <span>1x</span>
        <span>Max {max}x</span>
      </div>
    </div>
  );
}
