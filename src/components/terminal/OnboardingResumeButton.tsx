"use client";

import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useCommercialStore } from "@/store/useCommercialStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

/** Prominent onboarding recovery — plain-English mode only. */
export function OnboardingResumeButton() {
  const setWalkthroughOpen = useCommercialStore((s) => s.setWalkthroughOpen);
  const setSnapshot = useCommercialStore((s) => s.setSnapshot);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);

  if (!beginnerMode || !OnboardingEngine.shouldShowResumeHint()) return null;

  const pct = OnboardingEngine.completionPct();

  return (
    <button
      type="button"
      onClick={() => {
        OnboardingEngine.resumeWalkthrough();
        setSnapshot(CommercialOrchestrator.snapshot());
        setWalkthroughOpen(true);
      }}
      className={cn(
        TERMINAL_TYPO.micro,
        "flex shrink-0 items-center gap-1 border border-cyan-700/50 bg-cyan-950/30 px-1.5 py-0.5 text-cyan-200 hover:bg-cyan-950/50",
      )}
      title="Resume institutional onboarding"
    >
      <Compass className="h-3 w-3" />
      <span className="hidden sm:inline">GUIDE</span>
      <span className="tabular-nums text-cyan-400/80">{pct}%</span>
    </button>
  );
}
