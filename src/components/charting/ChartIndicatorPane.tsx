"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { Settings2 } from "lucide-react";
import { computeIndicatorOutput } from "@/lib/charting/computeIndicator";
import { INDICATOR_BY_ID } from "@/lib/charting/indicatorCatalog";
import { indicatorBaseType } from "@/lib/charting/indicatorInstances";
import { hasIndicatorSettings, indicatorChipLabel } from "@/lib/charting/indicatorParams";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import { EQ_CHART } from "@/lib/theme/equilibrium-visual";
import type { NormalizedCandle } from "@/types/terminal-schema";

type PaneSeriesRef = {
  lines: ISeriesApi<"Line">[];
  histogram: ISeriesApi<"Histogram"> | null;
};

export function ChartIndicatorPane({
  indicatorId,
  height = 72,
  mainChartRef,
}: {
  indicatorId: string;
  height?: number;
  mainChartRef: RefObject<IChartApi | null>;
}) {
  const candles = useChartAnalyticsStore((s) => s.displayCandles);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<PaneSeriesRef>({ lines: [], histogram: null });
  const baseId = indicatorBaseType(indicatorId);
  const meta = INDICATOR_BY_ID[baseId];
  const settings = useChartToolsStore((s) => s.indicatorSettings[indicatorId]);
  const setSettingsTarget = useChartToolsStore((s) => s.setSettingsTarget);
  const paneLabel = indicatorChipLabel(indicatorId, settings);
  const canConfigure = hasIndicatorSettings(baseId);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: EQ_CHART.background },
        textColor: EQ_CHART.text,
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: EQ_CHART.grid, style: 3 },
      },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { visible: false, borderVisible: false },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    });
    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth, height });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = { lines: [], histogram: null };
    };
  }, [height]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !meta) return;

    for (const ls of seriesRef.current.lines) chart.removeSeries(ls);
    if (seriesRef.current.histogram) chart.removeSeries(seriesRef.current.histogram);
    seriesRef.current = { lines: [], histogram: null };

    const output = computeIndicatorOutput(indicatorId, candles, meta, settings);
    if (!output) return;

    if (output.type === "line") {
      const ls = chart.addLineSeries({
        color: output.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: false,
      });
      ls.setData(output.data);
      seriesRef.current.lines.push(ls);
    } else if (output.type === "histogram") {
      const hs = chart.addHistogramSeries({
        color: output.color,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      hs.setData(output.data);
      seriesRef.current.histogram = hs;
    } else if (output.type === "multi") {
      for (const s of output.series) {
        const ls = chart.addLineSeries({
          color: s.color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: true,
          crosshairMarkerVisible: false,
        });
        ls.setData(s.data);
        seriesRef.current.lines.push(ls);
      }
    } else if (output.type === "macd") {
      const macdLine = chart.addLineSeries({ color: output.colors?.[0] ?? "#2962ff", lineWidth: 1, priceLineVisible: false });
      const signalLine = chart.addLineSeries({ color: output.colors?.[1] ?? "#f59e0b", lineWidth: 1, priceLineVisible: false });
      const hist = chart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false });
      macdLine.setData(output.macd);
      signalLine.setData(output.signal);
      hist.setData(output.histogram);
      seriesRef.current.lines.push(macdLine, signalLine);
      seriesRef.current.histogram = hist;
    }

    chart.timeScale().fitContent();
  }, [indicatorId, candles, meta, settings]);

  useEffect(() => {
    const pane = chartRef.current;
    const main = mainChartRef.current;
    if (!pane || !main) return;

    const onMain = () => {
      const range = main.timeScale().getVisibleLogicalRange();
      if (range) pane.timeScale().setVisibleLogicalRange(range);
    };

    main.timeScale().subscribeVisibleLogicalRangeChange(onMain);
    onMain();

    return () => main.timeScale().unsubscribeVisibleLogicalRangeChange(onMain);
  }, [mainChartRef, candles.length]);

  if (!meta) return null;

  return (
    <div className="relative shrink-0 border-t border-[#2a2e39] bg-[#131722]">
      <div className="absolute left-2 top-0.5 z-10 flex items-center gap-1">
        {canConfigure ? (
          <button
            type="button"
            onClick={() => setSettingsTarget(indicatorId)}
            className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-slate-600 hover:text-[#5b9cf6]"
            title="Edit indicator settings"
          >
            <span>{paneLabel}</span>
            <Settings2 className="h-2.5 w-2.5" />
          </button>
        ) : (
          <span className="text-[9px] uppercase tracking-wide text-slate-600">{paneLabel}</span>
        )}
      </div>
      <div ref={containerRef} style={{ height }} />
    </div>
  );
}
