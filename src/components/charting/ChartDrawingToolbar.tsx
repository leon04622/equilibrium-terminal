"use client";

import type { ReactNode } from "react";
import {
  Crosshair,
  Eye,
  EyeOff,
  GripHorizontal,
  Lock,
  Magnet,
  Minus,
  PenLine,
  Ruler,
  Trash2,
  TrendingUp,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartDrawTool } from "@/types/chart-tools";
import { useChartToolsStore } from "@/store/useChartToolsStore";

interface ToolDef {
  id: ChartDrawTool;
  icon: ReactNode;
  label: string;
  enabled?: boolean;
}

const DRAW_TOOLS: ToolDef[] = [
  { id: "crosshair", icon: <Crosshair className="h-3.5 w-3.5" />, label: "Crosshair" },
  { id: "trendline", icon: <TrendingUp className="h-3.5 w-3.5 -rotate-45" />, label: "Trend line" },
  { id: "hline", icon: <Minus className="h-3.5 w-3.5" />, label: "Horizontal line" },
  { id: "parallel", icon: <GripHorizontal className="h-3.5 w-3.5" />, label: "Parallel channel (soon)", enabled: false },
  { id: "text", icon: <Type className="h-3.5 w-3.5" />, label: "Text (soon)", enabled: false },
  { id: "measure", icon: <Ruler className="h-3.5 w-3.5" />, label: "Measure (soon)", enabled: false },
];

function ToolButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        active
          ? "bg-[#2962ff]/25 text-[#5b9cf6]"
          : "text-slate-400 hover:bg-[#2a2e39] hover:text-slate-200",
        disabled && "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-slate-400",
      )}
    >
      {children}
    </button>
  );
}

export function ChartDrawingToolbar({ coin }: { coin: string }) {
  const drawTool = useChartToolsStore((s) => s.drawTool);
  const prefs = useChartToolsStore((s) => s.drawingPrefs);
  const hlineCount = useChartToolsStore((s) => s.linesByCoin[coin]?.length ?? 0);
  const trendCount = useChartToolsStore((s) => s.trendLinesByCoin[coin]?.length ?? 0);
  const setDrawTool = useChartToolsStore((s) => s.setDrawTool);
  const toggleDrawingPref = useChartToolsStore((s) => s.toggleDrawingPref);
  const clearDrawings = useChartToolsStore((s) => s.clearDrawings);

  const drawingCount = hlineCount + trendCount;

  const selectTool = (tool: ChartDrawTool) => {
    if (tool === "crosshair") {
      setDrawTool("none");
      return;
    }
    setDrawTool(drawTool === tool ? "none" : tool);
  };

  return (
    <div
      className="flex w-8 shrink-0 flex-col items-center gap-0.5 border-r border-[#2a2e39] bg-[#131722] py-1"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {DRAW_TOOLS.map((tool) => (
        <ToolButton
          key={tool.id}
          active={
            tool.id === "crosshair"
              ? drawTool === "none"
              : drawTool === tool.id
          }
          disabled={tool.enabled === false}
          title={tool.label}
          onClick={() => {
            if (tool.enabled === false) return;
            selectTool(tool.id);
          }}
        >
          {tool.icon}
        </ToolButton>
      ))}

      <div className="my-1 h-px w-5 bg-[#2a2e39]" />

      <ToolButton
        active={prefs.magnet}
        title="Magnet — snap to OHLC"
        onClick={() => toggleDrawingPref("magnet")}
      >
        <Magnet className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={prefs.stayInDrawingMode}
        title="Stay in drawing mode"
        onClick={() => toggleDrawingPref("stayInDrawingMode")}
      >
        <PenLine className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={prefs.lockDrawings}
        title="Lock drawings"
        onClick={() => toggleDrawingPref("lockDrawings")}
      >
        <Lock className="h-3.5 w-3.5" />
      </ToolButton>
      <ToolButton
        active={prefs.hideDrawings}
        title={prefs.hideDrawings ? "Show drawings" : "Hide drawings"}
        onClick={() => toggleDrawingPref("hideDrawings")}
      >
        {prefs.hideDrawings ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </ToolButton>
      <ToolButton
        disabled={drawingCount === 0}
        title={`Delete all drawings (${drawingCount})`}
        onClick={() => clearDrawings(coin)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </ToolButton>
    </div>
  );
}
