"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { FIRST_FIFTEEN_MINUTES } from "@/lib/beginner/beginnerTranslation";
import { terminalBus } from "@/store/eventBus";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

const STORAGE_KEY = "eq-first-15-seen-v1";

export function FirstFifteenMinutesWelcome() {
  const [open, setOpen] = useState(false);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);

  useEffect(() => {
    if (typeof window === "undefined" || !beginnerMode) return;
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, [beginnerMode]);

  if (!beginnerMode || !open) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const startOperator = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    useOperatorModeStore.getState().activateLite();
    terminalBus.emit("widget:focus", { widgetId: "operatormode" });
    setOpen(false);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/75 p-4">
      <div
        className="pointer-events-auto w-full max-w-lg border border-cyan-700/50 bg-slate-950 shadow-2xl"
        role="dialog"
        aria-label="First 15 minutes"
      >
        <header className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
          <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>{FIRST_FIFTEEN_MINUTES.title}</span>
          <button type="button" onClick={dismiss} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-3 py-2">
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
            Plain-English answers — no trading experience required.
          </p>
          <ul className="mt-2 space-y-2">
            {FIRST_FIFTEEN_MINUTES.sections.map((s) => (
              <li key={s.q} className="border border-slate-800/80 bg-slate-900/40 p-2">
                <p className={cn(TERMINAL_TYPO.micro, "font-semibold text-slate-200")}>{s.q}</p>
                <p className={cn(TERMINAL_TYPO.micro, "mt-1 leading-snug text-slate-400")}>{s.a}</p>
              </li>
            ))}
          </ul>
        </div>
        <footer className="flex gap-1 border-t border-slate-800 p-2">
          <button
            type="button"
            onClick={startOperator}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex flex-1 items-center justify-center gap-1 border border-violet-700/50 bg-violet-950/40 py-1.5 text-violet-100",
            )}
          >
            <Play className="h-3 w-3" />
            OPEN DAILY CHECKLIST
          </button>
          <button
            type="button"
            onClick={dismiss}
            className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-3 py-1.5 text-slate-500")}
          >
            GOT IT
          </button>
        </footer>
      </div>
    </div>
  );
}
