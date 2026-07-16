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
import { ChartDrawingsOverlay } from "@/components/charting/ChartDrawingsOverlay";
import { ChartIndicatorLegend } from "@/components/charting/ChartIndicatorLegend";
import { ChartAnalyticsToolbar } from "@/components/charting/ChartAnalyticsToolbar";
import { ChartIndicatorPane } from "@/components/charting/ChartIndicatorPane";
import { IndicatorsModal } from "@/components/charting/IndicatorsModal";
import { IndicatorSettingsModal } from "@/components/charting/IndicatorSettingsModal";
import { VolumeProfileOverlay } from "@/components/charting/VolumeProfileOverlay";
import { indicatorSettingsFingerprint } from "@/lib/charting/indicatorParams";
import { snapPriceToCandle } from "@/lib/charting/chartDrawing";
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
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { NormalizedCandle } from "@/types/terminal-schema";

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
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const indicatorSeriesRef = useRef<OverlaySeriesMap>(new Map());
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const lastLegendRef = useRef<ChartLegendValues | null>(null);
  const candleFpRef = useRef("");
  const didFitRef = useRef(false);
  const drawToolRef = useRef(useChartToolsStore.getState().drawTool);
  const drawingPrefsRef = useRef(useChartToolsStore.getState().drawingPrefs);
  const trendDraftRef = useRef<{ time: number; price: number } | null>(null);
  const [trendDraft, setTrendDraft] = useState<{ time: number; price: number } | null>(null);

  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const candleVersion = useTerminalStore((s) => s.candleVersion);
  const positionsVersion = useTerminalStore((s) => s.positionsVersion);
  const displayLen = useChartAnalyticsStore((s) => s.displayCandles.length);
  const displayCandles = useChartAnalyticsStore((s) => s.displayCandles);
  const historyVersion = useChartAnalyticsStore((s) => s.historyVersion);
  const historyLoading = useChartAnalyticsStore((s) => s.historyLoading);
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const eventMarkerCount = useChartAnalyticsStore((s) => s.snapshot?.eventMarkers.length ?? 0);
  const indicators = useChartToolsStore((s) => s.indicators);
  const indicatorSettings = useChartToolsStore((s) => s.indicatorSettings);
  const indicatorDisplay = useChartToolsStore((s) => s.indicatorDisplay);
  const showPositionLines = useChartToolsStore((s) => s.showPositionLines);
  const userLineCount = useChartToolsStore((s) => s.linesByCoin[selectedCoin]?.length ?? 0);
  const trendLineCount = useChartToolsStore((s) => s.trendLinesByCoin[selectedCoin]?.length ?? 0);
  const hideDrawings = useChartToolsStore((s) => s.drawingPrefs.hideDrawings);
  const ticketLimit = useChartToolsStore((s) => s.ticketPreview?.limit);
  const ticketStop = useChartToolsStore((s) => s.ticketPreview?.stop);
  const paperCount = useDeskExecutionStore((s) => s.paperPositions.length);
  const deskMode = useDeskExecutionStore((s) => s.mode);

  const [legend, setLegend] = useState<ChartLegendValues | null>(null);
  useEffect(() => {
    trendDraftRef.current = null;
    setTrendDraft(null);
  }, [selectedCoin, timeframe]);

  const drawTool = useChartToolsStore((s) => s.drawTool);
  useEffect(() => {
    if (drawTool !== "trendline") {
      trendDraftRef.current = null;
      setTrendDraft(null);
    }
  }, [drawTool]);

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

    for (const line of tools.linesForCoin(coin)) {
      if (!tools.drawingPrefs.hideDrawings) {
        addLine(line.price, line.color, line.label, LineStyle.Solid);
      }
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
    candleVersion,
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
    const series = seriesRef.current;
    if (!series) return;
    syncPriceLines(series);
  }, [
    positionsVersion,
    showPositionLines,
    userLineCount,
    trendLineCount,
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

    if (isWorkspaceScrolling()) {
      return onWorkspaceScrollEnd(applyMid);
    }
    applyMid();
  }, [candleVersion, historyLoading]);

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

    const clickHandler = (param: MouseEventParams<Time>) => {
      const tool = drawToolRef.current;
      if (tool === "none" || tool === "crosshair" || !param.point) return;
      if (drawingPrefsRef.current.lockDrawings) return;

      const priceRaw = series.coordinateToPrice(param.point.y);
      const time = crosshairTimeToUnix(param);
      if (priceRaw == null || !Number.isFinite(priceRaw) || time == null) return;

      const coin = useTerminalStore.getState().selectedCoin;
      const candles = useChartAnalyticsStore.getState().displayCandles;
      const price = drawingPrefsRef.current.magnet
        ? snapPriceToCandle(candles, time, priceRaw as number)
        : (priceRaw as number);
      const store = useChartToolsStore.getState();

      if (tool === "hline") {
        store.addHorizontalLine(coin, price);
        return;
      }

      if (tool === "trendline") {
        const draft = trendDraftRef.current;
        if (!draft) {
          trendDraftRef.current = { time, price };
          setTrendDraft({ time, price });
          return;
        }
        store.addTrendLine(coin, draft.time, draft.price, time, price);
        trendDraftRef.current = null;
        setTrendDraft(null);
      }
    };

    chart.subscribeCrosshairMove(crossHandler);
    chart.subscribeClick(clickHandler);
    return () => {
      chart.unsubscribeCrosshairMove(crossHandler);
      chart.unsubscribeClick(clickHandler);
    };
  }, []);

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
            <ChartIndicatorLegend values={legend} coin={selectedCoin} candles={displayCandles} />
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
            <ChartDrawingsOverlay
              coin={selectedCoin}
              chartRef={chartRef}
              seriesRef={seriesRef}
              containerRef={containerRef}
              draftPoint={trendDraft}
            />
            <VolumeProfileOverlay
              candles={displayCandles}
              visible={volProfileWanted}
            />
          </div>
          {paneIds.map((id) => (
            <ChartIndicatorPane
              key={id}
              indicatorId={id}
              candles={displayCandles}
              mainChartRef={chartRef}
            />
          ))}
          <IndicatorsModal />
          <IndicatorSettingsModal />
        </div>
      </div>
    </div>
  );
}
