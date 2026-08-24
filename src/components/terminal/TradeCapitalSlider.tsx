"use client";

import { TradeSwipeBar } from "@/components/terminal/TradeSwipeBar";

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
  return (
    <div data-trade-region="capital-slider">
      <TradeSwipeBar
        fillPct={pct}
        min={0}
        max={100}
        value={pct}
        onChange={onPctChange}
        onMark={onPctChange}
        box={`${pct} %`}
        disabled={disabled || maxSize <= 0}
        ariaLabel="Trade size as percent of available capital"
      />
    </div>
  );
}
