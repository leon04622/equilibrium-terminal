"use client";

import {
  ArrowLeft,
  GraduationCap,
  Pause,
  Play,
  Radio,
  Repeat,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";
import { IntelligenceDeskPlayground } from "@/components/terminal/explain/intelligence-desk/IntelligenceDeskPlayground";
import { INTELLIGENCE_DESK_SCENES } from "@/lib/education/intelligenceDeskScenes";
import { useLessonSceneDriver } from "@/lib/education/useLessonSceneDriver";
import { primeLessonVoice } from "@/lib/education/LessonNarrator";
import { useIntelligenceDeskLessonStore } from "@/store/useIntelligenceDeskLessonStore";
import { useIntelligenceDeskBridgeStore } from "@/store/useIntelligenceDeskBridgeStore";

const scenes = INTELLIGENCE_DESK_SCENES;

export function IntelligenceDeskSimulator() {
  const active = useIntelligenceDeskLessonStore((s) => s.active);
  const runId = useIntelligenceDeskLessonStore((s) => s.runId);
  const startStep = useIntelligenceDeskLessonStore((s) => s.startStep);
  const close = useIntelligenceDeskLessonStore((s) => s.close);
  const restart = useIntelligenceDeskLessonStore((s) => s.restart);
  const markStep = useIntelligenceDeskLessonStore((s) => s.markStep);
  const markCompleted = useIntelligenceDeskLessonStore((s) => s.markCompleted);
  const startBridge = useIntelligenceDeskBridgeStore((s) => s.start);
  const markSimulatorCompleted = useIntelligenceDeskBridgeStore((s) => s.markSimulatorCompleted);

  const {
    index,
    setIndex,
    playing,
    voiceOn,
    scene,
    captionVoice,
    exit,
    togglePlay,
    toggleVoice,
    replayScene,
    isLast,
    isFirst,
    sceneKey,
  } = useLessonSceneDriver({
    scenes,
    active,
    runId,
    startStep,
    markStep,
    markCompleted,
    close,
  });

  if (!active || !scene) return null;

  const findItLive = () => {
    primeLessonVoice();
    markSimulatorCompleted();
    exit();
    startBridge();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Intelligence desk simulator"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span className={cn(TERMINAL_TYPO.label, "text-violet-200")}>INTELLIGENCE DESK · SIMULATOR</span>
        </div>
        <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-200")}>
          EXIT <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex shrink-0 gap-0.5 px-3 py-1.5" aria-hidden="true">
        {scenes.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              "h-1 flex-1 transition-colors duration-300",
              i < index ? "bg-violet-800" : i === index ? "bg-violet-400" : "bg-slate-800",
            )}
          />
        ))}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          <IntelligenceDeskPlayground visual={scene.visual} sceneKey={sceneKey} animate={playing} />
          <div className="border border-slate-700/60 bg-slate-900/40 p-4">
            <span className={cn(TERMINAL_TYPO.micro, "text-violet-500")}>{scene.chapter}</span>
            <h2 className="font-mono text-lg font-semibold text-slate-100">{scene.title}</h2>
            {scene.takeaway ? <p className="mt-1.5 font-mono text-sm text-slate-300">{scene.takeaway}</p> : null}
          </div>
        </div>
      </div>
      <p className="shrink-0 px-4 pb-1 text-center font-mono text-xs text-slate-300" aria-live="polite">
        {captionVoice}
      </p>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2.5">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setIndex(index - 1)}
          className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1", isFirst ? "text-slate-700" : "text-slate-400")}
        >
          <ArrowLeft className="inline h-3 w-3" /> BACK
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-violet-500/60 text-violet-200" : "border-slate-700 text-slate-300")}
        >
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
          <button
            type="button"
            onClick={findItLive}
            className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-violet-500/70 bg-violet-950/40 px-2 py-1 text-violet-200")}
          >
            FIND IT LIVE <Radio className="h-3 w-3" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex(index + 1)}
            className={cn(TERMINAL_TYPO.micro, "border border-violet-700/50 px-2 py-1 text-violet-300")}
          >
            <AcademyNextLabel />
          </button>
        )}
      </div>
    </div>
  );
}
