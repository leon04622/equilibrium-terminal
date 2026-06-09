"use client";

import { cn } from "@/lib/utils";
import { budgetStatus, PERFORMANCE_BUDGETS } from "@/lib/performance/PerformanceBudgets";
import { stressModeController } from "@/lib/performance/StressModeController";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { usePerformanceStore } from "@/store/usePerformanceStore";

export function RuntimePerformanceStrip() {
  const showHud = usePerformanceStore((s) => s.showHud);
  const vitals = usePerformanceStore((s) => s.vitals);
  const toggleHud = usePerformanceStore((s) => s.toggleHud);

  const status = budgetStatus(vitals);

  const tone =
    status === "critical"
      ? terminalSkin.textDown
      : status === "warn"
        ? terminalSkin.textWarn
        : terminalSkin.textUp;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          toggleHud();
          if (typeof window !== "undefined") {
            localStorage.setItem("eq-perf-hud", showHud ? "0" : "1");
          }
        }}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          showHud ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title="Runtime performance HUD (FPS · stream · heap)"
      >
        PERF
      </button>
      {showHud ? (
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "hidden items-center gap-1 tabular-nums lg:inline-flex",
            tone,
          )}
        >
          <span>{vitals.fps}FPS</span>
          <span className="text-slate-600">·</span>
          <span>{vitals.frameTimeMs}ms</span>
          <span className="text-slate-600">·</span>
          <span>{vitals.streamEps}/s</span>
          <span className="text-slate-600">·</span>
          <span>{vitals.heapMb}MB</span>
          {vitals.stressActive ? (
            <>
              <span className="text-slate-600">·</span>
              <span className={terminalSkin.textWarn}>STR</span>
            </>
          ) : null}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => stressModeController.setManual(!vitals.stressActive)}
        className={cn(
          TERMINAL_TYPO.micro,
          "hidden px-1 py-0.5 sm:inline",
          vitals.stressActive ? terminalSkin.textWarn : "text-slate-600 hover:text-slate-400",
        )}
        title={`Stress coalesce (auto @ ${PERFORMANCE_BUDGETS.stressThroughputEps} msg/s)`}
      >
        STR
      </button>
    </>
  );
}
