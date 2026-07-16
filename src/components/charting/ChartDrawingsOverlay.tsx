"use client";

import { useCallback, useEffect, useState, type ReactNode, type RefObject } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import {
  extendLineThroughBox,
  type ChartPoint,
} from "@/lib/charting/chartDrawing";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { ChartHorizontalLine, ChartTrendLine } from "@/types/chart-tools";

const EMPTY_TREND_LINES: ChartTrendLine[] = [];
const EMPTY_HLINES: ChartHorizontalLine[] = [];
const PREVIEW_COLOR = "#5b9cf6";
const SELECTED_COLOR = "#5b9cf6";
const LINE_COLOR = "#787b86";
const HIT_STROKE_PX = 14;

export interface DrawingLiveEdit {
  trendLine?: ChartTrendLine;
  hline?: { id: string; price: number };
}

export type DrawingEditStart =
  | { kind: "trend-endpoint"; lineId: string; endpoint: 1 | 2; snapshot: ChartTrendLine }
  | { kind: "trend-body"; lineId: string; snapshot: ChartTrendLine }
  | { kind: "hline"; lineId: string; snapshot: ChartHorizontalLine };

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

function EndpointHandle({
  x,
  y,
  selected,
  interactive,
  onPointerDown,
}: {
  x: number;
  y: number;
  selected?: boolean;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <g
      className={interactive ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={onPointerDown}
    >
      {interactive ? (
        <circle cx={x} cy={y} r={HIT_STROKE_PX} fill="transparent" />
      ) : null}
      <circle
        cx={x}
        cy={y}
        r={selected ? 5 : 4}
        fill="#131722"
        stroke={selected ? SELECTED_COLOR : LINE_COLOR}
        strokeWidth={selected ? 2 : 1.5}
        className="pointer-events-none"
      />
    </g>
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
  interactive,
  onBodyPointerDown,
}: {
  p1: ChartPoint;
  p2: ChartPoint;
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  width: number;
  height: number;
  color: string;
  dashed?: boolean;
  interactive?: boolean;
  onBodyPointerDown?: (e: React.PointerEvent) => void;
}) {
  const c1 = toCoord(chart, series, p1.time, p1.price);
  const c2 = toCoord(chart, series, p2.time, p2.price);
  if (!c1 || !c2) return null;

  const [a, b] = extendLineThroughBox(c1, c2, width, height);
  return (
    <g>
      {interactive ? (
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="transparent"
          strokeWidth={HIT_STROKE_PX}
          className="pointer-events-auto cursor-grab"
          onPointerDown={onBodyPointerDown}
        />
      ) : null}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={color}
        strokeWidth={color === SELECTED_COLOR ? 2 : 1.5}
        strokeLinecap="round"
        strokeDasharray={dashed ? "5 4" : undefined}
        className="pointer-events-none"
      />
    </g>
  );
}

function TrendSvg({
  line,
  chart,
  series,
  width,
  height,
  selected,
  editable,
  onEndpointDown,
  onBodyDown,
}: {
  line: ChartTrendLine;
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  width: number;
  height: number;
  selected?: boolean;
  editable?: boolean;
  onEndpointDown?: (lineId: string, endpoint: 1 | 2, e: React.PointerEvent) => void;
  onBodyDown?: (lineId: string, e: React.PointerEvent) => void;
}) {
  const c1 = toCoord(chart, series, line.time1, line.price1);
  const c2 = toCoord(chart, series, line.time2, line.price2);
  if (!c1 || !c2) return null;

  const color = selected ? SELECTED_COLOR : line.color;
  const interactive = editable;

  return (
    <g>
      <ExtendedTrendLine
        p1={{ time: line.time1, price: line.price1 }}
        p2={{ time: line.time2, price: line.price2 }}
        chart={chart}
        series={series}
        width={width}
        height={height}
        color={color}
        interactive={interactive}
        onBodyPointerDown={
          onBodyDown
            ? (e) => {
                e.stopPropagation();
                onBodyDown(line.id, e);
              }
            : undefined
        }
      />
      <EndpointHandle
        x={c1.x}
        y={c1.y}
        selected={selected}
        interactive={editable}
        onPointerDown={
          onEndpointDown
            ? (e) => {
                e.stopPropagation();
                onEndpointDown(line.id, 1, e);
              }
            : undefined
        }
      />
      <EndpointHandle
        x={c2.x}
        y={c2.y}
        selected={selected}
        interactive={editable}
        onPointerDown={
          onEndpointDown
            ? (e) => {
                e.stopPropagation();
                onEndpointDown(line.id, 2, e);
              }
            : undefined
        }
      />
    </g>
  );
}

function HorizontalSvg({
  line,
  series,
  width,
  selected,
  editable,
  onDragDown,
}: {
  line: ChartHorizontalLine;
  series: ISeriesApi<"Candlestick">;
  width: number;
  selected?: boolean;
  editable?: boolean;
  onDragDown?: (lineId: string, e: React.PointerEvent) => void;
}) {
  const y = series.priceToCoordinate(line.price);
  if (y == null) return null;
  const color = selected ? SELECTED_COLOR : line.color;

  return (
    <g
      className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={
        editable && onDragDown
          ? (e) => {
              e.stopPropagation();
              onDragDown(line.id, e);
            }
          : undefined
      }
    >
      <line
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="transparent"
        strokeWidth={HIT_STROKE_PX}
      />
      <line
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={color}
        strokeWidth={selected ? 2 : 1.5}
        className="pointer-events-none"
      />
      <circle
        cx={width * 0.5}
        cy={y}
        r={selected ? 5 : 4}
        fill="#131722"
        stroke={color}
        strokeWidth={selected ? 2 : 1.5}
        className="pointer-events-none"
      />
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
  liveEdit,
  selectedDrawingId,
  editable,
  onEditStart,
}: {
  coin: string;
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<"Candlestick"> | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  draftStart: ChartPoint | null;
  draftEnd: ChartPoint | null;
  previewTool: "trendline" | "hline" | null;
  liveEdit: DrawingLiveEdit | null;
  selectedDrawingId: string | null;
  editable: boolean;
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void;
}) {
  const trendLines = useChartToolsStore((s) => s.trendLinesByCoin[coin] ?? EMPTY_TREND_LINES);
  const hlines = useChartToolsStore((s) => s.linesByCoin[coin] ?? EMPTY_HLINES);
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

  const resolvedTrendLines = trendLines.map((line) =>
    liveEdit?.trendLine?.id === line.id ? liveEdit.trendLine : line,
  );
  const resolvedHlines = hlines.map((line) =>
    liveEdit?.hline?.id === line.id ? { ...line, price: liveEdit.hline.price } : line,
  );

  const trendById = new Map(resolvedTrendLines.map((l) => [l.id, l]));
  const hlineById = new Map(resolvedHlines.map((l) => [l.id, l]));

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
            className="pointer-events-none"
          />
        );
      }
    }
    const c1 = toCoord(chart, series, draftStart.time, draftStart.price);
    const c2 = toCoord(chart, series, draftEnd.time, draftEnd.price);
    if (c1 || c2) {
      preview = (
        <g className="pointer-events-none">
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
      className="absolute inset-0 z-[8] pointer-events-none"
      width={size.width}
      height={size.height}
      aria-hidden
    >
      {resolvedHlines.map((line) => (
        <HorizontalSvg
          key={line.id}
          line={line}
          series={series}
          width={size.width}
          selected={selectedDrawingId === line.id}
          editable={editable}
          onDragDown={(lineId, e) => {
            const snap = hlineById.get(lineId);
            if (!snap) return;
            onEditStart({ kind: "hline", lineId, snapshot: snap }, e);
          }}
        />
      ))}
      {resolvedTrendLines.map((line) => (
        <TrendSvg
          key={line.id}
          line={line}
          chart={chart}
          series={series}
          width={size.width}
          height={size.height}
          selected={selectedDrawingId === line.id}
          editable={editable}
          onEndpointDown={(lineId, endpoint, e) => {
            const snap = trendById.get(lineId);
            if (!snap) return;
            onEditStart({ kind: "trend-endpoint", lineId, endpoint, snapshot: snap }, e);
          }}
          onBodyDown={(lineId, e) => {
            const snap = trendById.get(lineId);
            if (!snap) return;
            onEditStart({ kind: "trend-body", lineId, snapshot: snap }, e);
          }}
        />
      ))}
      {preview}
    </svg>
  );
}
