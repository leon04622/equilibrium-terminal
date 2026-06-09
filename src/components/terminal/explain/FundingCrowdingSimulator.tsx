"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { FundingCrowdingPlayground } from "@/components/terminal/explain/funding-crowding/FundingCrowdingPlayground";
import { FUNDING_CROWDING_SCENES } from "@/lib/education/fundingCrowdingScenes";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { useFundingCrowdingStore } from "@/store/useFundingCrowdingStore";
import { useFundingBridgeStore } from "@/store/useFundingBridgeStore";

const scenes = FUNDING_CROWDING_SCENES;

function estimateMs(text: string): number {
  return Math.max(2600, text.length * 60);
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function FundingCrowdingSimulator() {
  const active = useFundingCrowdingStore((s) => s.active);
  const runId = useFundingCrowdingStore((s) => s.runId);
  const startStep = useFundingCrowdingStore((s) => s.startStep);
  const close = useFundingCrowdingStore((s) => s.close);
  const restart = useFundingCrowdingStore((s) => s.restart);
  const markStep = useFundingCrowdingStore((s) => s.markStep);
  const markCompleted = useFundingCrowdingStore((s) => s.markCompleted);

  const startBridge = useFundingBridgeStore((s) => s.start);
  const markSimulatorCompleted = useFundingBridgeStore((s) => s.markSimulatorCompleted);

  const reduceMotion = usePrefersReducedMotion();
  const supported = lessonVoiceSupported();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());

  const tokenRef = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(playing);
  const voiceOnRef = useRef(voiceOn);
  const reduceMotionRef = useRef(reduceMotion);
  playingRef.current = playing;
  voiceOnRef.current = voiceOn;
  reduceMotionRef.current = reduceMotion;

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const scene = scenes[Math.min(index, scenes.length - 1)];

  const enter = useCallback(
    (i: number) => {
      const token = ++tokenRef.current;
      clearTimers();
      const s = scenes[i];
      if (!s) return;
      const afterNarration = () => {
        if (tokenRef.current !== token) return;
        const hold = Math.round((s.holdMs ?? 1400) * (reduceMotionRef.current ? 0.5 : 1));
        holdTimer.current = setTimeout(() => {
          if (tokenRef.current !== token) return;
          if (playingRef.current && i < scenes.length - 1) setIndex(i + 1);
        }, hold);
      };
      if (voiceOnRef.current && supported) {
        speakLesson(s.voice, { rate: 0.9, onEnd: afterNarration, onError: () => {
          if (tokenRef.current !== token) return;
          holdTimer.current = setTimeout(afterNarration, estimateMs(s.voice));
        }});
      } else {
        holdTimer.current = setTimeout(afterNarration, estimateMs(s.voice));
      }
    },
    [supported, clearTimers],
  );

  useEffect(() => {
    if (!active) return;
    setIndex(Math.min(Math.max(startStep, 0), scenes.length - 1));
    setPlaying(true);
    playingRef.current = true;
  }, [active, runId, startStep]);

  useEffect(() => {
    if (!active) return;
    enter(index);
    markStep(index);
    if (index >= scenes.length - 1) markCompleted();
    return () => {
      clearTimers();
      cancelLesson();
    };
  }, [active, runId, index, enter, markStep, markCompleted, clearTimers]);

  const exit = useCallback(() => {
    clearTimers();
    cancelLesson();
    close();
  }, [close, clearTimers]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, scenes.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit]);

  if (!active || !scene) return null;

  const isLast = index >= scenes.length - 1;
  const isFirst = index <= 0;

  const findItLive = () => {
    markSimulatorCompleted();
    exit();
    startBridge();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label="Funding and crowding simulator">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span className={cn(TERMINAL_TYPO.label, "text-violet-200")}>FUNDING & CROWDING · SIMULATOR</span>
        </div>
        <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-200")}>
          EXIT <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex shrink-0 gap-0.5 px-3 py-1.5" aria-hidden="true">
        {scenes.map((s, i) => (
          <span key={s.id} className={cn("h-1 flex-1", i < index ? "bg-violet-800" : i === index ? "bg-violet-400" : "bg-slate-800")} />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          <FundingCrowdingPlayground visual={scene.visual} reduceMotion={reduceMotion} />
          <div className="border border-slate-700/60 bg-slate-900/40 p-4">
            <span className={cn(TERMINAL_TYPO.micro, "text-violet-500")}>{scene.chapter}</span>
            <h2 className="font-mono text-lg font-semibold text-slate-100">{scene.title}</h2>
            {scene.takeaway ? <p className="mt-1.5 font-mono text-sm text-slate-300">{scene.takeaway}</p> : null}
          </div>
        </div>
      </div>

      <p className="shrink-0 px-4 pb-1 text-center font-mono text-xs text-slate-300" aria-live="polite">{scene.voice}</p>

      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2.5">
        <button type="button" disabled={isFirst} onClick={() => setIndex((i) => Math.max(i - 1, 0))} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1", isFirst ? "text-slate-700" : "text-slate-400")}>
          <ArrowLeft className="inline h-3 w-3" /> BACK
        </button>
        <button type="button" onClick={() => { if (playing) { setPlaying(false); playingRef.current = false; cancelLesson(); clearTimers(); } else { setPlaying(true); playingRef.current = true; enter(index); } }} className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-violet-500/60 text-violet-200" : "border-slate-700 text-slate-300")}>
          {playing ? <Pause className="inline h-3 w-3" /> : <Play className="inline h-3 w-3" />}
        </button>
        <button type="button" onClick={() => { const n = !voiceOn; setVoiceOn(n); voiceOnRef.current = n; setLessonVoiceEnabled(n); cancelLesson(); if (playingRef.current) enter(index); }} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-300")}>
          {voiceOn ? <Volume2 className="inline h-3 w-3" /> : <VolumeX className="inline h-3 w-3" />}
        </button>
        <button type="button" onClick={() => enter(index)} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <Repeat className="inline h-3 w-3" />
        </button>
        <button type="button" onClick={() => { clearTimers(); cancelLesson(); restart(); }} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
          <RotateCcw className="inline h-3 w-3" />
        </button>
        {isLast ? (
          <button type="button" onClick={findItLive} className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 border border-violet-500/70 bg-violet-950/40 px-2 py-1 text-violet-200")}>
            FIND IT LIVE <Radio className="h-3 w-3" />
          </button>
        ) : (
          <button type="button" onClick={() => setIndex((i) => Math.min(i + 1, scenes.length - 1))} className={cn(TERMINAL_TYPO.micro, "border border-violet-700/50 px-2 py-1 text-violet-300")}>
            NEXT <ArrowRight className="inline h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
