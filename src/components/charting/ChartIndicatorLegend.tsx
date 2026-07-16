"use client";

import { memo, useMemo, useState } from "react";
import { Eye, EyeOff, MoreHorizontal, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { EQ_CHART } from "@/lib/theme/equilibrium-visual";
import { resolveIndicatorDisplay } from "@/lib/charting/indicatorDisplay";
import { indicatorLegendTitle } from "@/lib/charting/indicatorParams";
import {
  chartLegendIndicatorIds,
  formatLegendValue,
  indicatorLegendValues,
} from "@/lib/charting/indicatorLegendValues";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { ChartLegendValues } from "@/components/terminal/ChartLegend";
import type { NormalizedCandle } from "@/types/terminal-schema";

function fmtOhlc(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function OhlcRow({ values, coin, timeframe }: { values: ChartLegendValues | null; coin: string; timeframe: string }) {
  if (!values) {
    return (
      <div className="text-[11px] text-slate-500">
        {coin}-PERP · {timeframe}
      </div>
    );
  }

  const up = values.close >= values.open;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]", TERMINAL_TYPO.micro)}>
      <span className="font-medium text-slate-300">
        {coin}-PERP · {timeframe}
      </span>
      <OhlcField label="O" value={fmtOhlc(values.open)} />
      <OhlcField label="H" value={fmtOhlc(values.high)} />
      <OhlcField label="L" value={fmtOhlc(values.low)} />
      <OhlcField label="C" value={fmtOhlc(values.close)} accent={up ? EQ_CHART.up : EQ_CHART.down} />
      {values.volume != null ? (
        <OhlcField
          label="V"
          value={values.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        />
      ) : null}
    </div>
  );
}

function OhlcField({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <span className="tabular-nums text-slate-500">
      <span className="mr-0.5 text-slate-600">{label}</span>
      <span style={accent ? { color: accent } : undefined} className={accent ? undefined : "text-slate-300"}>
        {value}
      </span>
    </span>
  );
}

const IndicatorLegendRow = memo(function IndicatorLegendRow({
  id,
  candles,
}: {
  id: string;
  candles: NormalizedCandle[];
}) {
  const [hovered, setHovered] = useState(false);
  const inputSettings = useChartToolsStore((s) => s.indicatorSettings[id]);
  const displayRaw = useChartToolsStore((s) => s.indicatorDisplay[id]);
  const display = useMemo(() => resolveIndicatorDisplay(id, displayRaw), [id, displayRaw]);
  const setSettingsTarget = useChartToolsStore((s) => s.setSettingsTarget);
  const removeIndicator = useChartToolsStore((s) => s.removeIndicator);
  const updateIndicatorDisplay = useChartToolsStore((s) => s.updateIndicatorDisplay);

  const title = indicatorLegendTitle(id, inputSettings);
  const values = useMemo(
    () => indicatorLegendValues(id, candles, inputSettings, display),
    [id, candles, inputSettings, display],
  );
  const showValues = display.valuesInLegend && !hovered;

  const toggleVisible = () => {
    updateIndicatorDisplay(id, { visible: !display.visible });
  };

  return (
    <div
      className={cn(
        "relative flex min-h-[18px] items-center text-[11px] leading-tight",
        !display.visible && "opacity-50",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <div className="flex items-center gap-1 rounded-md bg-[#2a2e39]/95 px-1.5 py-0.5 shadow-lg ring-1 ring-[#363a45]/80">
          <span className="whitespace-nowrap text-slate-300">{title}</span>
          <button
            type="button"
            onClick={toggleVisible}
            className="rounded p-0.5 text-slate-400 hover:bg-[#363a45] hover:text-slate-200"
            title={display.visible ? "Hide" : "Show"}
          >
            {display.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => setSettingsTarget(id)}
            className="rounded p-0.5 text-slate-400 hover:bg-[#363a45] hover:text-[#5b9cf6]"
            title="Settings"
          >
            <Settings2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => removeIndicator(id)}
            className="rounded p-0.5 text-slate-400 hover:bg-[#363a45] hover:text-rose-400"
            title="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="rounded p-0.5 text-slate-500 hover:bg-[#363a45] hover:text-slate-300"
            title="More"
            onClick={() => setSettingsTarget(id)}
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-1.5">
          <span className="text-slate-500">{title}</span>
          {showValues
            ? values.map((v, i) => (
                <span key={i} className="tabular-nums" style={{ color: v.color }}>
                  {formatLegendValue(v.value)}
                </span>
              ))
            : null}
        </div>
      )}
    </div>
  );
});

export function ChartIndicatorLegend({
  values,
  coin,
  candles,
}: {
  values: ChartLegendValues | null;
  coin: string;
  candles: NormalizedCandle[];
}) {
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const indicators = useChartToolsStore((s) => s.indicators);
  const legendIds = useMemo(() => chartLegendIndicatorIds(indicators), [indicators]);

  return (
    <div
      className="absolute left-2 top-2 z-[12] flex max-w-[min(70vw,420px)] flex-col gap-0.5"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <OhlcRow values={values} coin={coin} timeframe={timeframe} />
      {legendIds.map((id) => (
        <IndicatorLegendRow key={id} id={id} candles={candles} />
      ))}
    </div>
  );
}
