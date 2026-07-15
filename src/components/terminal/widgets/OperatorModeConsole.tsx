"use client";

import {
  Check,
  Circle,
  ClipboardList,
  Moon,
  Play,
  RotateCcw,
  Sun,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import {
  MORNING_TASKS,
  REVIEW_TASKS,
  TRADING_TASKS,
  activePhase,
  countComplete,
  currentStep,
  liveGuidance,
  operatorScore,
  phaseScore,
  type MorningTaskId,
  type OperatorPhase,
  type ReviewTaskId,
  type TradingTaskId,
} from "@/lib/operator-mode/OperatorModeEngine";
import {
  hasAnyProCapability,
  PRO_UNLOCK_HINTS,
  visiblePhases,
  visibleReviewTaskIds,
  visibleTradingTaskIds,
} from "@/lib/operator-mode/operatorModePro";
import { lessonProgress } from "@/lib/education/learningAcademy";
import { readAcademyProgress } from "@/lib/education/learningProgressSnapshot";
import { useLearningAcademyStore } from "@/store/useLearningAcademyStore";
import { terminalBus } from "@/store/eventBus";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import {
  MORNING_TASK_BEGINNER,
  REVIEW_TASK_BEGINNER,
  TRADING_TASK_BEGINNER,
  beginnerGuidanceForTask,
} from "@/lib/beginner/beginnerTranslation";
import { WhatIsThisCard } from "@/components/beginner/WhatIsThisCard";

const PHASE_META: { id: OperatorPhase; label: string; beginnerLabel: string; icon: typeof Sun }[] = [
  { id: "morning", label: "MORNING", beginnerLabel: "Morning", icon: Sun },
  { id: "trading", label: "TRADING", beginnerLabel: "Pre-trade", icon: Target },
  { id: "review", label: "REVIEW", beginnerLabel: "Review", icon: Moon },
];

function TaskRow({
  done,
  label,
  detail,
  why,
  onToggle,
  onGo,
}: {
  done: boolean;
  label: string;
  detail: string;
  why?: string;
  onToggle: () => void;
  onGo?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 border-b border-slate-800/80 py-1.5 last:border-0",
        done && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border",
          done ? "border-emerald-700/50 bg-emerald-950/40 text-emerald-400" : "border-slate-700 text-slate-600",
        )}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        {done ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn(TERMINAL_TYPO.dataSm, done ? "text-slate-500 line-through" : "text-slate-200")}>{label}</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{detail}</p>
        {why ? <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-cyan-600/80")}>Why: {why}</p> : null}
      </div>
      {onGo ? (
        <button
          type="button"
          onClick={onGo}
          className={cn(TERMINAL_TYPO.micro, "shrink-0 border border-slate-700 px-1.5 py-0.5 text-cyan-400 hover:bg-slate-900")}
        >
          GO
        </button>
      ) : null}
    </div>
  );
}

