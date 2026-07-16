"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Circle,
  Crosshair,
  Eye,
  EyeOff,
  GripHorizontal,
  Lock,
  Magnet,
  Minus,
  MousePointer2,
  PenLine,
  Ruler,
  Shapes,
  Smile,
  Star,
  Trash2,
  TrendingUp,
  Type,
  ZoomIn,
} from "lucide-react";
import {
  DRAWING_CATEGORIES,
  MAGNET_MENU,
  categoryForDrawTool,
  type DrawingCategoryId,
  type DrawingToolItem,
} from "@/lib/charting/drawingToolCatalog";
import { cn } from "@/lib/utils";
import type { ChartDrawTool, MagnetMode } from "@/types/chart-tools";
import { useChartToolsStore } from "@/store/useChartToolsStore";

type FlyoutKind = DrawingCategoryId | "magnet";

const CATEGORY_ICONS: Record<DrawingCategoryId, ReactNode> = {
  cursor: <Crosshair className="h-4 w-4" />,
  trendline: <TrendingUp className="h-4 w-4 -rotate-45" />,
  fibonacci: <GripHorizontal className="h-4 w-4" />,
  shapes: <Shapes className="h-4 w-4" />,
  annotation: <Type className="h-4 w-4" />,
  patterns: <MousePointer2 className="h-4 w-4" />,
  prediction: <Ruler className="h-4 w-4 rotate-90" />,
  icons: <Smile className="h-4 w-4" />,
};

function toolIcon(item: DrawingToolItem): ReactNode {
  if (item.id.includes("hline") || item.id.includes("hray")) {
    return <Minus className="h-3.5 w-3.5" />;
  }
  if (item.id.includes("vline")) {
    return <Minus className="h-3.5 w-3.5 rotate-90" />;
  }
  if (item.id.includes("trend") || item.id === "line-ray") {
    return <TrendingUp className="h-3.5 w-3.5 -rotate-45" />;
  }
  if (item.id.startsWith("cursor")) {
    if (item.id.includes("dot")) return <Circle className="h-3.5 w-3.5" />;
    return <Crosshair className="h-3.5 w-3.5" />;
  }
  return <TrendingUp className="h-3.5 w-3.5 -rotate-45" />;
}

function RailButton({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
        active
          ? "bg-[#62eec4]/20 text-[#62eec4]"
          : "text-slate-400 hover:bg-[#2a2e39] hover:text-slate-100",
      )}
    >
      {children}
    </button>
  );
}

function FlyoutRow({
  item,
  active,
  favorite,
  onSelect,
  onToggleFavorite,
}: {
  item: DrawingToolItem;
  active: boolean;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  const disabled = !item.implemented;
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) onSelect();
      }}
      className={cn(
        "group flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] transition-colors",
        active && "bg-[#62eec4]/25 text-white",
        !active && !disabled && "cursor-pointer text-slate-200 hover:bg-[#363a45]",
        disabled && "cursor-not-allowed text-slate-500 opacity-60",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-300">
        {toolIcon(item)}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.shortcut ? (
        <span className="shrink-0 text-[10px] text-slate-500">{item.shortcut}</span>
      ) : null}
      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={cn(
          "shrink-0 rounded p-0.5 text-slate-500 opacity-0 transition-opacity hover:text-[#f5c84c] group-hover:opacity-100",
          favorite && "text-[#f5c84c] opacity-100",
        )}
        aria-label={favorite ? "Remove favorite" : "Add favorite"}
      >
        <Star className={cn("h-3 w-3", favorite && "fill-current")} />
      </button>
    </div>
  );
}

