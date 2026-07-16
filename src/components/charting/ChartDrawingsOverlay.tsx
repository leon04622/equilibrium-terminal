"use client";

import { useCallback, useEffect, useState, type ReactNode, type RefObject } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { extendLineThroughBox, type ChartPoint } from "@/lib/charting/chartDrawing";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { ChartTrendLine } from "@/types/chart-tools";

const EMPTY_TREND_LINES: ChartTrendLine[] = [];
const PREVIEW_COLOR = "#5b9cf6";
const LINE_COLOR = "#787b86";

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

function EndpointHandle({ x, y }: { x: number; y: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={4}
      fill="#131722"
      stroke={LINE_COLOR}
      strokeWidth={1.5}
    />
  );
}

function ExtendedTrendLine({
  p1,
  p2,
  chart,
  series,
  width,
  height,
  color,
  dashed,
}: {
  p1: ChartPoint;
  p2: ChartPoint;
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  width: number;
  height: number;
  color: string;
  dashed?: boolean;
}) {
  const c1 = toCoord(chart, series, p1.time, p1.price);
  const c2 = toCoord(chart, series, p2.time, p2.price);
  if (!c1 || !c2) return null;

  const [a, b] = extendLineThroughBox(c1, c2, width, height);
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeDasharray={dashed ? "5 4" : undefined}
    />
  );
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
  const c1 = toCoord(chart, series, line.time1, line.price1);
  const c2 = toCoord(chart, series, line.time2, line.price2);
  if (!c1 || !c2) return null;

  return (
    <g>
      <ExtendedTrendLine
        p1={{ time: line.time1, price: line.price1 }}
        p2={{ time: line.time2, price: line.price2 }}
        chart={chart}
        series={series}
        width={width}
        height={height}
        color={line.color}
      />
      <EndpointHandle x={c1.x} y={c1.y} />
      <EndpointHandle x={c2.x} y={c2.y} />
    </g>
  );
}

export function ChartDrawingsOverlay({
  coin,
  chartRef,
  seriesRef,
  containerRef,
  draftStart,
  draftEnd,
  previewTool,
}: {
  coin: string;
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<"Candlestick"> | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  draftStart: ChartPoint | null;
  draftEnd: ChartPoint | null;
  previewTool: "trendline" | "hline" | null;
}) {
  const trendLines = useChartToolsStore((s) => s.trendLinesByCoin[coin] ?? EMPTY_TREND_LINES);
  const hideDrawings = useChartToolsStore((s) => s.drawingPrefs.hideDrawings);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [chartTick, setChartTick] = useState(0);

  const requestRedraw = useCallback(() => setChartTick((n) => n + 1), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const applySize = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    };
    const ro = new ResizeObserver(applySize);
    ro.observe(el);
    applySize();
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const onRange = () => requestRedraw();
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
  }, [chartRef, requestRedraw]);

  if (hideDrawings || size.width === 0) return null;

  const chart = chartRef.current;
  const series = seriesRef.current;
  if (!chart || !series) return null;

  let preview: ReactNode = null;
  if (draftStart && draftEnd && previewTool) {
    if (previewTool === "trendline") {
      preview = (
        <ExtendedTrendLine
          p1={draftStart}
          p2={draftEnd}
          chart={chart}
          series={series}
          width={size.width}
          height={size.height}
          color={PREVIEW_COLOR}
          dashed
        />
      );
    } else if (previewTool === "hline") {
      const y = series.priceToCoordinate(draftEnd.price);
      if (y != null) {
        preview = (
          <line
            x1={0}
            y1={y}
            x2={size.width}
            y2={y}
            stroke={PREVIEW_COLOR}
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
        );
      }
    }
    const c1 = toCoord(chart, series, draftStart.time, draftStart.price);
    const c2 = toCoord(chart, series, draftEnd.time, draftEnd.price);
    if (c1 || c2) {
      preview = (
        <g>
          {preview}
          {c1 ? (
            <circle cx={c1.x} cy={c1.y} r={4} fill={PREVIEW_COLOR} stroke="#131722" strokeWidth={1.5} />
          ) : null}
          {c2 && previewTool === "trendline" ? (
            <circle cx={c2.x} cy={c2.y} r={4} fill={PREVIEW_COLOR} stroke="#131722" strokeWidth={1.5} />
          ) : null}
        </g>
      );
    }
  }

  return (
    <svg
      key={chartTick}
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
      {preview}
    </svg>
  );
}
