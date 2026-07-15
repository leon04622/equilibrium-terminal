"use client";

import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import {
  ACADEMY_LESSONS,
  buildLessonStatuses,
  lessonProgress,
  operatorLevel,
  PATH_LABELS,
  recommendedNext,
  type AcademyLesson,
  type LessonStatus,
  type PathId,
} from "@/lib/education/learningAcademy";
import { readAcademyProgress } from "@/lib/education/learningProgressSnapshot";
import { useLessonLaunchers } from "@/lib/education/lessonLaunchers";
import { useLearningAcademyStore } from "@/store/useLearningAcademyStore";
import { useMarketMechanicsStore } from "@/store/useMarketMechanicsStore";
import { useMarketMechanicsBridgeStore } from "@/store/useMarketMechanicsBridgeStore";
import { useOrderBookLessonStore } from "@/store/useOrderBookLessonStore";
import { useLessonBridgeStore } from "@/store/useLessonBridgeStore";
import { useFundingCrowdingStore } from "@/store/useFundingCrowdingStore";
import { useFundingBridgeStore } from "@/store/useFundingBridgeStore";
import { useTradeTypesStore } from "@/store/useTradeTypesStore";
import { useTradeTypesBridgeStore } from "@/store/useTradeTypesBridgeStore";
import { useLiquidationsStore } from "@/store/useLiquidationsStore";
import { useLiquidationsBridgeStore } from "@/store/useLiquidationsBridgeStore";
import { useRiskManagementStore } from "@/store/useRiskManagementStore";
import { useRiskManagementBridgeStore } from "@/store/useRiskManagementBridgeStore";
import { useSlippageStore } from "@/store/useSlippageStore";
import { useSlippageBridgeStore } from "@/store/useSlippageBridgeStore";
import { useExecutionLessonStore } from "@/store/useExecutionLessonStore";
import { useExecutionLessonBridgeStore } from "@/store/useExecutionLessonBridgeStore";
import { usePortfolioRiskStore } from "@/store/usePortfolioRiskStore";
import { usePortfolioRiskBridgeStore } from "@/store/usePortfolioRiskBridgeStore";
import {
  DAY_ONE_OPERATOR_WORKFLOW,
  GRADUATION_DAILY_WORKFLOW,
} from "@/lib/education/academyWorkflowPaths";
import { useAcademyWorkflowStore } from "@/store/useAcademyWorkflowStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import { terminalBus } from "@/store/eventBus";

const STATUS_STYLE: Record<LessonStatus, { label: string; className: string }> = {
  locked: { label: "Locked", className: "border-slate-700 bg-slate-900/60 text-slate-500" },
  available: { label: "Available", className: "border-cyan-800/50 bg-cyan-950/30 text-cyan-300" },
  in_progress: { label: "In progress", className: "border-amber-800/50 bg-amber-950/30 text-amber-300" },
  completed: { label: "Completed", className: "border-emerald-800/50 bg-emerald-950/30 text-emerald-300" },
  coming_soon: { label: "In development", className: "border-slate-700 bg-slate-900/40 text-slate-400" },
};

const PATH_ORDER: PathId[] = ["beginner", "intermediate", "professional"];

function PathProgress({ path, statuses }: { path: PathId; statuses: Map<string, LessonStatus> }) {
  const lessons = ACADEMY_LESSONS.filter((l) => l.path === path);
  const live = lessons.filter((l) => l.live);
  const done = live.filter((l) => statuses.get(l.id) === "completed").length;
  const total = lessons.length;
  const pct = live.length > 0 ? Math.round((done / live.length) * 100) : 0;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
        <span>
          {done}/{live.length} live · {total} modules planned
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1 bg-slate-800">
        <div className="h-full bg-cyan-600/80 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ProgressMeters({ lessonId, detail }: { lessonId: string; detail: ReturnType<typeof lessonProgress> }) {
  if (
    ![
      "market-mechanics",
      "order-book",
      "funding",
      "trade-types",
      "liquidations",
      "risk-management",
      "slippage",
      "execution",
      "portfolio-risk",
      "daily-operations",
      "operator-journal",
      "live-desk",
      "market-state",
      "daily-briefing",
      "market-memory",
      "crypto-financial-os",
      "first-trade-checklist",
      "market-structure",
      "liquidity-deep",
      "cross-market",
      "macro-flows",
      "intelligence-desk",
    ].includes(lessonId)
  ) {
    return null;
  }

  const rows = [
    { key: "Lesson", ok: detail.simulatorCompleted },
    { key: "Bridge", ok: detail.bridgeCompleted },
    { key: "Recognition", ok: detail.recognitionPassed },
    ...(lessonId === "order-book" ? [{ key: "Replay", ok: detail.replayWatched }] : []),
    { key: "Mastery", ok: detail.mastery },
  ];

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {rows.map((r) => (
        <span
          key={r.key}
          className={cn(
            "inline-flex items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide",
            r.ok ? "border-emerald-800/40 text-emerald-400" : "border-slate-700 text-slate-500",
          )}
        >
          {r.ok ? <Check className="h-2.5 w-2.5" /> : <Circle className="h-2 w-2" />}
          {r.key}
        </span>
      ))}
    </div>
  );
}