export function OperatorModeConsole() {
  const today = useOperatorModeStore((s) => s.today);
  const proCaps = useOperatorModeStore((s) => s.proCaps);
  const activePhaseTab = useOperatorModeStore((s) => s.activePhaseTab);
  const setActivePhaseTab = useOperatorModeStore((s) => s.setActivePhaseTab);
  const toggleMorning = useOperatorModeStore((s) => s.toggleMorning);
  const toggleTrading = useOperatorModeStore((s) => s.toggleTrading);
  const toggleReview = useOperatorModeStore((s) => s.toggleReview);
  const setExecutionPlanNote = useOperatorModeStore((s) => s.setExecutionPlanNote);
  const resetToday = useOperatorModeStore((s) => s.resetToday);
  const startTodayWorkflow = useOperatorModeStore((s) => s.startTodayWorkflow);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);

  const isPro = hasAnyProCapability(proCaps);
  const phases = visiblePhases(proCaps);
  const tradingIds = new Set(visibleTradingTaskIds(proCaps));
  const reviewIds = new Set(visibleReviewTaskIds(proCaps));

  const score = operatorScore(today, proCaps);
  const step = currentStep(today, proCaps);
  const guidance =
    beginnerMode && step
      ? beginnerGuidanceForTask(step.taskId) ?? liveGuidance(today, proCaps)
      : liveGuidance(today, proCaps);
  const progress = countComplete(today, proCaps);
  const phase = activePhase(today, proCaps);

  const focus = (panelId?: string) => {
    if (!panelId) return;
    terminalBus.emit("widget:focus", { widgetId: panelId });
  };

  return (
    <div data-operatormode-panel="operatormode" data-operatormode-region="panel" data-panel-id="operatormode" className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-2 py-1")}>
        <ClipboardList className="h-3.5 w-3.5 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-200")}>
          {beginnerMode ? "DAILY CHECKLIST" : "OPERATOR MODE"}
        </span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "rounded-sm border px-1 py-0.5",
            isPro ? "border-cyan-800/50 text-cyan-300" : "border-violet-800/50 text-violet-300",
          )}
        >
          {isPro ? "PRO" : "LITE"}
        </span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto rounded-sm border px-1.5 py-0.5 tabular-nums",
            score >= 80 ? "border-emerald-800/50 text-emerald-400" : score >= 40 ? "border-amber-800/50 text-amber-300" : "border-slate-700 text-slate-400",
          )}
        >
          SCORE {score}
        </span>
      </header>

      <div data-operatormode-region="guidance" className="shrink-0 border-b border-slate-800 bg-violet-950/15 px-2 py-1.5">
        <p className={cn(TERMINAL_TYPO.micro, "text-violet-300/90")}>{guidance}</p>
        {beginnerMode && step ? (
          (() => {
            const b =
              step.phase === "morning"
                ? MORNING_TASK_BEGINNER[step.taskId as MorningTaskId]
                : step.phase === "trading"
                  ? TRADING_TASK_BEGINNER[step.taskId as TradingTaskId]
                  : REVIEW_TASK_BEGINNER[step.taskId as ReviewTaskId];
            return b?.concept ? <WhatIsThisCard conceptId={b.concept} compact className="mt-1" /> : null;
          })()
        ) : null}
        {step ? (
          <div className="mt-1 flex items-center gap-2">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              CURRENT · {(beginnerMode ? PHASE_META.find((p) => p.id === step.phase)?.beginnerLabel : step.phase.toUpperCase()) ?? step.phase} ·{" "}
              {beginnerMode
                ? (step.phase === "morning"
                    ? MORNING_TASK_BEGINNER[step.taskId as MorningTaskId]?.label
                    : step.phase === "trading"
                      ? TRADING_TASK_BEGINNER[step.taskId as TradingTaskId]?.label
                      : REVIEW_TASK_BEGINNER[step.taskId as ReviewTaskId]?.label) ?? step.label
                : step.label}
            </span>
            {step.panelId ? (
              <button
                type="button"
                onClick={() => focus(step.panelId)}
                className={cn(TERMINAL_TYPO.micro, "border border-violet-700/50 px-1.5 py-0.5 text-violet-200")}
              >
                <Play className="mr-0.5 inline h-2.5 w-2.5" />
                DO NOW
              </button>
            ) : null}
          </div>
        ) : (
          <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-emerald-400")}>Operator day complete.</p>
        )}
        <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
          {progress.done}/{progress.total} tasks · active phase {phase.toUpperCase()}
        </p>
      </div>

      <nav data-operatormode-region="phases" className={cn(terminalSkin.borderB, "flex shrink-0 gap-0.5 p-0.5")}>
        {PHASE_META.filter((p) => phases.includes(p.id)).map((p) => {
          const Icon = p.icon;
          const pct = phaseScore(today, p.id, proCaps);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePhaseTab(p.id)}
              className={cn(
                TERMINAL_TYPO.micro,
                "flex flex-1 items-center justify-center gap-1 border px-1 py-0.5",
                activePhaseTab === p.id ? "border-violet-700/50 text-violet-200" : "border-slate-800 text-slate-600",
              )}
            >
              <Icon className="h-3 w-3" />
              {beginnerMode ? p.beginnerLabel : p.label}
              <span className="text-slate-600">{pct}%</span>
            </button>
          );
        })}
      </nav>

      <div data-operatormode-region="tasks" className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
        {activePhaseTab === "morning"
          ? MORNING_TASKS.map((t) => {
              const b = MORNING_TASK_BEGINNER[t.id as MorningTaskId];
              return (
              <TaskRow
                key={t.id}
                done={today.morning[t.id as MorningTaskId]}
                label={beginnerMode && b ? b.label : t.label}
                detail={beginnerMode && b ? b.detail : t.detail}
                why={beginnerMode && b ? b.why : undefined}
                onToggle={() => toggleMorning(t.id as MorningTaskId)}
                onGo={t.panelId ? () => focus(t.panelId) : undefined}
              />
              );
            })
          : null}
        {activePhaseTab === "trading"
          ? TRADING_TASKS.filter((t) => tradingIds.has(t.id as TradingTaskId)).map((t) => {
              const b = TRADING_TASK_BEGINNER[t.id as TradingTaskId];
              return (
              <TaskRow
                key={t.id}
                done={today.trading[t.id as TradingTaskId]}
                label={beginnerMode && b ? b.label : t.label}
                detail={beginnerMode && b ? b.detail : t.detail}
                why={beginnerMode && b ? b.why : undefined}
                onToggle={() => toggleTrading(t.id as TradingTaskId)}
                onGo={t.panelId ? () => focus(t.panelId) : undefined}
              />
              );
            })
          : null}
        {activePhaseTab === "review"
          ? REVIEW_TASKS.filter((t) => reviewIds.has(t.id as ReviewTaskId)).map((t) => {
              const b = REVIEW_TASK_BEGINNER[t.id as ReviewTaskId];
              return (
              <TaskRow
                key={t.id}
                done={today.review[t.id as ReviewTaskId]}
                label={beginnerMode && b ? b.label : t.label}
                detail={beginnerMode && b ? b.detail : t.detail}
                why={beginnerMode && b ? b.why : undefined}
                onToggle={() => toggleReview(t.id as ReviewTaskId)}
                onGo={t.panelId ? () => focus(t.panelId) : undefined}
              />
              );
            })
          : null}

        {activePhaseTab === "morning" ? (
          <div className="mt-2 border border-slate-800 p-1.5">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              {beginnerMode ? "TRADE PLAN NOTE" : "EXECUTION PLAN NOTE"}
            </p>
            {beginnerMode ? <WhatIsThisCard conceptId="execution-plan" compact className="mb-1" /> : null}
            <textarea
              value={today.executionPlanNote}
              onChange={(e) => setExecutionPlanNote(e.target.value)}
              onBlur={() => {
                if (today.executionPlanNote.trim().length >= 8) {
                  useOperatorModeStore.getState().completeMorning("execution-plan");
                }
              }}
              placeholder={
                beginnerMode
                  ? "Example: Only trade if market is calm. Max size 0.1. Stand aside if unsure."
                  : "Entries, size, stand-aside rules…"
              }
              className="mt-1 w-full resize-none border border-slate-800 bg-slate-950 px-1.5 py-1 font-mono text-[10px] text-slate-300 outline-none focus:border-violet-700/50"
              rows={3}
            />
          </div>
        ) : null}

        {!isPro && activePhaseTab === "morning" ? (
          <div className="mt-2 border border-slate-800/80 bg-slate-950/50 p-1.5">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>ACADEMY UNLOCKS PRO</p>
            <ul className="mt-1 space-y-1">
              {PRO_UNLOCK_HINTS.map((h) => {
                const mastered = lessonProgress(h.lessonId, readAcademyProgress()).mastery;
                return (
                  <li key={h.lessonId} className="flex items-start gap-1.5">
                    <span
                      className={cn(
                        TERMINAL_TYPO.micro,
                        "mt-0.5 shrink-0",
                        mastered ? "text-emerald-400" : "text-slate-600",
                      )}
                    >
                      {mastered ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn(TERMINAL_TYPO.micro, mastered ? "text-emerald-400/90" : "text-slate-500")}>
                        {h.lesson}
                        {mastered ? " · MASTERED" : ""}
                      </p>
                      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{h.unlocks}</p>
                    </div>
                    {!mastered ? (
                      <button
                        type="button"
                        onClick={() => useLearningAcademyStore.getState().open()}
                        className={cn(
                          TERMINAL_TYPO.micro,
                          "shrink-0 border border-violet-700/50 px-1 py-0.5 text-violet-300",
                        )}
                      >
                        GO
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <footer className={cn(terminalSkin.borderT, "flex shrink-0 gap-1 p-1")}>
        <button
          type="button"
          onClick={startTodayWorkflow}
          className={cn(TERMINAL_TYPO.micro, "flex-1 border border-violet-700/50 bg-violet-950/30 py-1 text-violet-200")}
        >
          RUN TODAY
        </button>
        <button
          type="button"
          onClick={resetToday}
          className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-500")}
          title="Reset today's workflow"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </footer>
    </div>
  );
}
