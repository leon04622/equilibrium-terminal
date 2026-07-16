"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { CHART_TIMEFRAMES, TIMEFRAME_LABEL } from "@/lib/charting/chartTimeframes";
import { IndicatorsToolbarButton } from "@/components/charting/IndicatorsModal";
import { prefetchChartHistory } from "@/hooks/useChartHistory";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ChartTimeframe } from "@/types/chart-analytics";

export function ChartAnalyticsToolbar({ coin }: { coin: string }) {
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const historyLoading = useChartAnalyticsStore((s) => s.historyLoading);
  const setTimeframe = useChartAnalyticsStore((s) => s.setTimeframe);

  const connection = useTerminalStore((s) => s.connectionStatus);
  const book = useTerminalStore((s) => s.book);
  const live = connection === "connected";
  const last = book?.mid;

  const selectTimeframe = (tf: ChartTimeframe) => {
    if (tf === timeframe) return;
    prefetchChartHistory(coin, tf);
    setTimeframe(tf);
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-[#2a2e39] bg-[#131722] px-2 py-1",
        TERMINAL_TYPO.micro,
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <span className="text-[11px] font-semibold tracking-wide text-slate-100">{coin}-PERP</span>
        {last != null ? (
          <span className={cn("text-[11px] tabular-nums", terminalSkin.textUp)}>
            {last.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : null}
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px]",
            live ? "text-emerald-400" : "text-amber-400",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-emerald-400" : "bg-amber-400")} />
          {live ? "LIVE" : connection.toUpperCase()}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHART_TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onMouseEnter={() => prefetchChartHistory(coin, tf)}
            onFocus={() => prefetchChartHistory(coin, tf)}
            onClick={() => selectTimeframe(tf)}
            className={cn(
              "shrink-0 px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
              timeframe === tf
                ? "bg-[#2962ff]/20 text-[#5b9cf6]"
                : "text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300",
              historyLoading && timeframe === tf ? "animate-pulse" : "",
            )}
          >
            {TIMEFRAME_LABEL[tf]}
          </button>
        ))}
      </div>

      <IndicatorsToolbarButton />
    </div>
  );
}