function LessonCard({
  lesson,
  status,
  isRecommended,
  detail,
  onLaunch,
}: {
  lesson: AcademyLesson;
  status: LessonStatus;
  isRecommended: boolean;
  detail: ReturnType<typeof lessonProgress>;
  onLaunch: (mode: "start" | "restart" | "review" | "bridge" | "simulator") => void;
}) {
  const style = STATUS_STYLE[status];
  const canLaunch = lesson.live && (status === "available" || status === "in_progress" || status === "completed");

  return (
    <article
      className={cn(
        "border border-slate-800 bg-slate-950/80 p-3 transition-colors",
        isRecommended && "border-violet-700/60 bg-violet-950/15",
        status === "locked" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[10px] font-bold",
            status === "completed" ? "border-emerald-800/50 text-emerald-400" : "border-slate-700 text-slate-400",
          )}
        >
          {status === "completed" ? <Check className="h-3.5 w-3.5" /> : status === "locked" ? <Lock className="h-3 w-3" /> : lesson.order}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-mono text-[11px] font-semibold text-slate-100">{lesson.title}</h3>
            <span className={cn("rounded-sm border px-1.5 py-0.5 font-mono text-[8px] uppercase", style.className)}>
              {isRecommended ? "Recommended next" : style.label}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[9px] leading-snug text-slate-500">{lesson.subtitle}</p>
          <ProgressMeters lessonId={lesson.id} detail={detail} />
        </div>
      </div>

      {canLaunch ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-800/80 pt-2">
          <button
            type="button"
            onClick={() => onLaunch(status === "completed" ? "review" : "start")}
            className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-cyan-800/50 bg-cyan-950/30 px-2 py-1 text-cyan-200 hover:bg-cyan-950/50")}
          >
            <Play className="h-3 w-3" />
            {status === "in_progress" ? "Resume" : status === "completed" ? "Review" : "Start"}
          </button>
          {lesson.id !== "market-mechanics" ? (
            <>
              <button
                type="button"
                onClick={() => onLaunch("simulator")}
                className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-900")}
              >
                Simulator only
              </button>
              <button
                type="button"
                onClick={() => onLaunch("bridge")}
                className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-900")}
              >
                Bridge only
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onLaunch("bridge")}
              className={cn(TERMINAL_TYPO.micro, "border border-cyan-800/50 px-2 py-1 text-cyan-200 hover:bg-cyan-950/40")}
            >
              Live bridge
            </button>
          )}
          <button
            type="button"
            onClick={() => onLaunch("restart")}
            className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-slate-700 px-2 py-1 text-slate-400 hover:bg-slate-900")}
          >
            <RotateCcw className="h-3 w-3" />
            Restart
          </button>
        </div>
      ) : status === "coming_soon" ? (
        <p className="mt-2 border-t border-slate-800/80 pt-2 font-mono text-[9px] text-slate-500">
          Module slot reserved — content in development.
        </p>
      ) : null}
    </article>
  );
}

/**
 * LEARNING COMMAND CENTER — institutional training front door.
 */
