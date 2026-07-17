"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColorType,
  createChart,
  LineStyle,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type MouseEventParams,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { ChartDrawingToolbar } from "@/components/charting/ChartDrawingToolbar";
import { ChartDrawingSelectionToolbar } from "@/components/charting/ChartDrawingSelectionToolbar";
import { ChartDrawingsOverlay, type DrawingEditStart } from "@/components/charting/ChartDrawingsOverlay";
import { ChartIndicatorLegend } from "@/components/charting/ChartIndicatorLegend";
import { ChartAnalyticsToolbar } from "@/components/charting/ChartAnalyticsToolbar";
import { ChartIndicatorPane } from "@/components/charting/ChartIndicatorPane";
import { IndicatorsModal } from "@/components/charting/IndicatorsModal";
import { IndicatorSettingsModal } from "@/components/charting/IndicatorSettingsModal";
import { VolumeProfileOverlay } from "@/components/charting/VolumeProfileOverlay";
import { indicatorSettingsFingerprint } from "@/lib/charting/indicatorParams";
import { resolveDrawPoint, type ChartPoint } from "@/lib/charting/chartDrawing";
import {
  createDrawing,
  isActiveDrawCapture,
  isDrawingTool,
  specForTool,
} from "@/lib/charting/drawingEngine";
import { findTopDrawingHit } from "@/lib/charting/drawingRender";
import { isDrawingLocked } from "@/lib/charting/drawingStyle";
import type { ChartLegendValues } from "@/components/terminal/ChartLegend";
import {
  applyOverlayIndicators,
  clearOverlayIndicators,
  paneIndicatorIds,
  volumeProfileActive,
  type OverlaySeriesMap,
} from "@/lib/charting/applyOverlayIndicators";
import { EQ_CHART } from "@/lib/theme/equilibrium-visual";
import { isWorkspaceScrolling, onWorkspaceScrollEnd } from "@/lib/runtime/workspaceScroll";
import { terminalBus } from "@/store/eventBus";
import { useChartHistory } from "@/hooks/useChartHistory";
import { DrawingViewportPrimitive } from "@/lib/charting/drawingViewportPrimitive";
import type { DrawingDraftState } from "@/lib/charting/drawingCanvasPaint";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ChartDrawTool, ChartDrawing, MagnetMode } from "@/types/chart-tools";
import type { NormalizedCandle } from "@/types/terminal-schema";

type DrawingEditSession = DrawingEditStart & { anchor?: ChartPoint };

const SELECT_DRAG_THRESHOLD = 5;

function applyEditToDrawing(
  drawing: ChartDrawing,
  part: "body" | "endpoint",
  endpointIndex: number | undefined,
  anchor: ChartPoint | undefined,
  pt: ChartPoint,
): ChartDrawing {
  if (part === "endpoint" && endpointIndex !== undefined) {
    switch (drawing.kind) {
      case "line":
        return endpointIndex === 0 ? { ...drawing, p1: pt } : { ...drawing, p2: pt };
      case "hline":
        return { ...drawing, price: pt.price };
      case "vline":
        return { ...drawing, time: pt.time };
      case "cross":
        return { ...drawing, time: pt.time, price: pt.price };
      case "channel":
        if (endpointIndex === 0) return { ...drawing, p1: pt };
        if (endpointIndex === 1) return { ...drawing, p2: pt };
        return { ...drawing, p3: pt };
      case "pitchfork":
        if (endpointIndex === 0) return { ...drawing, p1: pt };
        if (endpointIndex === 1) return { ...drawing, p2: pt };
        return { ...drawing, p3: pt };
      case "fib":
      case "gann":
      case "rect":
      case "position":
        return endpointIndex === 0 ? { ...drawing, p1: pt } : { ...drawing, p2: pt };
      case "text":
      case "icon":
        return { ...drawing, point: pt };
      case "pattern": {
        const points = [...drawing.points];
        points[endpointIndex] = pt;
        return { ...drawing, points };
      }
      default:
        return drawing;
    }
  }

  if (part === "body" && anchor) {
    const dTime = pt.time - anchor.time;
    const dPrice = pt.price - anchor.price;
    const shift = (p: ChartPoint): ChartPoint => ({
      time: p.time + dTime,
      price: p.price + dPrice,
    });

    switch (drawing.kind) {
      case "line":
        return { ...drawing, p1: shift(drawing.p1), p2: shift(drawing.p2) };
      case "hline":
        return { ...drawing, price: drawing.price + dPrice };
      case "vline":
        return { ...drawing, time: drawing.time + dTime };
      case "cross":
        return { ...drawing, time: drawing.time + dTime, price: drawing.price + dPrice };
      case "channel":
        return {
          ...drawing,
          p1: shift(drawing.p1),
          p2: shift(drawing.p2),
          p3: shift(drawing.p3),
        };
      case "pitchfork":
        return {
          ...drawing,
          p1: shift(drawing.p1),
          p2: shift(drawing.p2),
          p3: shift(drawing.p3),
        };
      case "fib":
      case "gann":
      case "rect":
      case "position":
        return { ...drawing, p1: shift(drawing.p1), p2: shift(drawing.p2) };
      case "text":
      case "icon":
        return { ...drawing, point: shift(drawing.point) };
      case "pattern":
        return { ...drawing, points: drawing.points.map(shift) };
      default:
        return drawing;
    }
  }

  return drawing;
}

