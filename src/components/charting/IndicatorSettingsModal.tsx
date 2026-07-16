"use client";

import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultIndicatorParams,
  hasIndicatorSettings,
  paramSpecsFor,
  resolveIndicatorParams,
  type IndicatorParamValues,
} from "@/lib/charting/indicatorParams";
import { INDICATOR_BY_ID } from "@/lib/charting/indicatorCatalog";
import { useChartToolsStore } from "@/store/useChartToolsStore";

export function IndicatorSettingsModal() {
  const targetId = useChartToolsStore((s) => s.settingsTargetId);
  const saved = useChartToolsStore((s) =>
    targetId ? s.indicatorSettings[targetId] : undefined,
  );
  const setTarget = useChartToolsStore((s) => s.setSettingsTarget);
  const updateSettings = useChartToolsStore((s) => s.updateIndicatorSettings);

  const meta = targetId ? INDICATOR_BY_ID[targetId] : null;
  const specs = targetId ? paramSpecsFor(targetId) : [];
  const [draft, setDraft] = useState<IndicatorParamValues>({});

  useEffect(() => {
    if (!targetId) return;
    setDraft(resolveIndicatorParams(targetId, saved ?? defaultIndicatorParams(targetId)));
  }, [targetId, saved]);

  useEffect(() => {
    if (!targetId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTarget(null);
      if (e.key === "Enter" && hasIndicatorSettings(targetId)) {
        e.preventDefault();
        updateSettings(targetId, draft);
        setTarget(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [targetId, draft, setTarget, updateSettings]);

  if (!targetId || !meta) return null;

  const apply = () => {
    updateSettings(targetId, draft);
    setTarget(null);
  };

  const resetDefaults = () => {
    setDraft(defaultIndicatorParams(targetId));
  };

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
        className="w-[min(94vw,340px)] overflow-hidden rounded-md border border-[#363a45] bg-[#1e222d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#363a45] px-4 py-3">
          <div>
            <h3 className="text-[13px] font-medium text-slate-100">{meta.name}</h3>
            <p className="text-[10px] text-slate-500">Inputs — press Enter to apply</p>
          </div>
          <button
            type="button"
            onClick={() => setTarget(null)}
            className="rounded p-1 text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          {!hasIndicatorSettings(targetId) ? (
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
                  value={draft[spec.key] ?? spec.default}
                  onChange={(e) => {
                    const n = Number.parseFloat(e.target.value);
                    setDraft((prev) => ({
                      ...prev,
                      [spec.key]: Number.isFinite(n) ? n : spec.default,
                    }));
                  }}
                  className="w-full rounded border border-[#363a45] bg-[#131722] px-2.5 py-2 text-[13px] tabular-nums text-slate-100 outline-none focus:border-[#2962ff]/60"
                />
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#363a45] px-4 py-3">
          {hasIndicatorSettings(targetId) ? (
            <button
              type="button"
              onClick={resetDefaults}
              className="flex items-center gap-1 rounded px-2 py-1.5 text-[11px] text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget(null)}
              className="rounded px-3 py-1.5 text-[11px] text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            >
              Cancel
            </button>
            {hasIndicatorSettings(targetId) ? (
              <button
                type="button"
                onClick={apply}
                className={cn(
                  "rounded bg-[#2962ff]/90 px-3 py-1.5 text-[11px] font-medium text-white",
                  "hover:bg-[#2962ff]",
                )}
              >
                Apply
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