export function LearningCommandCenter() {
  const active = useLearningAcademyStore((s) => s.active);
  const close = useLearningAcademyStore((s) => s.close);
  const progressVersion = useLearningAcademyStore((s) => s.progressVersion);
  const bump = useLearningAcademyStore((s) => s.bumpProgress);
  const { launch } = useLessonLaunchers();

  // Re-read progress when any lesson store changes.
  const mmDone = useMarketMechanicsStore((s) => s.completed);
  const mmBridge = useMarketMechanicsBridgeStore((s) => s.memory.bridgeCompleted);
  const obDone = useOrderBookLessonStore((s) => s.completed);
  const obBridge = useLessonBridgeStore((s) => s.memory.bridgeCompleted);
  const fundDone = useFundingCrowdingStore((s) => s.completed);
  const fundBridge = useFundingBridgeStore((s) => s.memory.bridgeCompleted);
  const ttDone = useTradeTypesStore((s) => s.completed);
  const ttBridge = useTradeTypesBridgeStore((s) => s.memory.bridgeCompleted);
  const liqDone = useLiquidationsStore((s) => s.completed);
  const liqBridge = useLiquidationsBridgeStore((s) => s.memory.bridgeCompleted);
  const rmDone = useRiskManagementStore((s) => s.completed);
  const rmBridge = useRiskManagementBridgeStore((s) => s.memory.bridgeCompleted);
  const slipDone = useSlippageStore((s) => s.completed);
  const slipBridge = useSlippageBridgeStore((s) => s.memory.bridgeCompleted);
  const execDone = useExecutionLessonStore((s) => s.completed);
  const execBridge = useExecutionLessonBridgeStore((s) => s.memory.bridgeCompleted);
  const prDone = usePortfolioRiskStore((s) => s.completed);
  const prBridge = usePortfolioRiskBridgeStore((s) => s.memory.bridgeCompleted);

  const startWorkflow = useAcademyWorkflowStore((s) => s.start);

  const openOperatorMode = () => {
    useOperatorModeStore.getState().activateLite();
    useOperatorModeStore.getState().startTodayWorkflow();
    terminalBus.emit("widget:focus", { widgetId: "operatormode" });
    close();
  };
  const dayOneDone = useAcademyWorkflowStore((s) => s.dayOne.completed);
  const graduationDone = useAcademyWorkflowStore((s) => s.graduation.completed);

  useEffect(() => {
    bump();
  }, [mmDone, mmBridge, obDone, obBridge, fundDone, fundBridge, ttDone, ttBridge, liqDone, liqBridge, rmDone, rmBridge, slipDone, slipBridge, execDone, execBridge, prDone, prBridge, dayOneDone, graduationDone, bump]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);

  void progressVersion;
  const raw = readAcademyProgress();
  const statuses = buildLessonStatuses(raw);
  const rank = operatorLevel(raw, statuses);
  const next = recommendedNext(statuses);
  const snapshot = { raw, statuses, rank, next };

  if (!active) return null;

  const liveCompleted = ACADEMY_LESSONS.filter((l) => l.live && snapshot.statuses.get(l.id) === "completed").length;
  const liveTotal = ACADEMY_LESSONS.filter((l) => l.live).length;

  return (
    <div
      className="fixed inset-0 z-[190] flex flex-col bg-slate-950/98 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Learning Command Center"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          <div>
            <h1 className={cn(TERMINAL_TYPO.label, "text-slate-100")}>LEARNING COMMAND CENTER</h1>
            <p className="font-mono text-[9px] text-slate-500">
              Institutional training program · {liveCompleted}/{liveTotal} core modules complete
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="font-mono text-[9px] uppercase tracking-wide text-slate-500">Operator level</p>
            <p className="font-mono text-[11px] font-semibold text-slate-100">
              {snapshot.rank.level > 0 ? `Level ${snapshot.rank.level}` : "Unranked"} · {snapshot.rank.title}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            aria-label="Close learning hub"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {snapshot.next && snapshot.next.lesson.live ? (
        <div className="shrink-0 border-b border-violet-900/40 bg-violet-950/20 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wide text-violet-400">Recommended next lesson</p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-slate-100">
                {snapshot.next.lesson.order}. {snapshot.next.lesson.title}
              </p>
              <p className="mt-0.5 font-mono text-[9px] text-slate-400">{snapshot.next.reason}</p>
            </div>
            <button
              type="button"
              onClick={() => launch(snapshot.next!.lesson.id, "start")}
              className={cn(
                TERMINAL_TYPO.micro,
                "flex items-center gap-1.5 border border-violet-700/50 bg-violet-950/40 px-3 py-1.5 text-violet-100 hover:bg-violet-950/60",
              )}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="mx-auto max-w-6xl border border-violet-800/50 bg-violet-950/20 p-3">
          <p className="font-mono text-[9px] uppercase tracking-wide text-violet-300">Daily operating system</p>
          <p className="mt-1 font-mono text-[12px] font-semibold text-slate-100">Operator Mode</p>
          <p className="mt-0.5 font-mono text-[9px] text-slate-500">
            Start here every day — briefing, market state, ops, live desk, execution plan.
          </p>
          <button
            type="button"
            onClick={openOperatorMode}
            className={cn(
              TERMINAL_TYPO.micro,
              "mt-2 flex items-center gap-1 border border-violet-700/50 bg-violet-950/40 px-2 py-1 text-violet-100",
            )}
          >
            <Play className="h-3 w-3" />
            START OPERATOR MODE
          </button>
        </div>
        <div className="mx-auto mt-3 grid max-w-6xl gap-3 md:grid-cols-2">
          <div className="border border-cyan-800/40 bg-cyan-950/15 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wide text-cyan-400">Academy support tour</p>
            <p className="mt-1 font-mono text-[12px] font-semibold text-slate-100">{DAY_ONE_OPERATOR_WORKFLOW.title}</p>
            <p className="mt-0.5 font-mono text-[9px] text-slate-500">{DAY_ONE_OPERATOR_WORKFLOW.subtitle}</p>
            <button
              type="button"
              onClick={() => {
                close();
                startWorkflow(DAY_ONE_OPERATOR_WORKFLOW);
              }}
              className={cn(TERMINAL_TYPO.micro, "mt-2 flex items-center gap-1 border border-cyan-700/50 bg-cyan-950/40 px-2 py-1 text-cyan-100")}
            >
              {dayOneDone ? <Check className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {dayOneDone ? "Replay panel tour" : "Panel tour (optional)"}
            </button>
          </div>
          <div className="border border-violet-800/40 bg-violet-950/15 p-3">
            <p className="font-mono text-[9px] uppercase tracking-wide text-violet-400">Academy support tour</p>
            <p className="mt-1 font-mono text-[12px] font-semibold text-slate-100">{GRADUATION_DAILY_WORKFLOW.title}</p>
            <p className="mt-0.5 font-mono text-[9px] text-slate-500">{GRADUATION_DAILY_WORKFLOW.subtitle}</p>
            <button
              type="button"
              onClick={() => {
                close();
                startWorkflow(GRADUATION_DAILY_WORKFLOW);
              }}
              className={cn(TERMINAL_TYPO.micro, "mt-2 flex items-center gap-1 border border-violet-700/50 bg-violet-950/40 px-2 py-1 text-violet-100")}
            >
              {graduationDone ? <Check className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {graduationDone ? "Replay panel tour" : "Graduation tour (optional)"}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
          {PATH_ORDER.map((pathId) => {
            const lessons = ACADEMY_LESSONS.filter((l) => l.path === pathId);
            const nextId = snapshot.next?.lesson.id;
            return (
              <section key={pathId} className="flex flex-col border border-slate-800 bg-slate-900/30">
                <div className="border-b border-slate-800 px-3 py-2.5">
                  <h2 className={cn(TERMINAL_TYPO.label, "text-slate-200")}>{PATH_LABELS[pathId]}</h2>
                  <PathProgress path={pathId} statuses={snapshot.statuses} />
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {lessons.map((lesson) => {
                    const status = snapshot.statuses.get(lesson.id) ?? "locked";
                    const detail = lessonProgress(lesson.id, snapshot.raw);
                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        status={status}
                        isRecommended={lesson.id === nextId && lesson.live}
                        detail={detail}
                        onLaunch={(mode) => {
                          if (mode === "bridge") launch(lesson.id, "bridge");
                          else if (mode === "simulator") launch(lesson.id, "simulator");
                          else if (mode === "restart") launch(lesson.id, "restart");
                          else if (mode === "review") launch(lesson.id, "review");
                          else launch(lesson.id, "start");
                        }}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mx-auto mt-6 max-w-6xl border border-slate-800 bg-slate-900/20 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-500" />
            <h2 className={cn(TERMINAL_TYPO.label, "text-slate-300")}>FUTURE MODULE ROADMAP</h2>
          </div>
          <p className="mt-1 font-mono text-[9px] text-slate-500">
            Reserved slots for advanced modules — unlocked as paths progress.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ACADEMY_LESSONS.filter((l) => !l.live).map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-1 border border-slate-800 px-2 py-1 font-mono text-[9px] text-slate-500"
              >
                <ChevronRight className="h-3 w-3" />
                {l.title}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
