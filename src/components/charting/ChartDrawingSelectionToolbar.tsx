"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  GripHorizontal,
  Lock,
  LockOpen,
  Minus,
  MoreHorizontal,
  Pencil,
  Settings2,
  Trash2,
} from "lucide-react";
import { drawingToolbarAnchor } from "@/lib/charting/drawingRender";
import { effectiveDrawingColor } from "@/lib/charting/drawingColors";
import { cn } from "@/lib/utils";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import type { ChartDrawing, DrawingLineStyle } from "@/types/chart-tools";
import {
  DRAWING_COLOR_PRESETS,
  DRAWING_STROKE_WIDTHS,
} from "@/types/chart-tools";

function ToolbarButton({
  title,
  onClick,
  active,
  children,
  className,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-slate-300 transition-colors hover:bg-[#363a45] hover:text-white",
        active && "bg-[#363a45] text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-[#434651]" />;
}

export function ChartDrawingSelectionToolbar({
  coin,
  drawing,
  chartRef,
  seriesRef,
  containerRef,
  onDelete,
  onDismiss,
}: {
  coin: string;
  drawing: ChartDrawing;
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<"Candlestick"> | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  onDelete: () => void;
  onDismiss: () => void;
}) {
  const updateDrawing = useChartToolsStore((s) => s.updateDrawing);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [widthOpen, setWidthOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const color = effectiveDrawingColor(drawing);
  const strokeWidth = drawing.strokeWidth ?? 2;
  const lineStyle = drawing.lineStyle ?? "solid";
  const locked = drawing.locked === true;

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    const container = containerRef.current;
    if (!chart || !series || !container) return;

    const updatePos = () => {
      const anchor = drawingToolbarAnchor(
        drawing,
        chart,
        series,
        container.clientWidth,
        container.clientHeight,
      );
      if (!anchor) {
        setPos(null);
        return;
      }
      const toolbarW = 320;
      const x = Math.min(Math.max(anchor.x - toolbarW / 2, 8), container.clientWidth - toolbarW - 8);
      const y = Math.max(anchor.y - 52, 8);
      setPos({ x, y });
    };

    updatePos();
    chart.timeScale().subscribeVisibleLogicalRangeChange(updatePos);
    const ro = new ResizeObserver(updatePos);
    ro.observe(container);
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(updatePos);
      ro.disconnect();
    };
  }, [chartRef, containerRef, drawing, seriesRef]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setColorOpen(false);
      setWidthOpen(false);
      setStyleOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const patchDrawing = (patch: Partial<ChartDrawing>) => {
    updateDrawing(coin, drawing.id, { ...drawing, ...patch } as ChartDrawing);
  };

  const cycleLineStyle = () => {
    const next: DrawingLineStyle =
      lineStyle === "solid" ? "dashed" : lineStyle === "dashed" ? "dotted" : "solid";
    patchDrawing({ lineStyle: next });
  };

  if (!pos) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto absolute z-[12] flex items-center gap-0.5 rounded-lg border border-[#434651] bg-[#1e222d]/95 px-1 py-0.5 shadow-xl backdrop-blur-sm"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <ToolbarButton title="Move toolbar" onClick={() => {}} className="cursor-grab text-slate-500">
        <GripHorizontal className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <div className="relative">
        <ToolbarButton title="Color" onClick={() => setColorOpen((v) => !v)} active={colorOpen}>
          <div className="flex flex-col items-center gap-0.5">
            <Pencil className="h-3.5 w-3.5" />
            <span className="h-1 w-5 rounded-full" style={{ backgroundColor: color }} />
          </div>
        </ToolbarButton>
        {colorOpen ? (
          <div className="absolute left-0 top-full z-20 mt-1 rounded-lg border border-[#434651] bg-[#1e222d] p-2 shadow-xl">
            <div className="grid grid-cols-5 gap-1.5">
              {DRAWING_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  title={preset}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    color === preset ? "border-white" : "border-transparent",
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => {
                    patchDrawing({ color: preset });
                    setColorOpen(false);
                  }}
                />
              ))}
            </div>
            <label className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              Custom
              <input
                type="color"
                value={color}
                className="h-6 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                onChange={(e) => patchDrawing({ color: e.target.value })}
              />
            </label>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <ToolbarButton title="Line thickness" onClick={() => setWidthOpen((v) => !v)} active={widthOpen}>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Minus className="h-3.5 w-3.5" />
            <span className="tabular-nums">{strokeWidth}px</span>
          </div>
        </ToolbarButton>
        {widthOpen ? (
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[72px] rounded-lg border border-[#434651] bg-[#1e222d] py-1 shadow-xl">
            {DRAWING_STROKE_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                className={cn(
                  "block w-full px-3 py-1.5 text-left text-[11px] tabular-nums hover:bg-[#363a45]",
                  strokeWidth === w && "text-[#62eec4]",
                )}
                onClick={() => {
                  patchDrawing({ strokeWidth: w });
                  setWidthOpen(false);
                }}
              >
                {w}px
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ToolbarButton title="Line style" onClick={cycleLineStyle} active={styleOpen}>
        <svg viewBox="0 0 16 4" className="h-3.5 w-5" aria-hidden>
          <line
            x1="0"
            y1="2"
            x2="16"
            y2="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={lineStyle === "dashed" ? "4 2" : lineStyle === "dotted" ? "1 2" : undefined}
          />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Settings" onClick={() => setStyleOpen((v) => !v)}>
        <Settings2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        title={locked ? "Unlock drawing" : "Lock drawing"}
        onClick={() => patchDrawing({ locked: !locked })}
        active={locked}
      >
        {locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
      </ToolbarButton>

      <ToolbarButton title="Delete drawing" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton title="More" onClick={onDismiss}>
        <MoreHorizontal className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
