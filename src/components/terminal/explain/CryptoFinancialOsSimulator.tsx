"use client";

import { ArrowLeft, GraduationCap, Pause, Play, Radio, Repeat, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { CryptoFinancialOsPlayground } from "@/components/terminal/explain/crypto-financial-os/CryptoFinancialOsPlayground";
import { CRYPTO_FINANCIAL_OS_SCENES } from "@/lib/education/cryptoFinancialOsScenes";
import { useLessonSceneDriver } from "@/lib/education/useLessonSceneDriver";
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import { useCryptoFinancialOsLessonStore } from "@/store/useCryptoFinancialOsLessonStore";
import { useCryptoFinancialOsBridgeStore } from "@/store/useCryptoFinancialOsBridgeStore";
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";

const scenes = CRYPTO_FINANCIAL_OS_SCENES;

export function CryptoFinancialOsSimulator() {
  const active = useCryptoFinancialOsLessonStore((s) => s.active);
  const runId = useCryptoFinancialOsLessonStore((s) => s.runId);
  const startStep = useCryptoFinancialOsLessonStore((s) => s.startStep);
  const close = useCryptoFinancialOsLessonStore((s) => s.close);
  const restart = useCryptoFinancialOsLessonStore((s) => s.restart);
  const markStep = useCryptoFinancialOsLessonStore((s) => s.markStep);
  const markCompleted = useCryptoFinancialOsLessonStore((s) => s.markCompleted);
  const startBridge = useCryptoFinancialOsBridgeStore((s) => s.start);
  const markSimulatorCompleted = useCryptoFinancialOsBridgeStore((s) => s.markSimulatorCompleted);

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
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label="Crypto Financial OS simulator">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
          <span className={cn(TERMINAL_TYPO.label, "truncate text-indigo-200")}>CRYPTO FINANCIAL OS · SIMULATOR</span>
          <span className={cn(TERMINAL_TYPO.micro, "shrink-0 text-indigo-600")}>PLATFORM</span>
        </div>
        <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-200")}>
          EXIT <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          <CryptoFinancialOsPlayground visual={scene.visual} reduceMotion={reduceMotion} sceneKey={sceneKey} animate={playing} />
          <div className="border border-slate-700/60 bg-slate-900/40 p-4">
            <span className={cn(TERMINAL_TYPO.micro, "text-indigo-500")}>{scene.chapter}</span>
            <h2 className="font-mono text-lg font-semibold text-slate-100">{scene.title}</h2>
            {scene.takeaway ? <p className="mt-1.5 font-mono text-sm text-slate-300">{scene.takeaway}</p> : null}
          </div>
        </div>
      </div>
      <p className="shrink-0 px-4 pb-1 text-center font-mono text-xs text-slate-300" aria-live="polite">{captionVoice}</p>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2.5">
        <button type="button" disabled={isFirst} onClick={() => setIndex(index - 1)} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <ArrowLeft className="inline h-3 w-3" aria-hidden />
        </button>
        <button type="button" onClick={togglePlay} className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-indigo-500/60 text-indigo-200" : "border-slate-700 text-slate-300")}>
          {playing ? <Pause className="inline h-3 w-3" aria-hidden /> : <Play className="inline h-3 w-3" aria-hidden />}
        </button>
        <button type="button" onClick={toggleVoice} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-300")}>
          {voiceOn ? <Volume2 className="inline h-3 w-3" aria-hidden /> : <VolumeX className="inline h-3 w-3" aria-hidden />}
        </button>
        <button type="button" onClick={replayScene} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <Repeat className="inline h-3 w-3" aria-hidden />
        </button>
        <button type="button" onClick={() => restart()} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <RotateCcw className="inline h-3 w-3" aria-hidden />
        </button>
        {isLast ? (
          <button type="button" onClick={findItLive} className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-indigo-500/70 bg-indigo-950/40 px-2 py-1 text-indigo-200")}>
            FIND IT LIVE <Radio className="h-3 w-3" aria-hidden />
          </button>
        ) : (
          <button type="button" aria-label="Next scene" onClick={() => setIndex(index + 1)} className={cn(TERMINAL_TYPO.micro, "border border-indigo-700/50 px-2 py-1 text-indigo-300")}>
            <AcademyNextLabel />
          </button>
        )}
      </div>
    </div>
  );
}
