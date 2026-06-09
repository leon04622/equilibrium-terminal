"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { MarketPlayground } from "@/components/terminal/explain/market-mechanics/MarketPlayground";
import { MARKET_MECHANICS_SCENES } from "@/lib/education/marketMechanicsScenes";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { useMarketMechanicsStore } from "@/store/useMarketMechanicsStore";
import { useOrderBookLessonStore } from "@/store/useOrderBookLessonStore";

const scenes = MARKET_MECHANICS_SCENES;

/** Rough read time so muted / unsupported playback still auto-advances calmly. */
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

export function MarketMechanicsSimulator() {
  const active = useMarketMechanicsStore((s) => s.active);
  const runId = useMarketMechanicsStore((s) => s.runId);
  const startStep = useMarketMechanicsStore((s) => s.startStep);
  const close = useMarketMechanicsStore((s) => s.close);
  const restart = useMarketMechanicsStore((s) => s.restart);
  const markStep = useMarketMechanicsStore((s) => s.markStep);
  const markCompleted = useMarketMechanicsStore((s) => s.markCompleted);

  const openOrderBook = useOrderBookLessonStore((s) => s.open);

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
        if (holdTimer.current) clearTimeout(holdTimer.current);
        const baseHold = s.holdMs ?? 1400;
        const hold = Math.round(baseHold * (reduceMotionRef.current ? 0.5 : 1));
        holdTimer.current = setTimeout(() => {
          if (tokenRef.current !== token) return;
          if (playingRef.current && i < scenes.length - 1) setIndex(i + 1);
        }, hold);
      };

      if (voiceOnRef.current && supported) {
        speakLesson(s.voice, {
          rate: 0.9,
          onEnd: afterNarration,
          onError: () => {
            if (tokenRef.current !== token) return;
            holdTimer.current = setTimeout(afterNarration, estimateMs(s.voice));
          },
        });
      } else {
        holdTimer.current = setTimeout(afterNarration, estimateMs(s.voice));
      }
    },
    [supported, clearTimers],
  );

  // Reset to the resume point whenever the simulator is (re)opened.
  useEffect(() => {
    if (!active) return;
    const start = Math.min(Math.max(startStep, 0), scenes.length - 1);
    setIndex(start);
    setPlaying(true);
    playingRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId]);

  // Narrate + time the current scene.
  useEffect(() => {
    if (!active) return;
    enter(index);
    markStep(index);
    if (index >= scenes.length - 1) markCompleted();
    return () => {
      clearTimers();
      cancelLesson();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, index]);

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

  const goto = (i: number) => {
    clearTimers();
    setIndex(Math.min(Math.max(i, 0), scenes.length - 1));
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      playingRef.current = false;
      cancelLesson();
      clearTimers();
    } else {
      setPlaying(true);
      playingRef.current = true;
      enter(index);
    }
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    voiceOnRef.current = next;
    setLessonVoiceEnabled(next);
    cancelLesson();
    if (playingRef.current) enter(index);
  };

  const repeat = () => {
    if (!voiceOn && supported) {
      setVoiceOn(true);
      voiceOnRef.current = true;
      setLessonVoiceEnabled(true);
    }
    enter(index);
  };

  const doRestart = () => {
    clearTimers();
    cancelLesson();
    restart();
  };

  const continueToOrderBook = () => {
    exit();
    openOrderBook();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-label="Market mechanics simulator"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className={cn(TERMINAL_TYPO.label, "truncate text-emerald-200")}>
            MARKET MECHANICS · SIMULATOR
          </span>
          <span className={cn(TERMINAL_TYPO.micro, "shrink-0 text-emerald-500")}>FIRST PRINCIPLES</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={doRestart}
            className={cn(
              TERMINAL_TYPO.micro,
              "hidden items-center gap-1 border border-slate-700 px-1.5 py-0.5 text-slate-400 hover:text-slate-200 sm:flex",
            )}
          >
            <RotateCcw className="h-3 w-3" /> RESTART
          </button>
          <button
            type="button"
            onClick={exit}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex items-center gap-1 text-slate-500 hover:text-slate-200",
            )}
            aria-label="Exit simulator"
          >
            EXIT <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex shrink-0 gap-0.5 px-3 py-1.5" aria-hidden="true">
        {scenes.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              "h-1 flex-1 transition-colors",
              i < index ? "bg-emerald-800" : i === index ? "bg-emerald-400" : "bg-slate-800",
            )}
          />
        ))}
      </div>

      {/* Stage */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          {/* The animated playground */}
          <div className="order-2 md:order-1">
            <MarketPlayground visual={scene.visual} reduceMotion={reduceMotion} />
          </div>

          {/* Micro teaching card — one idea, one line */}
          <div className="order-1 md:order-2">
            <div className="border border-slate-700/60 bg-slate-900/40 p-4">
              <span className={cn(TERMINAL_TYPO.micro, "mb-2 inline-block text-emerald-500/90")}>
                {scene.chapter}
              </span>
              <h2 className="font-mono text-lg font-semibold leading-tight text-slate-100">
                {scene.title}
              </h2>
              {scene.takeaway ? (
                <p className="mt-1.5 font-mono text-sm leading-relaxed text-slate-300">
                  {scene.takeaway}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Caption / subtitle (accessibility + read-along + no-voice fallback) */}
      <div className="shrink-0 px-4 pb-1" aria-live="polite">
        <p className="mx-auto max-w-2xl text-center font-mono text-xs leading-relaxed text-slate-300">
          <span className="mr-1.5 rounded-sm border border-slate-700 px-1 text-[9px] text-slate-500">
            CC
          </span>
          {scene.voice}
        </p>
        {!supported ? (
          <p className="mx-auto mt-1 max-w-2xl text-center text-[10px] text-slate-600">
            Voice isn&apos;t available in this browser — follow along with the captions.
          </p>
        ) : null}
      </div>

      {/* Transport */}
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2.5">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => goto(index - 1)}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border border-slate-700 px-2 py-1",
            isFirst ? "text-slate-700" : "text-slate-400 hover:border-slate-500",
          )}
        >
          <ArrowLeft className="h-3 w-3" /> BACK
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border px-2 py-1",
            playing
              ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-200"
              : "border-slate-700 text-slate-300 hover:border-slate-500",
          )}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playing ? "PAUSE" : "PLAY"}
        </button>

        <button
          type="button"
          onClick={repeat}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border border-slate-700 px-2 py-1 text-slate-300 hover:border-slate-500",
          )}
        >
          <Repeat className="h-3 w-3" /> REPEAT
        </button>

        <button
          type="button"
          onClick={toggleVoice}
          disabled={!supported}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border px-2 py-1",
            !supported
              ? "border-slate-800 text-slate-700"
              : voiceOn
                ? "border-slate-700 text-slate-300"
                : "border-rose-700/50 text-rose-300",
          )}
          title={supported ? undefined : "Voice not supported in this browser — read the captions"}
        >
          {voiceOn && supported ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          {!supported ? "NO VOICE" : voiceOn ? "VOICE" : "MUTED"}
        </button>

        {isLast ? (
          <>
            <button
              type="button"
              onClick={continueToOrderBook}
              className={cn(
                TERMINAL_TYPO.micro,
                "flex items-center gap-1 border border-cyan-600/60 bg-cyan-950/30 px-2 py-1 text-cyan-200 hover:bg-cyan-900/40",
              )}
            >
              TEACH ME THE ORDER BOOK <ArrowRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={exit}
              className={cn(
                TERMINAL_TYPO.micro,
                "flex items-center gap-1 border border-emerald-700/50 bg-emerald-950/30 px-2 py-1 text-emerald-300",
              )}
            >
              DONE
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => goto(index + 1)}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex items-center gap-1 border border-emerald-700/50 bg-emerald-950/30 px-2 py-1 text-emerald-300 hover:bg-emerald-950/50",
            )}
          >
            NEXT <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
