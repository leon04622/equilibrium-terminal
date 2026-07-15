"use client";

import { useEffect } from "react";
import { DENSITY_PRESETS } from "@/lib/theme/institutional";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

/** Applies institutional experience prefs to document root. */
export function useTerminalExperience(enabled = true): void {
  const density = useTerminalExperienceStore((s) => s.density);
  const calmMode = useTerminalExperienceStore((s) => s.calmMode);
  const reducedMotion = useTerminalExperienceStore((s) => s.reducedMotion);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);

  useEffect(() => {
    if (!enabled) return;
    useTerminalExperienceStore.getState().hydrate();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const root = document.documentElement;
    const preset = DENSITY_PRESETS[density];
    root.dataset.eqDensity = density;
    root.dataset.eqCalm = calmMode ? "1" : "0";
    root.dataset.eqReducedMotion = reducedMotion ? "1" : "0";
    root.dataset.eqBloomberg = beginnerMode ? "0" : "1";
    root.style.setProperty("--eq-row-h", `${preset.rowH}px`);
    root.style.setProperty("--eq-grid-row", `${preset.gridRowHeight}px`);
    return () => {
      delete root.dataset.eqDensity;
      delete root.dataset.eqCalm;
      delete root.dataset.eqReducedMotion;
      delete root.dataset.eqBloomberg;
    };
  }, [enabled, density, calmMode, reducedMotion, beginnerMode]);
}