function dragDistance(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  a: ChartPoint,
  b: ChartPoint,
): number {
  const x1 = chart.timeScale().timeToCoordinate(a.time as UTCTimestamp);
  const x2 = chart.timeScale().timeToCoordinate(b.time as UTCTimestamp);
  const y1 = series.priceToCoordinate(a.price);
  const y2 = series.priceToCoordinate(b.price);
  if (x1 == null || x2 == null || y1 == null || y2 == null) return 0;
  return Math.hypot(x2 - x1, y2 - y1);
}

function crosshairTimeToUnix(param: MouseEventParams<Time>): number | null {
  const time = param.time;
  if (time == null) return null;
  if (typeof time === "number") return time;
  if (typeof time === "string") return Math.floor(Date.parse(time) / 1000);
  if ("year" in time) {
    return Math.floor(Date.UTC(time.year, time.month - 1, time.day) / 1000);
  }
  return null;
}

function markerColor(severity: string): string {
  if (severity === "critical") return "hsl(350 95% 58%)";
  if (severity === "watch") return "hsl(45 90% 55%)";
  return "hsl(195 90% 55%)";
}

function resolveCandles(): NormalizedCandle[] {
  return useChartAnalyticsStore.getState().displayCandles;
}

function candleFingerprint(candles: NormalizedCandle[], timeframe: string): string {
  if (!candles.length) return `${timeframe}:0`;
  const last = candles[candles.length - 1]!;
  return `${timeframe}:${candles.length}:${last.time}:${last.close}:${last.volume}`;
}

function isTailOnlyCandleUpdate(prevFp: string, nextFp: string): boolean {
  if (!prevFp || prevFp.endsWith(":0")) return false;
  const prev = prevFp.split(":");
  const next = nextFp.split(":");
  if (prev.length < 4 || next.length < 4) return false;
  if (prev[0] !== next[0]) return false;
  return prev[1] === next[1] && prev[2] === next[2];
}

function candleLegend(data: CandlestickData<Time>, volume?: HistogramData<Time>): ChartLegendValues {
  return {
    open: data.open,
    high: data.high,
    low: data.low,
    close: data.close,
    volume: volume?.value,
  };
}

function legendEqual(a: ChartLegendValues | null, b: ChartLegendValues | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.open === b.open &&
    a.high === b.high &&
    a.low === b.low &&
    a.close === b.close &&
    a.volume === b.volume
  );
}

function clearChartSurface(
  chart: IChartApi | null,
  series: ISeriesApi<"Candlestick"> | null,
  volume: ISeriesApi<"Histogram"> | null,
  indicatorSeries: React.MutableRefObject<OverlaySeriesMap>,
): void {
  series?.setData([]);
  volume?.setData([]);
  series?.setMarkers([]);
  clearOverlayIndicators(chart, indicatorSeries.current);
}

