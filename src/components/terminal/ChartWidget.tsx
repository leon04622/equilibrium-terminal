"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { ChartAnalyticsToolbar } from "@/components/charting/ChartAnalyticsToolbar";
import { ChartOperationalHud } from "@/components/terminal/ChartOperationalHud";
import { TacticalChartOverlay } from "@/components/terminal/widgets/TacticalChartOverlay";
import { EQ_CHART } from "@/lib/theme/equilibrium-visual";
import { terminalBus } from "@/store/eventBus";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";

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

export function ChartWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const displayCandles = useChartAnalyticsStore((s) => s.displayCandles);
  const hlCandles = useTerminalStore((s) => s.candles);
  const candleVersion = useTerminalStore((s) => s.candleVersion);
  const snapshot = useChartAnalyticsStore((s) => s.snapshot);
  const book = useTerminalStore((s) => s.book);
  const overlayCoin = useMarketAtmosphereStore((s) => s.overlay.coin);

  const candles =
    displayCandles.length > 0
      ? displayCandles
      : hlCandles;

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: EQ_CHART.background },
        textColor: EQ_CHART.text,
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: EQ_CHART.grid, style: 1 },
        horzLines: { color: EQ_CHART.grid, style: 1 },
      },
      rightPriceScale: { borderColor: EQ_CHART.border },
      timeScale: { borderColor: EQ_CHART.border },
      crosshair: {
        mode: 1,
        vertLine: { color: EQ_CHART.crosshair, width: 1, style: 2 },
        horzLine: { color: EQ_CHART.crosshair, width: 1, style: 2 },
      },
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
      scaleMargins: { top: 0.8, bottom: 0 },
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
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const volume = volumeRef.current;
    if (!series) return;

    if (candles.length > 0) {
      series.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );
      volume?.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? EQ_CHART.volumeUp : EQ_CHART.volumeDown,
        })),
      );

      if (snapshot?.overlays.includes("event_markers")) {
        const markers: SeriesMarker<UTCTimestamp>[] = snapshot.eventMarkers.map(
          (m) => ({
            time: m.time as UTCTimestamp,
            position: "aboveBar" as const,
            color: markerColor(m.severity),
            shape: m.kind === "liquidation" ? "arrowDown" : "circle",
            text: m.label.slice(0, 24),
          }),
        );
        series.setMarkers(markers);
      } else {
        series.setMarkers([]);
      }

      chartRef.current?.timeScale().fitContent();
    }
  }, [candles, candleVersion, snapshot?.eventMarkers, snapshot?.overlays]);

  useEffect(() => {
    if (!book?.mid || !seriesRef.current || candles.length > 0) return;
    const t = Math.floor(Date.now() / 1000) as UTCTimestamp;
    seriesRef.current.update({
      time: t,
      open: book.mid,
      high: book.mid,
      low: book.mid,
      close: book.mid,
    });
  }, [book?.mid, candles.length]);

  useEffect(() => {
    return terminalBus.on("asset:select", () => {
      seriesRef.current?.setData([]);
      volumeRef.current?.setData([]);
      seriesRef.current?.setMarkers([]);
    });
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const handler = (param: MouseEventParams<Time>) => {
      const t = crosshairTimeToUnix(param);
      if (t == null) return;
      terminalBus.emit("chart:cursor", { time: t, sourceChartId: "primary" });
    };
    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, []);

  return (
    <div data-chart-panel="chart" className="eq-chart-surface relative flex h-full flex-col overflow-hidden bg-slate-950">
      <ChartAnalyticsToolbar coin={selectedCoin} />
      <div className="relative min-h-0 flex-1" style={{ contain: "layout paint" }}>
        <div ref={containerRef} className="absolute inset-0" />
        <TacticalChartOverlay className="absolute inset-0 z-10" />
        <ChartOperationalHud />
        {overlayCoin !== selectedCoin ? (
          <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950/20" />
        ) : null}
      </div>
    </div>
  );
}
