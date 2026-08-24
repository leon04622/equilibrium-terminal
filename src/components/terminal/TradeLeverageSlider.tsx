"use client";

import { cn } from "@/lib/utils";

const CHIP =
  "h-8 min-w-0 flex-1 rounded-md border border-[#1e2329] bg-[#13161c] px-2 text-[12px] font-medium text-[#eee] hover:border-[#50d2c1]/40";

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

  return (
    <div className="flex flex-col gap-2" data-trade-region="leverage">
      <div className={cn("grid gap-1.5", accountLabel ? "grid-cols-3" : "grid-cols-2")}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCrossChange(true)}
          className={cn(CHIP, isCross && "border-[#50d2c1] text-[#50d2c1]")}
        >
          Cross
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCrossChange(false)}
          className={cn(CHIP, !isCross && "border-[#50d2c1] text-[#50d2c1]")}
        >
          Isolated
        </button>
        {accountLabel ? (
          <div className={cn(CHIP, "flex items-center justify-center text-[#8a9199]")}>
            {accountLabel}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#8a9199]">Leverage</span>
        <span className="tabular-nums font-semibold text-[#50d2c1]">{leverage}x</span>
      </div>
      <div className="relative h-8">
        <input
          type="range"
          min={1}
          max={max}
          step={1}
          value={Math.min(leverage, max)}
          disabled={disabled}
          onChange={(e) => onLeverageChange(Number.parseInt(e.target.value, 10))}
          className={cn(
            "h-8 w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
            "[&::-webkit-slider-runnable-track]:bg-[#2b3139]",
            "[&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#50d2c1]",
            "[&::-webkit-slider-thumb]:bg-[#0b0e11]",
            "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#2b3139]",
            "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-[#50d2c1] [&::-moz-range-thumb]:bg-[#0b0e11]",
          )}
          aria-label="Leverage"
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#5d656f]">
        <span>1x</span>
        <span>Max {max}x</span>
      </div>
    </div>
  );
}