function ToolFlyout({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const t = window.setTimeout(() => document.addEventListener("mousedown", onDoc), 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-full top-0 z-30 ml-0.5 max-h-[min(70vh,520px)] w-56 overflow-y-auto rounded border border-[#363a45] bg-[#1e222d] py-1 shadow-xl"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b border-[#363a45] px-2.5 py-1.5 text-[11px] font-medium text-slate-300">
        {title}
      </div>
      {children}
    </div>
  );
}

export function ChartDrawingToolbar({ coin }: { coin: string }) {
  const drawTool = useChartToolsStore((s) => s.drawTool);
  const prefs = useChartToolsStore((s) => s.drawingPrefs);
  const favorites = useChartToolsStore((s) => s.drawingFavorites);
  const drawingCount = useChartToolsStore((s) => s.drawingsByCoin[coin]?.length ?? 0);
  const setDrawTool = useChartToolsStore((s) => s.setDrawTool);
  const toggleDrawingPref = useChartToolsStore((s) => s.toggleDrawingPref);
  const setMagnetMode = useChartToolsStore((s) => s.setMagnetMode);
  const toggleDrawingFavorite = useChartToolsStore((s) => s.toggleDrawingFavorite);
  const clearDrawings = useChartToolsStore((s) => s.clearDrawings);

  const [openFlyout, setOpenFlyout] = useState<FlyoutKind | null>(null);
  const activeCategory = categoryForDrawTool(drawTool);

  const selectTool = (item: DrawingToolItem) => {
    if (!item.implemented) return;
    if (item.magnetMode) {
      setMagnetMode(item.magnetMode);
      setOpenFlyout("magnet");
      return;
    }
    setDrawTool(item.drawTool ?? "none");
    setOpenFlyout(null);
  };

  const toggleCategory = (id: DrawingCategoryId) => {
    setOpenFlyout((cur) => (cur === id ? null : id));
  };

  return (
    <div
      className="relative flex w-9 shrink-0 flex-col items-center gap-0.5 border-r border-[#2a2e39] bg-[#131722] py-1"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {DRAWING_CATEGORIES.map((category) => (
        <div key={category.id} className="relative">
          <RailButton
            active={openFlyout === category.id || activeCategory === category.id}
            title={category.label}
            onClick={() => toggleCategory(category.id)}
          >
            {CATEGORY_ICONS[category.id]}
          </RailButton>

          {openFlyout === category.id ? (
            <ToolFlyout title={category.label} onClose={() => setOpenFlyout(null)}>
              {category.sections.map((section, si) => (
                <div key={`${category.id}-${si}`}>
                  {section.title ? (
                    <div className="px-2.5 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {section.title}
                    </div>
                  ) : null}
                  {section.items.map((item) => (
                    <FlyoutRow
                      key={item.id}
                      item={item}
                      active={drawTool === (item.drawTool ?? item.id)}
                      favorite={favorites.includes(item.id)}
                      onSelect={() => selectTool(item)}
                      onToggleFavorite={() => toggleDrawingFavorite(item.id)}
                    />
                  ))}
                </div>
              ))}
            </ToolFlyout>
          ) : null}
        </div>
      ))}

      <div className="my-1 h-px w-6 bg-[#2a2e39]" />

      <RailButton title="Measure" onClick={() => setDrawTool(drawTool === "pred-measure" ? "none" : "pred-measure")}>
        <Ruler className="h-4 w-4" />
      </RailButton>
      <RailButton title="Zoom in" onClick={() => setDrawTool(drawTool === "zoom" ? "none" : "zoom")}>
        <ZoomIn className="h-4 w-4" />
      </RailButton>

      <div className="my-1 h-px w-6 bg-[#2a2e39]" />

      <div className="relative">
        <RailButton
          active={openFlyout === "magnet" || prefs.magnetMode !== "off"}
          title="Magnets"
          onClick={() => setOpenFlyout((cur) => (cur === "magnet" ? null : "magnet"))}
        >
          <Magnet className="h-4 w-4" />
        </RailButton>
        {openFlyout === "magnet" ? (
          <ToolFlyout title="Magnets" onClose={() => setOpenFlyout(null)}>
            {MAGNET_MENU.map((item) => (
              <FlyoutRow
                key={item.id}
                item={item}
                active={prefs.magnetMode === item.magnetMode}
                favorite={favorites.includes(item.id)}
                onSelect={() => selectTool(item)}
                onToggleFavorite={() => toggleDrawingFavorite(item.id)}
              />
            ))}
          </ToolFlyout>
        ) : null}
      </div>

      <RailButton
        active={prefs.stayInDrawingMode}
        title="Stay in drawing mode"
        onClick={() => toggleDrawingPref("stayInDrawingMode")}
      >
        <PenLine className="h-4 w-4" />
      </RailButton>
      <RailButton
        active={prefs.lockDrawings}
        title="Lock all drawings"
        onClick={() => toggleDrawingPref("lockDrawings")}
      >
        <Lock className="h-4 w-4" />
      </RailButton>
      <RailButton
        active={prefs.hideDrawings}
        title={prefs.hideDrawings ? "Show drawings" : "Hide drawings"}
        onClick={() => toggleDrawingPref("hideDrawings")}
      >
        {prefs.hideDrawings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </RailButton>
      <RailButton
        title={`Remove drawings (${drawingCount})`}
        onClick={() => {
          if (drawingCount > 0) clearDrawings(coin);
        }}
      >
        <Trash2 className={cn("h-4 w-4", drawingCount === 0 && "opacity-40")} />
      </RailButton>
    </div>
  );
}