export function ChartWidget() {
  useChartHistory(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const drawCaptureRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const viewportPrimitiveRef = useRef<DrawingViewportPrimitive | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indicatorSeriesRef = useRef<OverlaySeriesMap>(new Map());
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const lastLegendRef = useRef<ChartLegendValues | null>(null);
  const candleFpRef = useRef("");
  const crosshairLegendAtRef = useRef(0);
  const didFitRef = useRef(false);
  const drawToolRef = useRef(useChartToolsStore.getState().drawTool);
  const drawingPrefsRef = useRef(useChartToolsStore.getState().drawingPrefs);
  const drawingSessionRef = useRef<{
    tool: ChartDrawTool;
    points: ChartPoint[];
    pathPoints?: ChartPoint[];
  } | null>(null);
  const editSessionRef = useRef<DrawingEditSession | null>(null);
  const draftRef = useRef<DrawingDraftState | null>(null);
  const liveEditDrawingRef = useRef<ChartDrawing | null>(null);
  const paintSyncRafRef = useRef(0);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const selectedDrawingIdRef = useRef<string | null>(null);
  const [editingDrawing, setEditingDrawing] = useState(false);

  useEffect(() => {
    selectedDrawingIdRef.current = selectedDrawingId;
  }, [selectedDrawingId]);

  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const positionsVersion = useTerminalStore((s) => s.positionsVersion);
  const displayLen = useChartAnalyticsStore((s) => s.displayCandles.length);
  const historyVersion = useChartAnalyticsStore((s) => s.historyVersion);
  const historyLoading = useChartAnalyticsStore((s) => s.historyLoading);
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const eventMarkerCount = useChartAnalyticsStore((s) => s.snapshot?.eventMarkers.length ?? 0);
  const indicators = useChartToolsStore((s) => s.indicators);
  const indicatorSettings = useChartToolsStore((s) => s.indicatorSettings);
  const indicatorDisplay = useChartToolsStore((s) => s.indicatorDisplay);
  const showPositionLines = useChartToolsStore((s) => s.showPositionLines);
  const drawingCount = useChartToolsStore((s) => s.drawingsByCoin[selectedCoin]?.length ?? 0);
  const hideDrawings = useChartToolsStore((s) => s.drawingPrefs.hideDrawings);
  const ticketLimit = useChartToolsStore((s) => s.ticketPreview?.limit);
  const ticketStop = useChartToolsStore((s) => s.ticketPreview?.stop);
  const paperCount = useDeskExecutionStore((s) => s.paperPositions.length);
  const deskMode = useDeskExecutionStore((s) => s.mode);

  const [legend, setLegend] = useState<ChartLegendValues | null>(null);

  const flushPrimitivePaint = useCallback(() => {
    const prim = viewportPrimitiveRef.current;
    if (!prim) return;
    const tools = useChartToolsStore.getState();
    const coin = useTerminalStore.getState().selectedCoin;
    prim.sync({
      drawings: tools.drawingsByCoin[coin] ?? [],
      hidden: tools.drawingPrefs.hideDrawings,
      selectedId: selectedDrawingIdRef.current,
      skipId: liveEditDrawingRef.current?.id ?? null,
      draft: draftRef.current,
      liveEditDrawing: liveEditDrawingRef.current,
    });
  }, []);

  const schedulePrimitivePaint = useCallback(() => {
    if (paintSyncRafRef.current) return;
    paintSyncRafRef.current = requestAnimationFrame(() => {
      paintSyncRafRef.current = 0;
      flushPrimitivePaint();
    });
  }, [flushPrimitivePaint]);

  const clearDrawingDraft = useCallback(() => {
    drawingSessionRef.current = null;
    draftRef.current = null;
    schedulePrimitivePaint();
  }, [schedulePrimitivePaint]);

  const clearEditSession = useCallback(() => {
    editSessionRef.current = null;
    liveEditDrawingRef.current = null;
    setEditingDrawing(false);
    schedulePrimitivePaint();
  }, [schedulePrimitivePaint]);

  useEffect(() => {
    clearDrawingDraft();
    clearEditSession();
    setSelectedDrawingId(null);
  }, [selectedCoin, timeframe, clearDrawingDraft, clearEditSession]);

  useEffect(() => {
    const syncDrawingsToPrimitive = () => flushPrimitivePaint();
    syncDrawingsToPrimitive();
    return useChartToolsStore.subscribe(syncDrawingsToPrimitive);
  }, [flushPrimitivePaint, selectedCoin]);

  useEffect(() => {
    flushPrimitivePaint();
  }, [flushPrimitivePaint, selectedCoin, selectedDrawingId, hideDrawings]);

  const drawTool = useChartToolsStore((s) => s.drawTool);
  const drawSpec = specForTool(drawTool);
  const lockDrawings = useChartToolsStore((s) => s.drawingPrefs.lockDrawings);
  useEffect(() => {
    if (!isDrawingTool(drawTool)) {
      clearDrawingDraft();
    }
  }, [drawTool, clearDrawingDraft]);

  const drawingToolActive =
    isDrawingTool(drawTool) || drawSpec.interaction === "erase" || drawSpec.interaction === "zoom";
  const dragCaptureActive = isActiveDrawCapture(drawTool);
  const canEditDrawings = !hideDrawings && !lockDrawings && !drawingToolActive;
  const blockChartPan = drawingToolActive || editingDrawing;
  const selectedDrawing = useChartToolsStore((s) => {
    if (!selectedDrawingId) return null;
    return s.drawingsByCoin[selectedCoin]?.find((d) => d.id === selectedDrawingId) ?? null;
  });

  const indicatorsKey = useMemo(
    () => indicatorSettingsFingerprint(indicators, indicatorSettings, indicatorDisplay),
    [indicators, indicatorSettings, indicatorDisplay],
  );
  const paneIds = useMemo(() => paneIndicatorIds(indicators), [indicators]);
  const volProfileWanted = useMemo(
    () => volumeProfileActive(indicators, indicatorDisplay),
    [indicators, indicatorDisplay],
  );
  const setOverlayEnabled = useChartAnalyticsStore((s) => s.setOverlayEnabled);

  useEffect(() => {
    return useChartToolsStore.subscribe((s) => {
      drawToolRef.current = s.drawTool;
      drawingPrefsRef.current = s.drawingPrefs;
    });
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.applyOptions({
      handleScroll: { mouseWheel: true, pressedMouseMove: !blockChartPan },
      handleScale: {
        axisPressedMouseMove: !blockChartPan,
        mouseWheel: true,
        pinch: true,
      },
    });
  }, [blockChartPan]);

  const deleteDrawing = useCallback((id: string) => {
    const coin = useTerminalStore.getState().selectedCoin;
    useChartToolsStore.getState().removeDrawing(coin, id);
    setSelectedDrawingId((cur) => (cur === id ? null : cur));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawingSessionRef.current || draftRef.current) {
          clearDrawingDraft();
        }
        if (editSessionRef.current) {
          clearEditSession();
          setSelectedDrawingId(null);
        }
        return;
      }

      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (!canEditDrawings || !selectedDrawingIdRef.current) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      deleteDrawing(selectedDrawingIdRef.current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canEditDrawings, clearDrawingDraft, clearEditSession, deleteDrawing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !canEditDrawings) return;

    const onPointerDown = (ev: PointerEvent) => {
      const chart = chartRef.current;
      const series = seriesRef.current;
      if (!chart || !series) return;
      const rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const coin = useTerminalStore.getState().selectedCoin;
      const drawings = useChartToolsStore.getState().drawingsByCoin[coin] ?? [];
      const hit = findTopDrawingHit(drawings, chart, series, x, y, rect.width, rect.height);
      if (hit) {
        setSelectedDrawingId(hit.drawingId);
      } else {
        setSelectedDrawingId(null);
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, [canEditDrawings]);

  const syncPriceLines = useCallback((series: ISeriesApi<"Candlestick">) => {
    for (const pl of priceLinesRef.current) {
      series.removePriceLine(pl);
    }
    priceLinesRef.current = [];

    const coin = useTerminalStore.getState().selectedCoin;
    const tools = useChartToolsStore.getState();

    const addLine = (
      price: number,
      color: string,
      title: string,
      style: LineStyle = LineStyle.Solid,
    ) => {
      if (!Number.isFinite(price) || price <= 0) return;
      const pl = series.createPriceLine({
        price,
        color,
        lineWidth: 1,
        lineStyle: style,
        axisLabelVisible: true,
        title,
      });
      priceLinesRef.current.push(pl);
    };

    if (tools.showPositionLines) {
      const livePos = useTerminalStore.getState().positions.find((p) => p.coin === coin);
      if (livePos && livePos.size !== 0) {
        const long = livePos.size > 0;
        addLine(livePos.entryPrice, long ? EQ_CHART.up : EQ_CHART.down, "ENTRY");
        if (livePos.markPrice > 0) {
          addLine(livePos.markPrice, "#787b86", "MARK", LineStyle.Dashed);
        }
      }

      if (useDeskExecutionStore.getState().mode === "paper") {
        const paper = useDeskExecutionStore.getState().paperPositions.find((p) => p.coin === coin);
        if (paper && paper.size !== 0) {
          const long = paper.size > 0;
          addLine(paper.avgPx, long ? EQ_CHART.up : EQ_CHART.down, "PAPER ENTRY");
        }
      }
    }

    const preview = tools.ticketPreview;
    if (preview?.limit && Number.isFinite(preview.limit)) {
      addLine(preview.limit, "#2962ff", "LIMIT", LineStyle.Dotted);
    }
    if (preview?.stop && Number.isFinite(preview.stop)) {
      addLine(preview.stop, "#f23645", "STOP", LineStyle.Dotted);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: EQ_CHART.background },
        textColor: EQ_CHART.text,
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: EQ_CHART.grid, style: 3 },
        horzLines: { color: EQ_CHART.grid, style: 3 },
      },
      rightPriceScale: {
        borderColor: EQ_CHART.border,
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: EQ_CHART.border,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 7,
        minBarSpacing: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: EQ_CHART.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: EQ_CHART.crosshairLabel,
        },
        horzLine: {
          color: EQ_CHART.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: EQ_CHART.crosshairLabel,
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });
    const series = chart.addCandlestickSeries({
      upColor: EQ_CHART.up,
      downColor: EQ_CHART.down,
      borderVisible: false,
      wickUpColor: EQ_CHART.upWick,
      wickDownColor: EQ_CHART.downWick,
    });
    const volume = chart.addHistogramSeries({
      color: EQ_CHART.volumeUp,
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    seriesRef.current = series;
    volumeRef.current = volume;

    const viewportPrimitive = new DrawingViewportPrimitive();
    viewportPrimitiveRef.current = viewportPrimitive;
    series.attachPrimitive(viewportPrimitive);

    const tools = useChartToolsStore.getState();
    const coin = useTerminalStore.getState().selectedCoin;
    viewportPrimitive.sync({
      drawings: tools.drawingsByCoin[coin] ?? [],
      hidden: tools.drawingPrefs.hideDrawings,
      selectedId: selectedDrawingIdRef.current,
      skipId: liveEditDrawingRef.current?.id ?? null,
      draft: draftRef.current,
      liveEditDrawing: liveEditDrawingRef.current,
    });

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (viewportPrimitiveRef.current) {
        series.detachPrimitive(viewportPrimitiveRef.current);
        viewportPrimitiveRef.current = null;
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
      indicatorSeriesRef.current = new Map();
      priceLinesRef.current = [];
    };
  }, []);

  useEffect(() => {
    didFitRef.current = false;
    candleFpRef.current = "";
    lastLegendRef.current = null;
    setLegend(null);
    clearChartSurface(
      chartRef.current,
      seriesRef.current,
      volumeRef.current,
      indicatorSeriesRef,
    );
  }, [selectedCoin, timeframe]);

  useEffect(() => {
    didFitRef.current = false;
    candleFpRef.current = "";
  }, [timeframe, historyVersion]);

  useEffect(() => {
    const series = seriesRef.current;
    const volume = volumeRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    const apply = () => {
      const snapshot = useChartAnalyticsStore.getState().snapshot;
      const candles = resolveCandles();
      const enabledIndicators = useChartToolsStore.getState().indicators;
      const settings = useChartToolsStore.getState().indicatorSettings;
      const display = useChartToolsStore.getState().indicatorDisplay;
      const fp = candleFingerprint(candles, timeframe);

      if (candles.length === 0) {
        if (candleFpRef.current !== `${timeframe}:0`) {
          candleFpRef.current = `${timeframe}:0`;
          series.setData([]);
          volume?.setData([]);
          series.setMarkers([]);
        }
        syncPriceLines(series);
        return;
      }

      if (fp !== candleFpRef.current) {
        const tailOnly = isTailOnlyCandleUpdate(candleFpRef.current, fp);
        candleFpRef.current = fp;
        const last = candles[candles.length - 1]!;
        const t = last.time as UTCTimestamp;

        if (tailOnly) {
          series.update({
            time: t,
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
          });
          volume?.update({
            time: t,
            value: last.volume,
            color: last.close >= last.open ? EQ_CHART.volumeUp : EQ_CHART.volumeDown,
          });
          const nextLegend = candleLegend(
            { time: t, open: last.open, high: last.high, low: last.low, close: last.close },
            { time: t, value: last.volume, color: EQ_CHART.volumeUp },
          );
          lastLegendRef.current = nextLegend;
          applyOverlayIndicators(
            chart,
            candles,
            enabledIndicators,
            indicatorSeriesRef.current,
            settings,
            display,
          );
          syncPriceLines(series);
          return;
        }

        const candleData = candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        series.setData(candleData);
        volume?.setData(
          candles.map((c) => ({
            time: c.time as UTCTimestamp,
            value: c.volume,
            color: c.close >= c.open ? EQ_CHART.volumeUp : EQ_CHART.volumeDown,
          })),
        );

        const lastCandle = candleData[candleData.length - 1];
        if (lastCandle) {
          const nextLegend = candleLegend(lastCandle, {
            time: lastCandle.time,
            value: last.volume,
            color: EQ_CHART.volumeUp,
          });
          lastLegendRef.current = nextLegend;
          setLegend((prev) => (legendEqual(prev, nextLegend) ? prev : nextLegend));
        }

        if (!didFitRef.current) {
          chart.timeScale().fitContent();
          chart.timeScale().scrollToRealTime();
          didFitRef.current = true;
        }
      }

      if (isWorkspaceScrolling()) return;

      if (snapshot?.overlays.includes("event_markers")) {
        const markers: SeriesMarker<UTCTimestamp>[] = snapshot.eventMarkers.map((m) => ({
          time: m.time as UTCTimestamp,
          position: "aboveBar" as const,
          color: markerColor(m.severity),
          shape: m.kind === "liquidation" ? "arrowDown" : "circle",
          text: m.label.slice(0, 24),
        }));
        series.setMarkers(markers);
      } else {
        series.setMarkers([]);
      }

      applyOverlayIndicators(
        chart,
        candles,
        enabledIndicators,
        indicatorSeriesRef.current,
        settings,
        display,
      );

      syncPriceLines(series);
    };

    if (isWorkspaceScrolling()) {
      return onWorkspaceScrollEnd(apply);
    }
    apply();
  }, [
    displayLen,
    historyVersion,
    historyLoading,
    eventMarkerCount,
    indicatorsKey,
    selectedCoin,
    timeframe,
    syncPriceLines,
  ]);

  useEffect(() => {
    const run = () => {
      const series = seriesRef.current;
      const volume = volumeRef.current;
      const chart = chartRef.current;
      if (!series || !chart) return;

      const candles = resolveCandles();
      const fp = candleFingerprint(candles, timeframe);
      if (candles.length === 0 || fp === candleFpRef.current) return;

      const tailOnly = isTailOnlyCandleUpdate(candleFpRef.current, fp);
      if (!tailOnly) return;

      candleFpRef.current = fp;
      const last = candles[candles.length - 1]!;
      const t = last.time as UTCTimestamp;
      series.update({
        time: t,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      });
      volume?.update({
        time: t,
        value: last.volume,
        color: last.close >= last.open ? EQ_CHART.volumeUp : EQ_CHART.volumeDown,
      });
      const nextLegend = candleLegend(
        { time: t, open: last.open, high: last.high, low: last.low, close: last.close },
        { time: t, value: last.volume, color: EQ_CHART.volumeUp },
      );
      lastLegendRef.current = nextLegend;
      syncPriceLines(series);
    };

    const schedule = () => {
      if (isWorkspaceScrolling()) onWorkspaceScrollEnd(run);
      else run();
    };

    return useTerminalStore.subscribe((state, prevState) => {
      if (state.candleVersion !== prevState.candleVersion) schedule();
    });
  }, [syncPriceLines, timeframe]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    syncPriceLines(series);
  }, [
    positionsVersion,
    showPositionLines,
    drawingCount,
    hideDrawings,
    ticketLimit,
    ticketStop,
    paperCount,
    deskMode,
    selectedCoin,
    syncPriceLines,
  ]);

  useEffect(() => {
    const applyMid = () => {
      const book = useTerminalStore.getState().book;
      const hlCandles = useTerminalStore.getState().candles;
      const loading = useChartAnalyticsStore.getState().historyLoading;
      if (!book?.mid || !seriesRef.current || hlCandles.length > 0 || loading) return;
      const t = Math.floor(Date.now() / 1000) as UTCTimestamp;
      seriesRef.current.update({
        time: t,
        open: book.mid,
        high: book.mid,
        low: book.mid,
        close: book.mid,
      });
    };

    applyMid();
    return useTerminalStore.subscribe((state, prevState) => {
      if (state.candleVersion !== prevState.candleVersion) {
        if (isWorkspaceScrolling()) onWorkspaceScrollEnd(applyMid);
        else applyMid();
      }
    });
  }, [historyLoading]);

  useEffect(() => {
    return terminalBus.on("asset:select", () => {
      lastLegendRef.current = null;
      candleFpRef.current = "";
      setLegend(null);
      didFitRef.current = false;
      clearChartSurface(
        chartRef.current,
        seriesRef.current,
        volumeRef.current,
        indicatorSeriesRef,
      );
    });
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    const volume = volumeRef.current;
    if (!chart || !series) return;

    const crossHandler = (param: MouseEventParams<Time>) => {
      const t = crosshairTimeToUnix(param);
      if (t != null) {
        terminalBus.emit("chart:cursor", { time: t, sourceChartId: "primary" });
      }

      const now = performance.now();
      if (now - crosshairLegendAtRef.current < 100) return;
      crosshairLegendAtRef.current = now;

      if (!param.time) {
        setLegend((prev) => (legendEqual(prev, lastLegendRef.current) ? prev : lastLegendRef.current));
        return;
      }

      const candle = param.seriesData.get(series) as CandlestickData<Time> | undefined;
      if (!candle || candle.open == null) {
        setLegend((prev) => (legendEqual(prev, lastLegendRef.current) ? prev : lastLegendRef.current));
        return;
      }
      const vol = volume ? (param.seriesData.get(volume) as HistogramData<Time> | undefined) : undefined;
      const next = candleLegend(candle, vol);
      setLegend((prev) => (legendEqual(prev, next) ? prev : next));
    };

    chart.subscribeCrosshairMove(crossHandler);
    return () => {
      chart.unsubscribeCrosshairMove(crossHandler);
    };
  }, []);

  const resolveChartPoint = useCallback((clientX: number, clientY: number, magnetMode?: MagnetMode): ChartPoint | null => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    const layer = drawCaptureRef.current ?? containerRef.current;
    if (!chart || !series || !layer) return null;

    const rect = layer.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const candles = useChartAnalyticsStore.getState().displayCandles;
    return resolveDrawPoint(
      chart,
      series,
      x,
      y,
      candles,
      magnetMode ?? drawingPrefsRef.current.magnetMode,
    );
  }, []);

  const applyLiveEdit = useCallback((session: DrawingEditSession, pt: ChartPoint) => {
    const next = applyEditToDrawing(
      session.snapshot,
      session.part,
      session.endpointIndex,
      session.anchor,
      pt,
    );
    liveEditDrawingRef.current = next;
    schedulePrimitivePaint();
  }, [schedulePrimitivePaint]);

  const commitEdit = useCallback((session: DrawingEditSession, pt: ChartPoint) => {
    const coin = useTerminalStore.getState().selectedCoin;
    const store = useChartToolsStore.getState();
    const next = applyEditToDrawing(
      session.snapshot,
      session.part,
      session.endpointIndex,
      session.anchor,
      pt,
    );
    store.updateDrawing(coin, session.drawingId, next);
  }, []);

  const commitDrawing = useCallback(
    (tool: ChartDrawTool, points: ChartPoint[], text?: string) => {
      const coin = useTerminalStore.getState().selectedCoin;
      const store = useChartToolsStore.getState();
      const drawing = createDrawing(tool, coin, points, text);
      if (!drawing) return;
      store.addDrawing(coin, drawing);
      setSelectedDrawingId(drawing.id);
    },
    [],
  );

  const onEditStart = useCallback(
    (start: DrawingEditStart, e: React.PointerEvent) => {
      if (drawingPrefsRef.current.lockDrawings) return;

      setSelectedDrawingId(start.drawingId);

      if (isDrawingLocked(start.snapshot)) {
        e.preventDefault();
        return;
      }

      const pt = resolveChartPoint(e.clientX, e.clientY);
      if (!pt) return;

      const originX = e.clientX;
      const originY = e.clientY;
      let dragging = false;

      const session: DrawingEditSession =
        start.part === "body" ? { ...start, anchor: pt } : start;

      const onMove = (ev: PointerEvent) => {
        const movePt = resolveChartPoint(ev.clientX, ev.clientY);
        if (!movePt) return;

        if (!dragging) {
          if (Math.hypot(ev.clientX - originX, ev.clientY - originY) < SELECT_DRAG_THRESHOLD) return;
          dragging = true;
          editSessionRef.current = session;
          setEditingDrawing(true);
          applyLiveEdit(session, movePt);
          return;
        }

        const active = editSessionRef.current;
        if (active) applyLiveEdit(active, movePt);
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        if (!dragging) return;

        const active = editSessionRef.current;
        editSessionRef.current = null;
        liveEditDrawingRef.current = null;
        setEditingDrawing(false);
        schedulePrimitivePaint();

        const endPt = resolveChartPoint(ev.clientX, ev.clientY);
        if (active && endPt) commitEdit(active, endPt);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      e.preventDefault();
    },
    [applyLiveEdit, commitEdit, resolveChartPoint, schedulePrimitivePaint],
  );

  useEffect(() => {
    const layer = drawCaptureRef.current;
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!layer || !chart || !series || !drawingToolActive) return;

    const layerSize = () => ({
      width: layer.clientWidth,
      height: layer.clientHeight,
    });

    const layerPoint = (ev: PointerEvent) => {
      const rect = layer.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    };

    const onPointerDown = (ev: PointerEvent) => {
      if (drawingPrefsRef.current.lockDrawings) return;
      const tool = drawToolRef.current;
      const spec = specForTool(tool);
      const pt = resolveChartPoint(ev.clientX, ev.clientY);
      if (!pt) return;

      if (spec.interaction === "erase") {
        const { width, height } = layerSize();
        const { x, y } = layerPoint(ev);
        const drawings =
          useChartToolsStore.getState().drawingsByCoin[useTerminalStore.getState().selectedCoin] ?? [];
        const hit = findTopDrawingHit(drawings, chart, series, x, y, width, height);
        if (hit) {
          useChartToolsStore.getState().removeDrawing(useTerminalStore.getState().selectedCoin, hit.drawingId);
          setSelectedDrawingId((cur) => (cur === hit.drawingId ? null : cur));
        }
        ev.preventDefault();
        return;
      }

      if (spec.interaction === "zoom") {
        const range = chart.timeScale().getVisibleRange();
        if (range && typeof range.from === "number" && typeof range.to === "number") {
          const clickTime = pt.time;
          const span = range.to - range.from;
          const nextSpan = span * 0.5;
          const ratio = span > 0 ? (clickTime - range.from) / span : 0.5;
          const from = clickTime - nextSpan * ratio;
          const to = from + nextSpan;
          chart.timeScale().setVisibleRange({ from: from as UTCTimestamp, to: to as UTCTimestamp });
        }
        ev.preventDefault();
        return;
      }

      if (spec.interaction === "click") {
        let text: string | undefined;
        if (spec.promptText) {
          text = window.prompt("Enter text:", "Text") ?? undefined;
          if (text === undefined) return;
        }
        commitDrawing(tool, [pt], text);
        ev.preventDefault();
        return;
      }

      if (spec.interaction === "clicks") {
        const session = drawingSessionRef.current;
        if (!session || session.tool !== tool) {
          drawingSessionRef.current = { tool, points: [pt] };
          draftRef.current = { tool, points: [pt], cursor: pt };
          schedulePrimitivePaint();
        } else {
          const points = [...session.points, pt];
          const needed = spec.clickCount ?? points.length;
          if (points.length >= needed) {
            commitDrawing(tool, points);
            drawingSessionRef.current = null;
            draftRef.current = null;
            schedulePrimitivePaint();
          } else {
            drawingSessionRef.current = { tool, points };
            draftRef.current = { tool, points, cursor: pt };
            schedulePrimitivePaint();
          }
        }
        ev.preventDefault();
        return;
      }

      if (spec.interaction === "path") {
        drawingSessionRef.current = { tool, points: [pt], pathPoints: [pt] };
        draftRef.current = { tool, points: [pt], pathPoints: [pt], cursor: pt };
        schedulePrimitivePaint();
        layer.setPointerCapture(ev.pointerId);
        ev.preventDefault();
        return;
      }

      if (spec.interaction === "drag") {
        drawingSessionRef.current = { tool, points: [pt] };
        draftRef.current = { tool, points: [pt], cursor: pt };
        schedulePrimitivePaint();
        layer.setPointerCapture(ev.pointerId);
        ev.preventDefault();
      }
    };

    const onPointerMove = (ev: PointerEvent) => {
      const session = drawingSessionRef.current;
      if (!session) return;
      const pt = resolveChartPoint(ev.clientX, ev.clientY);
      if (!pt) return;

      const spec = specForTool(session.tool);
      if (spec.interaction === "path") {
        const pathPoints = [...(session.pathPoints ?? session.points), pt];
        drawingSessionRef.current = { ...session, pathPoints };
        draftRef.current = { tool: session.tool, points: session.points, pathPoints, cursor: pt };
        schedulePrimitivePaint();
        return;
      }

      if (spec.interaction === "drag") {
        draftRef.current = { tool: session.tool, points: session.points, cursor: pt };
        schedulePrimitivePaint();
      }
    };

    const onPointerUp = (ev: PointerEvent) => {
      const session = drawingSessionRef.current;
      if (!session) return;

      const spec = specForTool(session.tool);
      if (spec.interaction !== "drag" && spec.interaction !== "path") return;

      const end = resolveChartPoint(ev.clientX, ev.clientY);
      drawingSessionRef.current = null;
      draftRef.current = null;
      schedulePrimitivePaint();

      if (layer.hasPointerCapture(ev.pointerId)) {
        layer.releasePointerCapture(ev.pointerId);
      }

      if (!end) return;

      if (spec.interaction === "path") {
        const pathPoints = session.pathPoints ?? [...session.points, end];
        if (pathPoints.length >= 2) {
          commitDrawing(session.tool, pathPoints);
        }
        return;
      }

      const start = session.points[0]!;
      const minDist = session.tool === "line-hline" ? 0 : 8;
      if (minDist > 0 && dragDistance(chart, series, start, end) < minDist) return;

      const points =
        session.tool === "line-hline"
          ? [start, { time: start.time, price: end.price }]
          : session.tool === "line-hray"
            ? [start, end]
            : [start, end];
      commitDrawing(session.tool, points);
    };

    layer.addEventListener("pointerdown", onPointerDown);
    layer.addEventListener("pointermove", onPointerMove);
    layer.addEventListener("pointerup", onPointerUp);
    layer.addEventListener("pointercancel", onPointerUp);
    return () => {
      layer.removeEventListener("pointerdown", onPointerDown);
      layer.removeEventListener("pointermove", onPointerMove);
      layer.removeEventListener("pointerup", onPointerUp);
      layer.removeEventListener("pointercancel", onPointerUp);
    };
  }, [commitDrawing, drawingToolActive, resolveChartPoint, schedulePrimitivePaint]);

  useEffect(() => {
    setOverlayEnabled("volume_profile", volProfileWanted);
  }, [volProfileWanted, setOverlayEnabled]);

  return (
    <div
      data-chart-panel="chart"
      data-live-panel
      className="eq-chart-surface relative flex h-full flex-col overflow-hidden"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <ChartAnalyticsToolbar coin={selectedCoin} />
      <div className="relative flex min-h-0 flex-1" style={{ contain: "layout paint" }}>
        <ChartDrawingToolbar coin={selectedCoin} />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <ChartIndicatorLegend values={legend} coin={selectedCoin} />
            {historyLoading && displayLen === 0 ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#131722]/40">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Loading {timeframe}…</span>
              </div>
            ) : historyLoading ? (
              <div className="pointer-events-none absolute right-2 top-2 z-10 rounded bg-[#131722]/80 px-1.5 py-0.5">
                <span className="text-[9px] uppercase tracking-widest text-slate-500">Updating {timeframe}…</span>
              </div>
            ) : null}
            <div ref={containerRef} className="absolute inset-0" />
            <div
              ref={drawCaptureRef}
              className={
                drawingToolActive
                  ? `absolute inset-0 z-[7] touch-none ${
                      drawTool === "arrow"
                        ? "cursor-default"
                        : drawTool === "eraser"
                          ? "cursor-not-allowed"
                          : drawTool === "zoom"
                            ? "cursor-zoom-in"
                            : dragCaptureActive || drawSpec.interaction === "click" || drawSpec.interaction === "clicks"
                              ? "cursor-crosshair"
                              : "cursor-crosshair"
                    }`
                  : "pointer-events-none absolute inset-0 z-[7]"
              }
              aria-hidden={!drawingToolActive}
            />
            <ChartDrawingsOverlay
              coin={selectedCoin}
              chartRef={chartRef}
              seriesRef={seriesRef}
              containerRef={containerRef}
              viewportPrimitiveRef={viewportPrimitiveRef}
              selectedDrawingId={selectedDrawingId}
              editable={canEditDrawings && !editingDrawing}
              onEditStart={onEditStart}
            />
            {canEditDrawings && selectedDrawing ? (
              <ChartDrawingSelectionToolbar
                coin={selectedCoin}
                drawing={selectedDrawing}
                chartRef={chartRef}
                seriesRef={seriesRef}
                containerRef={containerRef}
                viewportPrimitiveRef={viewportPrimitiveRef}
                onDelete={() => deleteDrawing(selectedDrawing.id)}
                onDismiss={() => setSelectedDrawingId(null)}
              />
            ) : null}
            <VolumeProfileOverlay visible={volProfileWanted} />
          </div>
          {paneIds.map((id) => (
            <ChartIndicatorPane key={id} indicatorId={id} mainChartRef={chartRef} />
          ))}
          <IndicatorsModal />
          <IndicatorSettingsModal />
        </div>
      </div>
    </div>
  );
}
