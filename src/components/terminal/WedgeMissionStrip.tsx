"use client";

import { getCurrentPhase } from "@/lib/roadmap/ExecutionRoadmap";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useWedgeStore } from "@/store/useWedgeStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";

/** One-line mission context when V1 wedge layout is active (plain-English mode). */
export function WedgeMissionStrip() {
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const setDeskFocusMode = useWedgeStore((s) => s.setDeskFocusMode);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const operatorActive = useOperatorModeStore((s) => s.active);
  if (!deskFocusMode || !beginnerMode || operatorActive) return null;

  const phase = getCurrentPhase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 border-b border-slate-800/80 bg-slate-950/90 px-2 py-0.5",
        TERMINAL_TYPO.micro,
        "text-slate-500",
      )}
    >
      <span className={terminalSkin.textUp}>90D · P{phase.id}</span>
      <span className="text-slate-600">·</span>
      <span>
        {phase.name} — HL execution + intel wedge (days {phase.days})
      </span>
      <button
        type="button"
        onClick={() => setDeskFocusMode(false)}
        className={cn(
          "ml-auto border border-slate-700 px-1.5 py-0 text-cyan-500 hover:border-cyan-800 hover:bg-slate-900",
        )}
      >
        EXPAND PLATFORM
      </button>
    </div>
  );
}
