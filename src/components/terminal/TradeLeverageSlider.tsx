"use client";

import { TradeSwipeBar } from "@/components/terminal/TradeSwipeBar";
import { cn } from "@/lib/utils";

const CHIP =
  "h-8 min-w-0 flex-1 border-[0.5px] border-slate-800 bg-slate-950 px-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-300 hover:border-slate-600";

function leverageFromMark(markPct: number, max: number): number {
  if (max <= 1) return 1;
  return Math.max(1, Math.round(1 + (markPct / 100) * (max - 1)));
}

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
  const value = Math.min(leverage, max);
  const fillPct = max <= 1 ? 100 : ((value - 1) / (max - 1)) * 100;

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

      <TradeSwipeBar
        fillPct={fillPct}
        min={1}
        max={max}
        value={value}
        onChange={onLeverageChange}
        onMark={(markPct) => onLeverageChange(leverageFromMark(markPct, max))}
        box={`${value}x`}
        disabled={disabled}
        ariaLabel="Leverage"
      />
    </div>
  );
}
