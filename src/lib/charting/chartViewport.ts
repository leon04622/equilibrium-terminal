import type { IChartApi, Logical } from "lightweight-charts";

/** Bars of empty future space to the right of the last candle (TradingView / Hyperliquid style). */
export const CHART_RIGHT_OFFSET = 12;

/** Default number of historical bars to show. */
export const CHART_VISIBLE_BARS = 120;

/**
 * Position recent price action on the right with scaled bar spacing so candles fill
 * the pane instead of leaving a huge dead zone on wide monitors.
 */
export function applyTradingChartViewport(
  chart: IChartApi,
  barCount: number,
  width: number,
): void {
  if (barCount <= 0 || width <= 0) return;

  const ts = chart.timeScale();
  const rightOffset = CHART_RIGHT_OFFSET;
  const lastIdx = barCount - 1;
  const visibleBars = Math.min(barCount, CHART_VISIBLE_BARS);
  const from = Math.max(0, lastIdx - visibleBars + 1);
  const to = lastIdx + rightOffset;
  const logicalSpan = Math.max(1, to - from);

  const minSpacing = ts.options().minBarSpacing ?? 2;
  const maxSpacing = 22;
  const spacing = Math.min(maxSpacing, Math.max(minSpacing, (width * 0.92) / logicalSpan));

  ts.applyOptions({ barSpacing: spacing, rightOffset });
  ts.setVisibleLogicalRange({
    from: from as Logical,
    to: to as Logical,
  });
}
