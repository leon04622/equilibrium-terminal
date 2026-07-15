"use client";

import { ArrowLeft, ArrowRight, GraduationCap, Pause, Play, Radio, Repeat, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { DailyBriefingPlayground } from "@/components/terminal/explain/daily-briefing/DailyBriefingPlayground";
import { DAILY_BRIEFING_SCENES } from "@/lib/education/dailyBriefingScenes";
import { useLessonSceneDriver } from "@/lib/education/useLessonSceneDriver";
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import { useDailyBriefingLessonStore } from "@/store/useDailyBriefingLessonStore";
import { useDailyBriefingBridgeStore } from "@/store/useDailyBriefingBridgeStore";
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";

const scenes = DAILY_BRIEFING_SCENES;

export function DailyBriefingSimulator() {
  const active = useDailyBriefingLessonStore((s) => s.active);
  const runId = useDailyBriefingLessonStore((s) => s.runId);
  const startStep = useDailyBriefingLessonStore((s) => s.startStep);
  const close = useDailyBriefingLessonStore((s) => s.close);
  const restart = useDailyBriefingLessonStore((s) => s.restart);
  const markStep = useDailyBriefingLessonStore((s) => s.markStep);
  const markCompleted = useDailyBriefingLessonStore((s) => s.markCompleted);
  const startBridge = useDailyBriefingBridgeStore((s) => s.start);
  const markSimulatorCompleted = useDailyBriefingBridgeStore((s) => s.markSimulatorCompleted);

  const driver = useLessonSceneDriver({ scenes, active, runId, startStep, markStep, markCompleted, close });
  const { index, setIndex, playing, voiceOn, scene, captionVoice, reduceMotion, exit, togglePlay, toggleVoice, replayScene, isLast, isFirst, sceneKey } = driver;

  if (!active || !scene) return null;

  const findItLive = () => {
    armLessonVoice();
    markSimulatorCompleted();
    exit();
    startBridge();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label="Daily Briefing Engine simulator">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className={cn(TERMINAL_TYPO.label, "truncate text-amber-200")}>DAILY BRIEFING ENGINE · SIMULATOR</span>
          <span className={cn(TERMINAL_TYPO.micro, "shrink-0 text-amber-600")}>PLATFORM</span>
        </div>
        <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-200")}>
          EXIT <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          <DailyBriefingPlayground visual={scene.visual} reduceMotion={reduceMotion} sceneKey={sceneKey} animate={playing} />
          <div className="border border-slate-700/60 bg-slate-900/40 p-4">
            <span className={cn(TERMINAL_TYPO.micro, "text-amber-500")}>{scene.chapter}</span>
            <h2 className="font-mono text-lg font-semibold text-slate-100">{scene.title}</h2>
            {scene.takeaway ? <p className="mt-1.5 font-mono text-sm text-slate-300">{scene.takeaway}</p> : null}
          </div>
        </div>
      </div>
      <p className="shrink-0 px-4 pb-1 text-center font-mono text-xs text-slate-300" aria-live="polite">{captionVoice}</p>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2.5">
        <button type="button" disabled={isFirst} onClick={() => setIndex(index - 1)} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <ArrowLeft className="inline h-3 w-3" />
        </button>
        <button type="button" onClick={togglePlay} className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-amber-500/60 text-amber-200" : "border-slate-700 text-slate-300")}>
          {playing ? <Pause className="inline h-3 w-3" /> : <Play className="inline h-3 w-3" />}
        </button>
        <button type="button" onClick={toggleVoice} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-300")}>
          {voiceOn ? <Volume2 className="inline h-3 w-3" /> : <VolumeX className="inline h-3 w-3" />}
        </button>
        <button type="button" onClick={replayScene} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <Repeat className="inline h-3 w-3" />
        </button>
        <button type="button" onClick={() => restart()} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <RotateCcw className="inline h-3 w-3" />
        </button>
        {isLast ? (
          <button type="button" onClick={findItLive} className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-amber-500/70 bg-amber-950/40 px-2 py-1 text-amber-200")}>
            FIND IT LIVE <Radio className="h-3 w-3" />
          </button>
        ) : (
          <button type="button" onClick={() => setIndex(index + 1)} className={cn(TERMINAL_TYPO.micro, "border border-amber-700/50 px-2 py-1 text-amber-300")}>
            <AcademyNextLabel />
          </button>
        )}
      </div>
    </div>
  );
}
