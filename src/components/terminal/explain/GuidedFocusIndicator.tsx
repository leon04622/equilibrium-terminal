"use client";

import { useEffect } from "react";
import { Crosshair, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

/**
 * PHASE 1/9 — a subtle, always-visible affordance while Guided Focus is engaged.
 * Keeps the immersion (no modal, no retail tutorial chrome) while giving the
 * operator one obvious, keyboard-friendly way out.
 */
export function GuidedFocusIndicator() {
  const focusModeActive = useOperatorGuideStore((s) => s.focusModeActive);
  const activeLessonPanelId = useOperatorGuideStore((s) => s.activeLessonPanelId);

  const exit = () => {
    const s = useOperatorGuideStore.getState();
    if (s.activeLessonPanelId) s.endLesson();
    else s.setFocusMode(false);
  };

  useEffect(() => {
    if (!focusModeActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusModeActive]);

  if (!focusModeActive) return null;

  return (
    <button
      type="button"
      onClick={exit}
      className={cn(
        TERMINAL_TYPO.micro,
        "fixed left-1/2 top-[78px] z-[130] flex -translate-x-1/2 items-center gap-1.5 border border-cyan-600/60 bg-slate-950/90 px-2.5 py-1 text-cyan-200 shadow-[0_0_20px_rgba(0,229,255,0.18)] backdrop-blur-sm hover:bg-slate-900",
      )}
      title="Exit Guided Focus"
    >
      <Crosshair className="h-3 w-3 animate-pulse" />
      <span className="tracking-wide">
        GUIDED FOCUS{activeLessonPanelId ? " · LESSON" : ""}
      </span>
      <span className="text-slate-500">— Esc to exit</span>
      <X className="h-3 w-3" />
    </button>
  );
}
