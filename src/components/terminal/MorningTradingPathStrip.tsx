"use client";

import { ArrowRight, Check, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import {
  currentMorningTradingStep,
  MORNING_TRADING_PATH_IDS,
  morningTradingPathProgress,
  type MorningTaskId,
} from "@/lib/operator-mode/OperatorModeEngine";
import { terminalBus } from "@/store/eventBus";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

const PATH_LABELS: Record<MorningTaskId, string> = {
  "daily-briefing": "Briefing",
  "market-state": "Market State",
  "daily-operations": "Daily Ops",
  "live-desk": "Live Desk",
  "execution-plan": "Trade",
};

/** Guided morning loop — Daily Briefing → Market State → Trade Ticket. */
export function MorningTradingPathStrip() {
  const today = useOperatorModeStore((s) => s.today);
  const operatorActive = useOperatorModeStore((s) => s.active);
  const setActivePhaseTab = useOperatorModeStore((s) => s.setActivePhaseTab);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);

  if (operatorActive) return null;

  const step = currentMorningTradingStep(today);
  const { done, total } = morningTradingPathProgress(today);
  const complete = done >= total;

  const focusStep = (panelId: string) => {
    setActivePhaseTab("morning");
    terminalBus.emit("widget:focus", { widgetId: panelId });
  };

  return (
    <div
      data-trade-region="morning-trading-path"
      className={cn(
        "flex shrink-0 items-center gap-2 border-b px-2 py-0.5",
        bloomberg
          ? "border-[#333333] bg-black"
          : complete
            ? "border-emerald-900/35 bg-emerald-950/15"
            : "border-cyan-900/35 bg-cyan-950/20",
        TERMINAL_TYPO.micro,
      )}
    >
      <Sun className={cn("h-3 w-3 shrink-0", complete ? "text-emerald-400" : "text-cyan-400")} />
      <span
        className={cn(
          "shrink-0 font-bold uppercase tracking-wide",
          bloomberg ? "text-[#ff9900]" : complete ? "text-emerald-300" : "text-cyan-300",
        )}
      >
        MORNING PATH
      </span>
      <span className={bloomberg ? "text-[#666666]" : "text-slate-600"}>|</span>

      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {MORNING_TRADING_PATH_IDS.map((id, idx) => {
          const doneStep = today.morning[id];
          const active = step?.taskId === id;
          const label = PATH_LABELS[id];
          const panelId = id === "daily-briefing"
            ? "dailybriefing"
            : id === "market-state"
              ? "marketstate"
              : "ticket";
          return (
            <div key={id} className="flex min-w-0 items-center gap-1">
              {idx > 0 ? (
                <ArrowRight className={cn("h-2.5 w-2.5 shrink-0", bloomberg ? "text-[#444444]" : "text-slate-700")} />
              ) : null}
              <button
                type="button"
                onClick={() => focusStep(panelId)}
                className={cn(
                  "flex shrink-0 items-center gap-0.5 border px-1 py-0.5",
                  doneStep
                    ? bloomberg
                      ? "border-[#333333] text-[#888888]"
                      : "border-emerald-800/40 text-emerald-400"
                    : active
                      ? bloomberg
                        ? "border-[#ff9900]/50 text-[#ff9900]"
                        : "border-cyan-600/50 text-cyan-200"
                      : bloomberg
                        ? "border-[#333333] text-[#888888] hover:text-[#cccccc]"
                        : "border-slate-700 text-slate-500 hover:text-slate-300",
                )}
              >
                {doneStep ? <Check className="h-2.5 w-2.5" /> : null}
                {label}
              </button>
            </div>
          );
        })}
      </div>

      <span className={cn("shrink-0 tabular-nums", bloomberg ? "text-[#888888]" : "text-slate-500")}>
        {done}/{total}
      </span>

      {step?.panelId && !complete ? (
        <button
          type="button"
          onClick={() => focusStep(step.panelId!)}
          className={cn(
            "shrink-0 border px-1.5 py-0.5",
            bloomberg
              ? "border-[#ff9900]/50 text-[#ff9900] hover:bg-[#1a1200]"
              : "border-cyan-700/50 text-cyan-200 hover:bg-cyan-950/40",
          )}
        >
          GO → {PATH_LABELS[step.taskId as MorningTaskId] ?? step.label}
        </button>
      ) : complete ? (
        <span className={cn("shrink-0", terminalSkin.textUp)}>READY</span>
      ) : null}
    </div>
  );
}
