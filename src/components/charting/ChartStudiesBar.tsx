"use client";

import { Minus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { INDICATOR_BY_ID } from "@/lib/charting/indicatorCatalog";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { ChartHorizontalLine } from "@/types/chart-tools";

const EMPTY_LINES: ChartHorizontalLine[] = [];

export function ChartStudiesBar({ coin }: { coin: string }) {
  const indicators = useChartToolsStore((s) => s.indicators);
  const drawTool = useChartToolsStore((s) => s.drawTool);
  const showPositionLines = useChartToolsStore((s) => s.showPositionLines);
  const userLines = useChartToolsStore((s) => s.linesByCoin[coin] ?? EMPTY_LINES);
  const removeIndicator = useChartToolsStore((s) => s.removeIndicator);
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
      {indicators.length > 0 ? (
        <>
          <span className="mx-0.5 text-slate-700">|</span>
          {indicators.map((id) => {
            const meta = INDICATOR_BY_ID[id];
            if (!meta) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => removeIndicator(id)}
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-[#2a2e39]"
                style={{ color: meta.color }}
                title={`Remove ${meta.name}`}
              >
                <span className="max-w-[120px] truncate">{meta.name}</span>
                <X className="h-2.5 w-2.5 opacity-60" />
              </button>
            );
          })}
        </>
      ) : null}

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
