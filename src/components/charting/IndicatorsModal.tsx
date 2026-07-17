"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Settings2, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { IndicatorIcon } from "@/components/charting/IndicatorIcon";
import {
  INDICATOR_CATALOG,
  INDICATOR_MODAL_TABS,
  sortIndicatorsForModal,
  type IndicatorCategory,
} from "@/lib/charting/indicatorCatalog";
import { hasIndicatorSettings } from "@/lib/charting/indicatorParams";
import {
  allowsMultipleInstances,
  countIndicatorInstances,
  findIndicatorInstance,
  indicatorBaseType,
} from "@/lib/charting/indicatorInstances";
import { useChartToolsStore } from "@/store/useChartToolsStore";

type IndicatorTab = IndicatorCategory | "favorites" | "all";

export function IndicatorsModal() {
  const open = useChartToolsStore((s) => s.indicatorsModalOpen);
  const active = useChartToolsStore((s) => s.indicators);
  const favorites = useChartToolsStore((s) => s.favorites);
  const setOpen = useChartToolsStore((s) => s.setIndicatorsModalOpen);
  const setSettingsTarget = useChartToolsStore((s) => s.setSettingsTarget);
  const addIndicator = useChartToolsStore((s) => s.addIndicator);
  const removeIndicator = useChartToolsStore((s) => s.removeIndicator);
  const toggleFavorite = useChartToolsStore((s) => s.toggleFavorite);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<IndicatorTab>("popular");
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(
    () => sortIndicatorsForModal(INDICATOR_CATALOG, favorites, query, tab),
    [favorites, query, tab],
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTab("popular");
    queueMicrotask(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const favSet = new Set(favorites);
  const instanceCount = (baseId: string) => countIndicatorInstances(active, baseId);

  const handleIndicatorClick = (defId: string) => {
    if (!allowsMultipleInstances(defId)) {
      const existing = findIndicatorInstance(active, defId);
      if (existing) {
        removeIndicator(existing);
        return;
      }
    }
    addIndicator(defId);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-start justify-center bg-black/55 pt-4"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="flex max-h-[min(80vh,620px)] w-[min(96vw,480px)] flex-col overflow-hidden rounded-lg border border-[#363a45] bg-[#1e222d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#363a45] px-4 py-3">
          <h3 className="text-[14px] font-medium text-slate-100">Indicators</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-[#363a45] px-4 py-2.5">
          <div className="flex items-center gap-2 rounded border border-[#363a45] bg-[#131722] px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search indicators"
              className="w-full bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#363a45] px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {INDICATOR_MODAL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                tab === t.id
                  ? "bg-[#2962ff]/25 text-[#5b9cf6]"
                  : "text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 [scrollbar-width:thin]">
          {sorted.length === 0 ? (
            <p className="px-3 py-6 text-center text-[12px] text-slate-500">No indicators match your search.</p>
          ) : (
            sorted.map((def) => {
              const isFav = favSet.has(def.id);
              const count = instanceCount(def.id);
              const isActive = count > 0;
              const latestInstance = [...active].reverse().find((id) => indicatorBaseType(id) === def.id);

              return (
                <div
                  key={def.id}
                  className={cn(
                    "group flex items-center gap-2 rounded px-2 py-2",
                    def.implemented ? "hover:bg-[#2a2e39]/90" : "opacity-45",
                    isActive && "bg-[#2962ff]/12",
                  )}
                >
                  <IndicatorIcon def={def} />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(def.id)}
                    className="shrink-0 rounded p-0.5 text-slate-600 hover:text-orange-400"
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={cn("h-3.5 w-3.5", isFav ? "fill-orange-400 text-orange-400" : "")} />
                  </button>
                  <button
                    type="button"
                    disabled={!def.implemented}
                    onClick={() => {
                      if (def.implemented) handleIndicatorClick(def.id);
                    }}
                    className={cn(
                      "min-w-0 flex-1 text-left text-[13px] leading-snug",
                      isActive ? "text-[#5b9cf6]" : "text-slate-200",
                      !def.implemented && "cursor-not-allowed",
                    )}
                    title={def.description ?? def.name}
                  >
                    {def.name}
                    {!def.implemented ? (
                      <span className="ml-1.5 text-[10px] text-slate-600">(soon)</span>
                    ) : null}
                  </button>
                  {isActive && hasIndicatorSettings(def.id) && latestInstance ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setSettingsTarget(latestInstance);
                      }}
                      className="shrink-0 rounded p-0.5 text-slate-500 hover:bg-[#2a2e39] hover:text-[#5b9cf6]"
                      title="Indicator settings"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                  {isActive ? (
                    <span className="shrink-0 rounded bg-[#2962ff]/20 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#5b9cf6]">
                      {count > 1 ? `×${count}` : "On"}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function IndicatorsToolbarButton() {
  const setOpen = useChartToolsStore((s) => s.setIndicatorsModalOpen);
  const count = useChartToolsStore((s) => s.indicators.length);
  const active = count > 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "ml-auto flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-[#2962ff]/50 bg-[#2962ff]/20 text-[#5b9cf6] hover:bg-[#2962ff]/30"
          : "border-[#363a45] bg-[#1e222d] text-slate-200 hover:border-[#2962ff]/40 hover:bg-[#2a2e39] hover:text-white",
      )}
      title="Add or manage chart indicators"
    >
      <span
        className={cn(
          "font-serif text-[14px] italic leading-none",
          active ? "text-[#5b9cf6]" : "text-slate-300",
        )}
      >
        ƒx
      </span>
      <span>Indicators</span>
      {active ? (
        <span className="rounded bg-[#2962ff]/25 px-1.5 py-0.5 text-[10px] tabular-nums text-[#5b9cf6]">
          {count}
        </span>
      ) : null}
    </button>
  );
}
