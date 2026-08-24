"use client";

import { useState } from "react";
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
  accountLabel = "Paper",
  disabled,
}: TradeLeverageSliderProps) {
  const [open, setOpen] = useState(false);
  const max = Math.max(1, Math.round(maxLeverage));
  const pct = max <= 1 ? 100 : ((leverage - 1) / (max - 1)) * 100;

  return (
    <div className="flex flex-col gap-2" data-trade-region="leverage">
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCrossChange(!isCross)}
          className={cn(CHIP, "border-[#50d2c1]/70 text-[#eee]")}
        >
          {isCross ? "Cross" : "Isolated"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={cn(CHIP, open && "border-[#50d2c1] text-[#50d2c1]")}
        >
          {leverage}x
        </button>
        <button type="button" disabled className={cn(CHIP, "opacity-80")}>
          {accountLabel}
        </button>
      </div>

      {open ? (
        <div className="rounded-md border border-[#1e2329] bg-[#0b0e11] px-2 py-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-[#8a9199]">
            <span>Leverage</span>
            <span className="tabular-nums text-[#50d2c1]">{leverage}x / {max}x</span>
          </div>
          <div className="relative h-6">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#2b3139]" />
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#50d2c1]"
              style={{ width: `${pct}%` }}
            />
            <input
              type="range"
              min={1}
              max={max}
              step={1}
              value={Math.min(leverage, max)}
              disabled={disabled}
              onChange={(e) => onLeverageChange(Number.parseInt(e.target.value, 10))}
              className={cn(
                "absolute inset-0 w-full cursor-pointer appearance-none bg-transparent",
                "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5",
                "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#50d2c1]",
                "[&::-webkit-slider-thumb]:bg-[#0b0e11]",
                "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5",
                "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
                "[&::-moz-range-thumb]:border-[#50d2c1] [&::-moz-range-thumb]:bg-[#0b0e11]",
              )}
              aria-label="Leverage"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-[#5d656f]">
            <span>1x</span>
            <span>Max {max}x</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button
              type="button"
              className={cn(
                "rounded-md py-1 text-[11px]",
                isCross ? "bg-[#50d2c1] text-[#0b0e11]" : "text-[#8a9199] hover:text-[#eee]",
              )}
              onClick={() => onCrossChange(true)}
            >
              Cross
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md py-1 text-[11px]",
                !isCross ? "bg-[#50d2c1] text-[#0b0e11]" : "text-[#8a9199] hover:text-[#eee]",
              )}
              onClick={() => onCrossChange(false)}
            >
              Isolated
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
