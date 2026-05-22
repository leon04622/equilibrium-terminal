"use client";

import { useEffect, useRef } from "react";
import { ColorType, createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { TacticalChartOverlay } from "@/components/terminal/widgets/TacticalChartOverlay";
import { terminalBus } from "@/store/eventBus";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";

export function ChartWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const candles = useTerminalStore((s) => s.candles);
  const candleVersion = useTerminalStore((s) => s.candleVersion);
  const book = useTerminalStore((s) => s.book);
  const overlayCoin = useMarketAtmosphereStore((s) => s.overlay.coin);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.55)",
        fontFamily: "var(--font-jetbrains-mono), monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)" },
      crosshair: { mode: 1 },
    });
    const series = chart.addCandlestickSeries({
      upColor: "hsl(152 100% 45%)",
      downColor: "hsl(350 95% 58%)",
      borderVisible: false,
      wickUpColor: "hsl(152 100% 45%)",
      wickDownColor: "hsl(350 95% 58%)",
    });
    chartRef.current = chart;
    seriesRef.current = series;

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
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (candles.length > 0) {
      series.setData(
        candles.map((c) => ({
          time: c.time as import("lightweight-charts").UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles, candleVersion]);

  useEffect(() => {
    if (!book?.mid || !seriesRef.current || candles.length > 0) return;
    const t = Math.floor(Date.now() / 1000) as import("lightweight-charts").UTCTimestamp;
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
    });
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-black/20">
      <div className="flex shrink-0 items-center justify-between border-b border-terminal-border/50 px-2 py-1 font-mono text-[10px] text-terminal-muted">
        <span>{selectedCoin} · 1m</span>
        <span className="text-white/70">TradingView Lightweight</span>
      </div>
      <div className="relative min-h-0 flex-1" style={{ contain: "layout paint" }}>
        <div ref={containerRef} className="absolute inset-0" />
        <TacticalChartOverlay className="absolute inset-0 z-10" />
        {overlayCoin !== selectedCoin ? (
          <div className="pointer-events-none absolute inset-0 z-20 bg-slate-950/20" />
        ) : null}
      </div>
    </div>
  );
}
