"use client";

import { cn } from "@/lib/utils";
import { DENSITY_PRESETS, type TerminalDensity } from "@/lib/theme/institutional";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

const DENSITIES: TerminalDensity[] = ["compact", "standard", "comfortable"];

export function TerminalExperienceBar() {
  const density = useTerminalExperienceStore((s) => s.density);
  const calmMode = useTerminalExperienceStore((s) => s.calmMode);
  const reducedMotion = useTerminalExperienceStore((s) => s.reducedMotion);
  const setDensity = useTerminalExperienceStore((s) => s.setDensity);
  const setCalmMode = useTerminalExperienceStore((s) => s.setCalmMode);
  const setReducedMotion = useTerminalExperienceStore((s) => s.setReducedMotion);

  return (
    <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 pl-2">
      <select
        value={density}
        onChange={(e) => setDensity(e.target.value as TerminalDensity)}
        className={cn(TERMINAL_TYPO.micro, "max-w-[5.5rem] border-0 bg-transparent py-0 text-slate-500 outline-none")}
        title="Panel density"
      >
        {DENSITIES.map((d) => (
          <option key={d} value={d}>
            {DENSITY_PRESETS[d].label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCalmMode(!calmMode)}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          calmMode ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title="Calm mode — suppress aggressive flashes"
      >
        CALM
      </button>
      <button
        type="button"
        onClick={() => setReducedMotion(!reducedMotion)}
        className={cn(
          TERMINAL_TYPO.micro,
          "hidden px-1 py-0.5 sm:inline",
          reducedMotion ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title="Reduced motion"
      >
        MOTION
      </button>
    </div>
  );
}
