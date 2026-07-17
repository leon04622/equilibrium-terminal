"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDICATOR_BY_ID } from "@/lib/charting/indicatorCatalog";
import { indicatorBaseType } from "@/lib/charting/indicatorInstances";
import {
  DEFAULT_INDICATOR_DISPLAY,
  defaultIndicatorDisplay,
  indicatorDisplayEqual,
  resolveIndicatorDisplay,
  type IndicatorDisplaySettings,
} from "@/lib/charting/indicatorDisplay";
import {
  defaultIndicatorParams,
  hasIndicatorSettings,
  paramSpecsFor,
  resolveIndicatorParams,
  type IndicatorParamValues,
} from "@/lib/charting/indicatorParams";
import { useChartToolsStore } from "@/store/useChartToolsStore";

type SettingsTab = "inputs" | "style" | "visibility";

const LINE_WIDTHS: Array<1 | 2 | 3> = [1, 2, 3];

export function IndicatorSettingsModal() {
  const targetId = useChartToolsStore((s) => s.settingsTargetId);
  const savedInputs = useChartToolsStore((s) =>
    targetId ? s.indicatorSettings[targetId] : undefined,
  );
  const savedDisplay = useChartToolsStore((s) =>
    targetId ? s.indicatorDisplay[targetId] : undefined,
  );
  const setTarget = useChartToolsStore((s) => s.setSettingsTarget);
  const updateSettings = useChartToolsStore((s) => s.updateIndicatorSettings);
  const updateDisplay = useChartToolsStore((s) => s.updateIndicatorDisplay);

  const meta = targetId ? INDICATOR_BY_ID[indicatorBaseType(targetId)] : null;
  const specs = targetId ? paramSpecsFor(indicatorBaseType(targetId)) : [];
  const [tab, setTab] = useState<SettingsTab>("inputs");
  const [draftInputs, setDraftInputs] = useState<IndicatorParamValues>({});
  const [draftDisplay, setDraftDisplay] = useState<IndicatorDisplaySettings>(DEFAULT_INDICATOR_DISPLAY);
  const [defaultsOpen, setDefaultsOpen] = useState(false);

  const apply = useCallback(() => {
    if (!targetId) return;
    if (hasIndicatorSettings(indicatorBaseType(targetId))) {
      updateSettings(targetId, draftInputs);
    }
    updateDisplay(targetId, draftDisplay);
    setTarget(null);
  }, [targetId, draftInputs, draftDisplay, updateSettings, updateDisplay, setTarget]);

  useEffect(() => {
    if (!targetId) return;
    const base = indicatorBaseType(targetId);
    const nextInputs = resolveIndicatorParams(base, savedInputs ?? defaultIndicatorParams(base));
    const nextDisplay = resolveIndicatorDisplay(targetId, savedDisplay);
    setDraftInputs((prev) =>
      JSON.stringify(prev) === JSON.stringify(nextInputs) ? prev : nextInputs,
    );
    setDraftDisplay((prev) => (indicatorDisplayEqual(prev, nextDisplay) ? prev : nextDisplay));
    setTab(hasIndicatorSettings(base) ? "inputs" : "style");
    setDefaultsOpen(false);
  }, [targetId, savedInputs, savedDisplay]);

  useEffect(() => {
    if (!targetId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTarget(null);
      if (e.key === "Enter") {
        e.preventDefault();
        apply();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [targetId, apply, setTarget]);

  if (!targetId || !meta) return null;

  const resetAll = () => {
    const base = indicatorBaseType(targetId);
    setDraftInputs(defaultIndicatorParams(base));
    setDraftDisplay(defaultIndicatorDisplay(targetId));
    setDefaultsOpen(false);
  };

  const shortName = meta.name.split(" ")[0] ?? meta.name;

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-black/55 pt-10"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) setTarget(null);
      }}
    >
      <div
        className="w-[min(94vw,380px)] overflow-hidden rounded-md border border-[#363a45] bg-[#1e222d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#363a45] px-4 py-3">
          <h3 className="text-[13px] font-medium text-slate-100">{shortName}</h3>
          <button
            type="button"
            onClick={() => setTarget(null)}
            className="rounded p-1 text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-[#363a45] px-2">
          {(["inputs", "style", "visibility"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-2 text-[11px] capitalize",
                tab === t
                  ? "border-b-2 border-white text-slate-100"
                  : "text-slate-500 hover:text-slate-300",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3 px-4 py-4">
          {tab === "inputs" ? (
            !hasIndicatorSettings(indicatorBaseType(targetId)) ? (
              <p className="text-[12px] text-slate-500">This indicator has no configurable inputs.</p>
            ) : (
              specs.map((spec) => (
                <label key={spec.key} className="block">
                  <span className="mb-1 block text-[11px] text-slate-400">{spec.label}</span>
                  <input
                    type="number"
                    min={spec.min}
                    max={spec.max}
                    step={spec.step ?? 1}
                    value={draftInputs[spec.key] ?? spec.default}
                    onChange={(e) => {
                      const n = Number.parseFloat(e.target.value);
                      setDraftInputs((prev) => ({
                        ...prev,
                        [spec.key]: Number.isFinite(n) ? n : spec.default,
                      }));
                    }}
                    className="w-full rounded border border-[#363a45] bg-[#131722] px-2.5 py-2 text-[13px] tabular-nums text-slate-100 outline-none focus:border-[#2962ff]/60"
                  />
                </label>
              ))
            )
          ) : null}

          {tab === "style" ? (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draftDisplay.visible}
                  onChange={(e) => setDraftDisplay((d) => ({ ...d, visible: e.target.checked }))}
                  className="rounded border-[#363a45]"
                />
                <span className="text-[11px] text-slate-300">Plot</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-400">Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draftDisplay.color ?? meta.color}
                    onChange={(e) => setDraftDisplay((d) => ({ ...d, color: e.target.value }))}
                    className="h-8 w-10 cursor-pointer rounded border border-[#363a45] bg-[#131722]"
                  />
                  <span className="text-[11px] tabular-nums text-slate-500">
                    {draftDisplay.color ?? meta.color}
                  </span>
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-400">Line width</span>
                <select
                  value={draftDisplay.lineWidth}
                  onChange={(e) =>
                    setDraftDisplay((d) => ({
                      ...d,
                      lineWidth: Number(e.target.value) as 1 | 2 | 3,
                    }))
                  }
                  className="w-full rounded border border-[#363a45] bg-[#131722] px-2.5 py-2 text-[13px] text-slate-100 outline-none focus:border-[#2962ff]/60"
                >
                  {LINE_WIDTHS.map((w) => (
                    <option key={w} value={w}>
                      {w}px
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}

          {tab === "visibility" ? (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draftDisplay.labelsOnScale}
                  onChange={(e) =>
                    setDraftDisplay((d) => ({ ...d, labelsOnScale: e.target.checked }))
                  }
                  className="rounded border-[#363a45]"
                />
                <span className="text-[11px] text-slate-300">Labels on price scale</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draftDisplay.valuesInLegend}
                  onChange={(e) =>
                    setDraftDisplay((d) => ({ ...d, valuesInLegend: e.target.checked }))
                  }
                  className="rounded border-[#363a45]"
                />
                <span className="text-[11px] text-slate-300">Values in status line</span>
              </label>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#363a45] px-4 py-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDefaultsOpen((o) => !o)}
              className="flex items-center gap-1 rounded px-2 py-1.5 text-[11px] text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            >
              Defaults
              <ChevronDown className="h-3 w-3" />
            </button>
            {defaultsOpen ? (
              <div className="absolute bottom-full left-0 mb-1 min-w-[140px] rounded border border-[#363a45] bg-[#1e222d] py-1 shadow-lg">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-[11px] text-slate-400 hover:bg-[#2a2e39] hover:text-slate-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset settings
                </button>
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget(null)}
              className="rounded px-3 py-1.5 text-[11px] text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              className={cn(
                "rounded bg-[#2962ff]/90 px-3 py-1.5 text-[11px] font-medium text-white",
                "hover:bg-[#2962ff]",
              )}
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
