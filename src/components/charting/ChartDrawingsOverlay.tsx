"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { extendLineThroughBox } from "@/lib/charting/chartDrawing";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { ChartTrendLine } from "@/types/chart-tools";

function toCoord(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  time: number,
  price: number,
): { x: number; y: number } | null {
  const x = chart.timeScale().timeToCoordinate(time as UTCTimestamp);
  const y = series.priceToCoordinate(price);
  if (x == null || y == null) return null;
  return { x, y };
}

function TrendSvg({
  line,
  chart,
  series,
  width,
  height,
}: {
  line: ChartTrendLine;
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  width: number;
  height: number;
}) {
  const p1 = toCoord(chart, series, line.time1, line.price1);
  const p2 = toCoord(chart, series, line.time2, line.price2);
  if (!p1 || !p2) return null;

  const [a, b] = extendLineThroughBox(p1, p2, width, height);
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={line.color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  );
}

export function ChartDrawingsOverlay({
  coin,
  chartRef,
  seriesRef,
  containerRef,
  draftPoint,
}: {
  coin: string;
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<"Candlestick"> | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  draftPoint: { time: number; price: number } | null;
}) {
  const trendLines = useChartToolsStore((s) => s.trendLinesByCoin[coin] ?? []);
  const hideDrawings = useChartToolsStore((s) => s.drawingPrefs.hideDrawings);
  const drawTool = useChartToolsStore((s) => s.drawTool);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [, bump] = useState(0);

  const redraw = useCallback(() => bump((n) => n + 1), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
      redraw();
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, [containerRef, redraw]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const onRange = () => redraw();
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
  }, [chartRef, redraw]);

  useEffect(() => {
    redraw();
  }, [trendLines, hideDrawings, draftPoint, drawTool, redraw]);

  if (hideDrawings || size.width === 0) return null;

  const chart = chartRef.current;
  const series = seriesRef.current;
  if (!chart || !series) return null;

  let draftLine: React.ReactNode = null;
  if (draftPoint && drawTool === "trendline") {
    const p1 = toCoord(chart, series, draftPoint.time, draftPoint.price);
    if (p1) {
      draftLine = (
        <circle cx={p1.x} cy={p1.y} r={3} fill="#5b9cf6" stroke="#131722" strokeWidth={1} />
      );
    }
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[8]"
      width={size.width}
      height={size.height}
      aria-hidden
    >
      {trendLines.map((line) => (
        <TrendSvg
          key={line.id}
          line={line}
          chart={chart}
          series={series}
          width={size.width}
          height={size.height}
        />
      ))}
      {draftLine}
    </svg>
  );
}
