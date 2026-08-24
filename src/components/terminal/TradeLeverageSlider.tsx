"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";

type TradeLeverageSliderProps = {
  leverage: number;
  maxLeverage: number;
  onLeverageChange: (lev: number) => void;
  isCross: boolean;
  onCrossChange: (isCross: boolean) => void;
  disabled?: boolean;
};

export function TradeLeverageSlider({
  leverage,
  maxLeverage,
  onLeverageChange,
  isCross,
  onCrossChange,
  disabled,
}: TradeLeverageSliderProps) {
  const max = Math.max(1, Math.round(maxLeverage));
  const pct = max <= 1 ? 100 : ((leverage - 1) / (max - 1)) * 100;

  return (
    <div className="flex flex-col gap-1" data-trade-region="leverage">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-px bg-slate-900">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onCrossChange(true)}
            className={cn(
              TERMINAL_TYPO.micro,
              "bg-slate-950 px-2 py-0.5 uppercase",
              isCross ? "text-cyan-300" : "text-slate-600 hover:text-slate-400",
            )}
          >
            Cross
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onCrossChange(false)}
            className={cn(
              TERMINAL_TYPO.micro,
              "bg-slate-950 px-2 py-0.5 uppercase",
              !isCross ? "text-cyan-300" : "text-slate-600 hover:text-slate-400",
            )}
          >
            Isolated
          </button>
        </div>
        <span className={cn(TERMINAL_TYPO.dataLg, "tabular-nums text-[#26a69a]")}>{leverage}x</span>
      </div>

      <div className="relative px-0.5 pt-1">
        <div
          className="pointer-events-none absolute left-0.5 right-0.5 top-[calc(50%+2px)] h-1 -translate-y-1/2 overflow-hidden rounded-full bg-[#2a2e39]"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-[#26a69a] transition-[width] duration-75"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={max}
          step={1}
          value={Math.min(leverage, max)}
          disabled={disabled}
          onChange={(e) => onLeverageChange(Number.parseInt(e.target.value, 10))}
          className={cn(
            "relative z-10 w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#26a69a]",
            "[&::-webkit-slider-thumb]:bg-[#0b0e11]",
            "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-[#26a69a] [&::-moz-range-thumb]:bg-[#0b0e11]",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Leverage"
        />
      </div>

      <div className="flex justify-between">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>1x</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Max {max}x</span>
      </div>
    </div>
  );
}
