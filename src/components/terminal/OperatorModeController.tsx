"use client";

import { useEffect } from "react";
import { ClipboardList, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { terminalBus } from "@/store/eventBus";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useLearningAcademyStore } from "@/store/useLearningAcademyStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { WhatIsThisCard } from "@/components/beginner/WhatIsThisCard";

const OPERATOR_PANEL_ID = "operatormode";

/** Side effects: pro sync, widget auto-complete, panel visibility, lite welcome. */
export function OperatorModeController() {
  const showLiteWelcome = useOperatorModeStore((s) => s.showLiteWelcome);
  const hydrate = useOperatorModeStore((s) => s.hydrate);
  const syncPro = useOperatorModeStore((s) => s.syncProFromAcademy);
  const onWidgetFocused = useOperatorModeStore((s) => s.onWidgetFocused);
  const dismissLiteWelcome = useOperatorModeStore((s) => s.dismissLiteWelcome);
  const startTodayWorkflow = useOperatorModeStore((s) => s.startTodayWorkflow);
  const progressVersion = useLearningAcademyStore((s) => s.progressVersion);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);

  useEffect(() => {
    hydrate();
    syncPro();
  }, [hydrate, syncPro, progressVersion]);

  useEffect(() => {
    const off = terminalBus.on("widget:focus", ({ widgetId }) => {
      onWidgetFocused(widgetId);
    });
    return off;
  }, [onWidgetFocused]);

  useEffect(() => {
    useAdaptiveWorkspaceStore.setState((s) => {
      if (!s.hiddenPanelIds.includes(OPERATOR_PANEL_ID)) return s;
      return { hiddenPanelIds: s.hiddenPanelIds.filter((id) => id !== OPERATOR_PANEL_ID) };
    });
  }, []);

  if (!showLiteWelcome || !beginnerMode) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[195] flex items-center justify-center bg-slate-950/70 p-4">
      <div
        className="pointer-events-auto w-full max-w-md border border-violet-700/60 bg-slate-950 shadow-2xl"
        role="dialog"
        aria-label="Operator Mode Lite"
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
          <span className={cn(TERMINAL_TYPO.label, "text-violet-200")}>
            {beginnerMode ? "DAILY CHECKLIST" : "OPERATOR MODE LITE"}
          </span>
          <button type="button" onClick={dismissLiteWelcome} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="px-3 py-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-violet-400" />
            <p className="font-mono text-sm text-slate-100">
              {beginnerMode
                ? "Your daily to-do list before trading — plain English, step by step."
                : "Your daily operating system — available now."}
            </p>
          </div>
          {beginnerMode ? <WhatIsThisCard conceptId="operator-mode" className="mt-2" /> : null}
          <p className="mt-2 font-mono text-[10px] leading-snug text-slate-500">
            {beginnerMode
              ? "Morning steps: briefing → conditions → routine → live desk → trade plan. Lessons later unlock extra checks — optional."
              : "Morning workflow: briefing, market state, daily ops, live desk, execution plan. Academy lessons unlock advanced trading checks and session review — they enhance Operator Mode, not gate it."}
          </p>
        </div>
        <footer className="flex gap-1 border-t border-slate-800 p-2">
          <button
            type="button"
            onClick={() => {
              startTodayWorkflow();
              terminalBus.emit("widget:focus", { widgetId: OPERATOR_PANEL_ID });
            }}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex flex-1 items-center justify-center gap-1 border border-violet-700/50 bg-violet-950/40 py-1.5 text-violet-100",
            )}
          >
            <Play className="h-3 w-3" />
            START TODAY&apos;S WORKFLOW
          </button>
        </footer>
      </div>
    </div>
  );
}
