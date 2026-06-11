"use client";

import {
  ArrowLeft,
  ArrowRight,
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
import { SlippagePlayground } from "@/components/terminal/explain/slippage/SlippagePlayground";
import { SLIPPAGE_SCENES } from "@/lib/education/slippageScenes";
import { useLessonSceneDriver } from "@/lib/education/useLessonSceneDriver";
import { primeLessonVoice } from "@/lib/education/LessonNarrator";
import { useSlippageStore } from "@/store/useSlippageStore";
import { useSlippageBridgeStore } from "@/store/useSlippageBridgeStore";

const scenes = SLIPPAGE_SCENES;

export function SlippageSimulator() {
  const active = useSlippageStore((s) => s.active);
  const runId = useSlippageStore((s) => s.runId);
  const startStep = useSlippageStore((s) => s.startStep);
  const close = useSlippageStore((s) => s.close);
  const restart = useSlippageStore((s) => s.restart);
  const markStep = useSlippageStore((s) => s.markStep);
  const markCompleted = useSlippageStore((s) => s.markCompleted);
  const startBridge = useSlippageBridgeStore((s) => s.start);
  const markSimulatorCompleted = useSlippageBridgeStore((s) => s.markSimulatorCompleted);

  const {
    index,
    setIndex,
    playing,
    voiceOn,
    scene,
    reduceMotion,
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
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950 transition-opacity duration-200" role="dialog" aria-modal="true" aria-label="Slippage simulator">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>SLIPPAGE · SIMULATOR</span>
        </div>
        <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-200")}>
          EXIT <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex shrink-0 gap-0.5 px-3 py-1.5" aria-hidden="true">
        {scenes.map((s, i) => (
          <span key={s.id} className={cn("h-1 flex-1 transition-colors duration-300", i < index ? "bg-cyan-800" : i === index ? "bg-cyan-400" : "bg-slate-800")} />
        ))}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          <SlippagePlayground visual={scene.visual} reduceMotion={reduceMotion} sceneKey={sceneKey} animate={playing} />
          <div className="border border-slate-700/60 bg-slate-900/40 p-4">
            <span className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>{scene.chapter}</span>
            <h2 className="font-mono text-lg font-semibold text-slate-100">{scene.title}</h2>
            {scene.takeaway ? <p className="mt-1.5 font-mono text-sm text-slate-300">{scene.takeaway}</p> : null}
          </div>
        </div>
      </div>
      <p className="shrink-0 px-4 pb-1 text-center font-mono text-xs text-slate-300" aria-live="polite">{scene.voice}</p>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2.5">
        <button type="button" disabled={isFirst} onClick={() => setIndex(index - 1)} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1", isFirst ? "text-slate-700" : "text-slate-400")}>
          <ArrowLeft className="inline h-3 w-3" /> BACK
        </button>
        <button type="button" onClick={togglePlay} className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-cyan-500/60 text-cyan-200" : "border-slate-700 text-slate-300")}>
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
          <button type="button" onClick={findItLive} className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-cyan-500/70 bg-cyan-950/40 px-2 py-1 text-cyan-200")}>
            FIND IT LIVE <Radio className="h-3 w-3" />
          </button>
        ) : (
          <button type="button" onClick={() => setIndex(index + 1)} className={cn(TERMINAL_TYPO.micro, "border border-cyan-700/50 px-2 py-1 text-cyan-300")}>
            NEXT <ArrowRight className="inline h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
