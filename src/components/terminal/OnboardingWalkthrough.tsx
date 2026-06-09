"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useCommercialStore } from "@/store/useCommercialStore";
import type { OnboardingStepId } from "@/types/commercial-product";

export function OnboardingWalkthrough() {
  const open = useCommercialStore((s) => s.walkthroughOpen);
  const setWalkthroughOpen = useCommercialStore((s) => s.setWalkthroughOpen);
  const snapshot = useCommercialStore((s) => s.snapshot);

  const steps = snapshot?.onboarding ?? OnboardingEngine.steps();
  const current = useMemo(() => steps.find((s) => !s.completed) ?? steps[steps.length - 1], [steps]);
  const pct = OnboardingEngine.completionPct();

  if (!open || !current) return null;

  const advance = (id: OnboardingStepId) => {
    OnboardingEngine.completeStep(id);
    useCommercialStore.getState().setSnapshot(CommercialOrchestrator.snapshot());
    const nextPct = OnboardingEngine.completionPct();
    if (id === "complete" || nextPct >= 100) {
      OnboardingEngine.completeStep("complete");
      setWalkthroughOpen(false);
    }
  };

  const dismiss = () => {
    OnboardingEngine.dismiss();
    setWalkthroughOpen(false);
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center p-2 sm:items-center"
      role="dialog"
      aria-label="Onboarding"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md border border-slate-700 bg-slate-950/95 shadow-2xl",
          terminalSkin.border,
        )}
      >
        <header className={cn(terminalSkin.borderB, "flex items-center justify-between px-2 py-1")}>
          <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>INSTITUTIONAL ONBOARDING</span>
          <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{pct}%</span>
        </header>
        <div className="px-2 py-2">
          <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-200")}>{current.title}</p>
          <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-500")}>{current.detail}</p>
          <div className="mt-2 h-0.5 bg-slate-800">
            <div className="h-full bg-cyan-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <footer className={cn(terminalSkin.borderT, "flex gap-1 p-1")}>
          <button
            type="button"
            onClick={() => advance(current.id)}
            className={cn(INSTITUTIONAL_INTERACTION.tabButton, "flex-1 text-cyan-300")}
          >
            {current.id === "complete" ? "FINISH" : "CONTINUE"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className={cn(INSTITUTIONAL_INTERACTION.tabButton, "text-slate-600")}
          >
            DISMISS
          </button>
        </footer>
      </div>
    </div>
  );
}
