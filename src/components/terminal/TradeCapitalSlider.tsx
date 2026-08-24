"use client";

import { cn, formatPrice, formatSize } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";

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
  markPx: number | null;
  symbol: string;
  szDecimals: number;
  disabled?: boolean;
  /** e.g. "margin" or "balance" */
  capLabel?: string;
  /** USD locked as initial margin for this order */
  marginUsd?: number | null;
  availableUsd?: number | null;
};

export function TradeCapitalSlider({
  pct,
  onPctChange,
  maxSize,
  markPx,
  symbol,
  szDecimals,
  disabled,
  capLabel = "available",
  marginUsd,
  availableUsd,
}: TradeCapitalSliderProps) {
  const sizeNum = maxSize > 0 ? maxSize * (pct / 100) : 0;
  const notional = markPx && sizeNum > 0 ? sizeNum * markPx : null;

  return (
    <div className="flex flex-col gap-1.5" data-trade-region="capital-slider">
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          Size · {pct}% of {capLabel}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>
          {sizeNum > 0 ? formatSize(sizeNum) : "—"} {symbol}
        </span>
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
          min={0}
          max={100}
          step={1}
          value={pct}
          disabled={disabled || maxSize <= 0}
          onChange={(e) => onPctChange(Number.parseInt(e.target.value, 10))}
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
          aria-label="Trade size as percent of available capital"
        />
      </div>

      <div className="flex justify-between gap-1">
        {MARKS.map((mark) => (
          <button
            key={mark}
            type="button"
            disabled={disabled || maxSize <= 0}
            onClick={() => onPctChange(mark)}
            className={cn(
              TERMINAL_TYPO.micro,
              "min-w-[2rem] tabular-nums transition-colors",
              pct === mark ? "text-[#26a69a]" : "text-slate-600 hover:text-slate-400",
              "disabled:opacity-40",
            )}
          >
            {mark}%
          </button>
        ))}
      </div>

      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
        Max {maxSize > 0 ? formatSize(maxSize) : "—"} {symbol}
        {notional != null ? (
          <>
            {" "}
            · ≈{" "}
            <span className={terminalSkin.textUp}>
              ${notional.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </>
        ) : null}
        {markPx != null ? <> · Mark {formatPrice(markPx)}</> : null}
        {marginUsd != null && marginUsd > 0 ? (
          <>
            {" "}
            · Margin ${marginUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            {availableUsd != null
              ? ` / $${Math.max(0, availableUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} free`
              : null}
          </>
        ) : null}
      </p>
    </div>
  );
}
