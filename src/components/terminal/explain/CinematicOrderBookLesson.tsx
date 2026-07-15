"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  GraduationCap,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  TriangleAlert,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";
import { MiniOrderBook } from "@/components/terminal/explain/MiniOrderBook";
import {
  ORDER_BOOK_BEATS,
  ORDER_BOOK_REPLAY_SCENARIO,
  type OBHighlight,
} from "@/lib/education/orderBookLessonScenes";
import { speakAcademyNarration } from "@/lib/education/academyVoice";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  isLessonSpeaking,
  lessonVoiceSupported,
  armLessonVoice,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { OperatorGuideOrchestrator } from "@/lib/operator-guide/OperatorGuideOrchestrator";
import { useOrderBookLessonStore } from "@/store/useOrderBookLessonStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useLessonBridgeStore } from "@/store/useLessonBridgeStore";

const beats = ORDER_BOOK_BEATS;

/** Rough read time so muted / unsupported playback still auto-advances calmly. */
function estimateMs(text: string, beginner: boolean): number {
  const perChar = beginner ? 62 : 44;
  return Math.max(beginner ? 2600 : 1800, text.length * perChar);
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

export function CinematicOrderBookLesson() {
  const active = useOrderBookLessonStore((s) => s.active);
  const runId = useOrderBookLessonStore((s) => s.runId);
  const startStep = useOrderBookLessonStore((s) => s.startStep);
  const close = useOrderBookLessonStore((s) => s.close);
  const restart = useOrderBookLessonStore((s) => s.restart);
  const markStep = useOrderBookLessonStore((s) => s.markStep);
  const markCompleted = useOrderBookLessonStore((s) => s.markCompleted);
  const markReplayWatched = useOrderBookLessonStore((s) => s.markReplayWatched);

  const startBridge = useLessonBridgeStore((s) => s.start);
  const markLessonCompleted = useLessonBridgeStore((s) => s.markLessonCompleted);

  const audience = useOperatorGuideStore((s) => s.selectedAudience);
  const setSelectedAudience = useOperatorGuideStore((s) => s.setSelectedAudience);
  const isBeginner = audience === "beginner";

  const reduceMotion = usePrefersReducedMotion();
  const supported = lessonVoiceSupported();

  const [beatIndex, setBeatIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
  const [checkState, setCheckState] = useState<"idle" | "correct" | "wrong">("idle");
  const [reveal, setReveal] = useState(false);

  const tokenRef = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(playing);
  const voiceOnRef = useRef(voiceOn);
  const beginnerRef = useRef(isBeginner);
  const reduceMotionRef = useRef(reduceMotion);
  playingRef.current = playing;
  voiceOnRef.current = voiceOn;
  beginnerRef.current = isBeginner;
  reduceMotionRef.current = reduceMotion;

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (wrongTimer.current) {
      clearTimeout(wrongTimer.current);
      wrongTimer.current = null;
    }
  }, []);

  const beat = beats[Math.min(beatIndex, beats.length - 1)];

  const narrationText = useCallback((i: number) => {
    const b = beats[i];
    if (!b) return "";
    return beginnerRef.current ? b.narration : b.narrationPro ?? b.narration;
  }, []);

  // Drive a single beat: narrate, then (hands-free) wait + advance.
  const enter = useCallback(
    (i: number) => {
      const token = ++tokenRef.current;
      clearTimers();
      if (isLessonSpeaking()) cancelLesson();
      setCheckState("idle");
      setReveal(false);
      const b = beats[i];
      if (!b) return;

      const afterNarration = () => {
        if (tokenRef.current !== token) return;
        if (holdTimer.current) clearTimeout(holdTimer.current);
        if (b.check) return; // wait for the learner to respond
        // Reduced motion shortens the silent observation window.
        const baseHold = b.holdMs ?? 1200;
        const factor = beginnerRef.current ? 1 : 0.5;
        const hold = Math.round(baseHold * factor * (reduceMotionRef.current ? 0.5 : 1));
        holdTimer.current = setTimeout(() => {
          if (tokenRef.current !== token) return;
          if (playingRef.current && i < beats.length - 1) setBeatIndex(i + 1);
        }, hold);
      };

      const text = narrationText(i);
      speakAcademyNarration(text, {
        voiceOn: voiceOnRef.current,
        supported,
        rate: beginnerRef.current ? 0.88 : 1.04,
        onEnd: afterNarration,
        onError: () => {
          if (tokenRef.current !== token) return;
          holdTimer.current = setTimeout(afterNarration, estimateMs(text, beginnerRef.current));
        },
      });
    },
    [narrationText, supported, clearTimers],
  );

  // Reset to the resume point whenever the lesson is (re)opened.
  useEffect(() => {
    if (!active) return;
    const start = Math.min(Math.max(startStep, 0), beats.length - 1);
    setBeatIndex(start);
    setPlaying(false);
    playingRef.current = false;
    if (audience === "advanced" || audience === "scalp" || audience === "swing") {
      setSelectedAudience("beginner");
      // Sync the ref now so the first narration uses the beginner script/rate
      // even before the audience state re-render lands.
      beginnerRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId]);

  // Narrate + time the current beat. Re-runs on open (runId) and beat change.
  useEffect(() => {
    if (!active) return;
    if (!playingRef.current) {
      markStep(beatIndex);
      if (beats[beatIndex]?.phase === "outro") markCompleted();
      return;
    }
    enter(beatIndex);
    markStep(beatIndex);
    if (beats[beatIndex]?.phase === "outro") markCompleted();
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, beatIndex]);

  const exit = useCallback(() => {
    clearTimers();
    cancelLesson();
    close();
  }, [close, clearTimers]);

  // Keyboard transport.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "ArrowRight") setBeatIndex((i) => Math.min(i + 1, beats.length - 1));
      else if (e.key === "ArrowLeft") setBeatIndex((i) => Math.max(i - 1, 0));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit]);

  if (!active || !beat) return null;

  const isLast = beatIndex >= beats.length - 1;
  const isFirst = beatIndex <= 0;
  const isWatch = beat.phase === "watch";
  const isResult = beat.phase === "result";
  const isCheck = beat.phase === "check";

  const effectiveHighlight: OBHighlight =
    isCheck && reveal && beat.check ? beat.check.target : beat.highlight;

  const goto = (i: number) => {
    clearTimers();
    setBeatIndex(Math.min(Math.max(i, 0), beats.length - 1));
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
      enter(beatIndex);
    }
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    voiceOnRef.current = next;
    setLessonVoiceEnabled(next);
    cancelLesson();
    if (playingRef.current) enter(beatIndex);
  };

  const repeat = () => {
    if (!voiceOn && supported) {
      setVoiceOn(true);
      voiceOnRef.current = true;
      setLessonVoiceEnabled(true);
    }
    enter(beatIndex);
  };

  const onRegion = (r: "bids" | "asks" | "spread") => {
    if (!beat.check) return;
    if (r === beat.check.target) {
      setCheckState("correct");
      setReveal(true);
      cancelLesson();
      if (voiceOnRef.current && supported) speakLesson("That's it. Nicely done.", { rate: 0.92 });
      clearTimers();
      holdTimer.current = setTimeout(() => {
        if (playingRef.current && !isLast) setBeatIndex(beatIndex + 1);
      }, 1900);
    } else {
      setCheckState("wrong");
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setCheckState("idle"), 1300);
    }
  };

  const showMe = () => {
    setReveal(true);
    setCheckState("correct");
    clearTimers();
    holdTimer.current = setTimeout(() => {
      if (!isLast) setBeatIndex(beatIndex + 1);
    }, 1700);
  };

  const watchItHappen = () => {
    markReplayWatched();
    exit();
    OperatorGuideOrchestrator.startScenario(ORDER_BOOK_REPLAY_SCENARIO);
  };

  const findItLive = () => {
    markLessonCompleted();
    exit();
    startBridge();
  };

  const doRestart = () => {
    clearTimers();
    cancelLesson();
    restart();
  };

  const caption = narrationText(beatIndex);

  const phaseAccent = isWatch
    ? "border-amber-500/50"
    : isResult
      ? "border-cyan-600/50"
      : isCheck
        ? "border-violet-500/50"
        : "border-slate-700/60";

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-label="Order book market simulator lesson"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <span className={cn(TERMINAL_TYPO.label, "truncate text-cyan-200")}>
            ORDER BOOK · MARKET SIMULATOR
          </span>
          <span
            className={cn(
              TERMINAL_TYPO.micro,
              "shrink-0",
              isBeginner ? "text-emerald-500" : "text-violet-400",
            )}
          >
            {isBeginner ? "BEGINNER" : "PRO"}
          </span>
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
            onClick={() => setSelectedAudience(isBeginner ? "advanced" : "beginner")}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-700 px-1.5 py-0.5 text-slate-400 hover:text-slate-200",
            )}
          >
            {isBeginner ? "PRO MODE" : "BEGINNER"}
          </button>
          <button
            type="button"
            onClick={exit}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex items-center gap-1 text-slate-500 hover:text-slate-200",
            )}
            aria-label="Exit lesson"
          >
            EXIT <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex shrink-0 gap-0.5 px-3 py-1.5" aria-hidden="true">
        {beats.map((b, i) => (
          <span
            key={b.id}
            className={cn(
              "h-1 flex-1 transition-colors",
              i < beatIndex ? "bg-cyan-800" : i === beatIndex ? "bg-cyan-400" : "bg-slate-800",
            )}
          />
        ))}
      </div>

      {/* Stage */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-2">
          {/* The animated teacher */}
          <div className="order-2 md:order-1">
            <MiniOrderBook
              scene={beat.scene}
              highlight={effectiveHighlight}
              sweep={beat.sweep}
              reduceMotion={reduceMotion}
              fx={beat.fx}
              onRegionClick={isCheck ? onRegion : undefined}
            />
          </div>

          {/* Micro teaching card */}
          <div className="order-1 md:order-2">
            <div className={cn("border bg-slate-900/40 p-4 transition-colors", phaseAccent)}>
              {isWatch ? (
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "mb-2 inline-flex items-center gap-1 text-amber-300",
                  )}
                >
                  <Eye className="h-3 w-3" /> WATCH
                </span>
              ) : isResult ? (
                <span className={cn(TERMINAL_TYPO.micro, "mb-2 inline-block text-cyan-400")}>
                  WHAT JUST HAPPENED
                </span>
              ) : beat.concept ? (
                <span className={cn(TERMINAL_TYPO.micro, "mb-2 inline-block text-slate-500")}>
                  {beat.concept}
                </span>
              ) : null}

              <h2 className="font-mono text-lg font-semibold leading-tight text-slate-100">
                {beat.cardTitle}
              </h2>
              <p className="mt-1.5 font-mono text-sm leading-relaxed text-slate-200">
                {beat.cardLine}
              </p>

              {beat.warn ? (
                <p
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "mt-2 flex items-start gap-1 leading-relaxed text-rose-300",
                  )}
                >
                  <TriangleAlert className="mt-px h-3 w-3 shrink-0" />
                  <span className="normal-case">{beat.warn}</span>
                </p>
              ) : null}

              {isCheck ? (
                <div className="mt-3">
                  <p className={cn(TERMINAL_TYPO.micro, "normal-case text-violet-300")}>
                    {beat.check?.prompt}
                  </p>
                  {checkState === "correct" ? (
                    <p
                      className={cn(
                        TERMINAL_TYPO.micro,
                        "mt-1 flex items-center gap-1 normal-case text-emerald-400",
                      )}
                    >
                      <Check className="h-3 w-3" /> Yes — that&apos;s the spread.
                    </p>
                  ) : checkState === "wrong" ? (
                    <p className={cn(TERMINAL_TYPO.micro, "mt-1 normal-case text-amber-300")}>
                      Not quite — the spread is the gap in the middle. Try again.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={showMe}
                      className={cn(
                        TERMINAL_TYPO.micro,
                        "mt-1 normal-case text-slate-500 underline decoration-dotted hover:text-slate-300",
                      )}
                    >
                      show me
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Caption / subtitle (accessibility + read-along + no-voice fallback) */}
      <div className="shrink-0 px-4 pb-1" aria-live="polite">
        <p className="mx-auto max-w-2xl text-center font-mono text-xs leading-relaxed text-slate-400">
          <span className="mr-1.5 rounded-sm border border-slate-700 px-1 text-[9px] text-slate-500">
            CC
          </span>
          {caption}
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
          onClick={() => goto(beatIndex - 1)}
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
              ? "border-cyan-500/60 bg-cyan-950/50 text-cyan-200"
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
              onClick={findItLive}
              className={cn(
                TERMINAL_TYPO.micro,
                "flex items-center gap-1 border border-cyan-500/70 bg-cyan-950/40 px-2 py-1 text-cyan-100 hover:bg-cyan-900/50",
              )}
            >
              NOW FIND IT LIVE
            </button>
            <button
              type="button"
              onClick={watchItHappen}
              className={cn(
                TERMINAL_TYPO.micro,
                "flex items-center gap-1 border border-amber-600/60 bg-amber-950/30 px-2 py-1 text-amber-200 hover:bg-amber-900/40",
              )}
            >
              WATCH IT HAPPEN
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
            onClick={() => goto(beatIndex + 1)}
            className={cn(
              TERMINAL_TYPO.micro,
              "flex items-center gap-1 border border-cyan-700/50 bg-cyan-950/30 px-2 py-1 text-cyan-300 hover:bg-cyan-950/50",
            )}
          >
            <AcademyNextLabel />
          </button>
        )}
      </div>
    </div>
  );
}
