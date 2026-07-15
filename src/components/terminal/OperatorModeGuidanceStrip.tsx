"use client";



import { ClipboardList, Play } from "lucide-react";

import { cn } from "@/lib/utils";

import { TERMINAL_TYPO } from "@/lib/theme";

import { countComplete, currentStep, liveGuidance, operatorScore } from "@/lib/operator-mode/OperatorModeEngine";
import { hasAnyProCapability } from "@/lib/operator-mode/operatorModePro";

import { beginnerGuidanceForTask } from "@/lib/beginner/beginnerTranslation";
import { isBloombergChrome } from "@/lib/theme/bloomberg";

import { terminalBus } from "@/store/eventBus";

import { useOperatorModeStore } from "@/store/useOperatorModeStore";

import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";



/** Persistent guidance strip — what to do next. */

export function OperatorModeGuidanceStrip() {

  const active = useOperatorModeStore((s) => s.active);

  const today = useOperatorModeStore((s) => s.today);

  const proCaps = useOperatorModeStore((s) => s.proCaps);

  const setActivePhaseTab = useOperatorModeStore((s) => s.setActivePhaseTab);

  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);

  if (!active) return null;



  const step = currentStep(today, proCaps);

  const guidance =

    beginnerMode && step

      ? beginnerGuidanceForTask(step.taskId) ?? liveGuidance(today, proCaps)

      : liveGuidance(today, proCaps);

  const score = operatorScore(today, proCaps);
  const isPro = hasAnyProCapability(proCaps);

  const { done, total } = countComplete(today, proCaps);

  const complete = done >= total;



  return (

    <div
      className={cn(
        "eq-bloomberg-ops-strip flex shrink-0 items-center gap-2 border-b px-2 py-0.5",
        bloomberg
          ? "border-[#ff9900]/40 bg-black"
          : complete
            ? "border-emerald-900/40 bg-emerald-950/20"
            : "border-violet-900/40 bg-violet-950/25",
        TERMINAL_TYPO.micro,
      )}
    >
      {!bloomberg ? (
        <ClipboardList className={cn("h-3.5 w-3.5 shrink-0", complete ? "text-emerald-400" : "text-violet-400")} />
      ) : null}
      <span
        className={cn(
          "shrink-0 font-bold uppercase tracking-wide",
          bloomberg ? "text-[#ff9900]" : complete ? "text-emerald-300" : "text-violet-300",
        )}
      >
        {beginnerMode ? "DAILY CHECKLIST" : "OPS"}
      </span>
      {!isPro ? (
        <span className={cn("shrink-0 border px-1", bloomberg ? "border-violet-600/40 text-violet-300" : "border-violet-800/50 text-violet-400")}>
          LITE
        </span>
      ) : null}
      <span className={bloomberg ? "text-[#666666]" : "text-slate-600"}>|</span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          bloomberg ? "text-[#cccccc]" : complete ? "text-emerald-200/90" : "text-slate-300",
        )}
      >
        {guidance}
      </span>
      <span className={cn("shrink-0 tabular-nums", bloomberg ? "text-[#888888]" : "text-slate-500")}>
        {done}/{total} · {score}%
      </span>

      {step?.panelId && !complete ? (

        <button

          type="button"

          onClick={() => {

            if (step.phase) setActivePhaseTab(step.phase);

            terminalBus.emit("widget:focus", { widgetId: step.panelId! });

            terminalBus.emit("widget:focus", { widgetId: "operatormode" });

          }}

          className={cn(
            "shrink-0 border px-1.5 py-0.5",
            bloomberg
              ? "border-[#ff9900]/50 text-[#ff9900] hover:bg-[#1a1200]"
              : "border-violet-700/50 text-violet-200 hover:bg-violet-950/40",
          )}

        >

          <Play className="mr-0.5 inline h-2.5 w-2.5" />

          NEXT

        </button>

      ) : null}

      <button

        type="button"

        onClick={() => terminalBus.emit("widget:focus", { widgetId: "operatormode" })}

        className={cn(
          "shrink-0 border px-1.5 py-0.5",
          bloomberg
            ? "border-[#333333] text-[#888888] hover:text-[#ff9900]"
            : "border-slate-700 text-slate-400 hover:text-slate-200",
        )}

      >

        PANEL

      </button>

    </div>

  );

}


