"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import {
  academyPerf,
  isAcademyPerfEnabled,
  type AcademyPerfSnapshot,
} from "@/lib/education/academyPerformance";
import { isLessonSpeaking } from "@/lib/education/LessonNarrator";

/** Development-only academy diagnostics overlay. */
export function AcademyPerformancePanel() {
  const [snap, setSnap] = useState<AcademyPerfSnapshot | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!isAcademyPerfEnabled()) return;
    return academyPerf.subscribe(setSnap);
  }, []);

  useEffect(() => {
    if (!isAcademyPerfEnabled()) return;
    const id = window.setInterval(() => setSpeaking(isLessonSpeaking()), 250);
    return () => window.clearInterval(id);
  }, []);

  if (!isAcademyPerfEnabled() || !snap) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-2 right-2 z-[250] max-w-[220px] border border-slate-700/80",
        "bg-slate-950/90 px-2 py-1.5 font-mono text-[9px] text-slate-400 backdrop-blur",
      )}
    >
      <p className={cn(TERMINAL_TYPO.label, "mb-1 text-cyan-500")}>ACADEMY PERF</p>
      <p>Lesson: {snap.activeLessonId ?? "—"}</p>
      <p>Load: {snap.lessonLoadMs}ms</p>
      <p>Speech latency: {snap.lastSpeechLatencyMs}ms (avg {academyPerf.avgSpeechLatency()}ms)</p>
      <p>Speech dur: {snap.lastSpeechDurationMs}ms</p>
      <p>Transition: {snap.lastTransitionMs}ms (avg {academyPerf.avgTransitionMs()}ms)</p>
      <p>Speaking: {speaking ? "yes" : "no"}</p>
      <p>
        Speech starts/cancels/stale: {snap.speechStartCount}/{snap.speechCancelCount}/{snap.speechStaleCallbackDrops}
      </p>
    </div>
  );
}
