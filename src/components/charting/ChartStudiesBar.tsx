"use client";

import { Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import {
  CHART_INDICATOR_META,
  type ChartHorizontalLine,
  type ChartIndicatorId,
} from "@/types/chart-tools";

const INDICATORS: ChartIndicatorId[] = ["ema9", "ema21", "ema50", "vwap"];
const EMPTY_LINES: ChartHorizontalLine[] = [];

export function ChartStudiesBar({ coin }: { coin: string }) {
  const indicators = useChartToolsStore((s) => s.indicators);
  const drawTool = useChartToolsStore((s) => s.drawTool);
  const showPositionLines = useChartToolsStore((s) => s.showPositionLines);
  const userLines = useChartToolsStore((s) => s.linesByCoin[coin] ?? EMPTY_LINES);
  const toggleIndicator = useChartToolsStore((s) => s.toggleIndicator);
  const setDrawTool = useChartToolsStore((s) => s.setDrawTool);
  const setShowPositionLines = useChartToolsStore((s) => s.setShowPositionLines);
  const clearHorizontalLines = useChartToolsStore((s) => s.clearHorizontalLines);

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-1 border-b border-[#2a2e39] bg-[#131722] px-2 py-0.5",
        TERMINAL_TYPO.micro,
      )}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[10px] text-slate-600">IND</span>
      {INDICATORS.map((id) => {
        const meta = CHART_INDICATOR_META[id];
        const on = indicators.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleIndicator(id)}
            className={cn(
              "px-1.5 py-0.5 text-[10px]",
              on ? "text-slate-100" : "text-slate-600 hover:text-slate-400",
            )}
            style={on ? { color: meta.color } : undefined}
            title={meta.label}
          >
            {meta.label.replace("EMA ", "")}
          </button>
        );
      })}

      <span className="mx-0.5 text-slate-700">|</span>

      <button
        type="button"
        onClick={() => setDrawTool(drawTool === "hline" ? "none" : "hline")}
        className={cn(
          "flex items-center gap-0.5 px-1.5 py-0.5 text-[10px]",
          drawTool === "hline" ? "bg-[#2962ff]/20 text-[#5b9cf6]" : "text-slate-600 hover:text-slate-400",
        )}
        title="Click chart to draw horizontal line"
      >
        <Minus className="h-3 w-3" />
        H-LINE
      </button>

      <button
        type="button"
        onClick={() => setShowPositionLines(!showPositionLines)}
        className={cn(
          "px-1.5 py-0.5 text-[10px]",
          showPositionLines ? "text-emerald-400" : "text-slate-600 hover:text-slate-400",
        )}
        title="Show entry / mark lines for open position"
      >
        POSITIONS
      </button>

      {userLines.length > 0 ? (
        <button
          type="button"
          onClick={() => clearHorizontalLines(coin)}
          className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-slate-600 hover:text-rose-400"
          title="Clear drawn lines"
        >
          <Trash2 className="h-3 w-3" />
          CLEAR ({userLines.length})
        </button>
      ) : null}

      {drawTool === "hline" ? (
        <span className="ml-auto text-[10px] text-[#5b9cf6]">Click chart to place line</span>
      ) : null}
    </div>
  );
}
