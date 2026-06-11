"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MousePointerClick,
  Pause,
  Play,
  Radio,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { MarketOrderDemo } from "@/components/terminal/explain/market-mechanics/MarketOrderDemo";
import {
  ConditionComparison,
  DecisionScenario,
  ObservationalPause,
  PreTradeCheckPanel,
} from "@/components/terminal/explain/OperatorDecisionPanels";
import {
  ORDER_BOOK_BRIDGE_PANEL,
  ORDER_BOOK_BRIDGE_STEPS,
  ORDER_BOOK_REQUIRED_CONCEPTS,
  type BookRegion,
} from "@/lib/education/lessonBridgeSteps";
import { LiveBookCoach } from "@/lib/education/liveBookCoach";
import { buildBridgeNarration, speakAcademyNarration } from "@/lib/education/academyVoice";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  armLessonVoice,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { terminalBus } from "@/store/eventBus";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { useLessonBridgeStore } from "@/store/useLessonBridgeStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = ORDER_BOOK_BRIDGE_STEPS;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function estimateMs(text: string): number {
  return Math.max(2800, text.length * 58);
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

function bookPanelEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[data-book-panel="${ORDER_BOOK_BRIDGE_PANEL}"]`);
}

function regionEl(region: BookRegion): HTMLElement | null {
  const panel = bookPanelEl();
  if (!panel) return null;
  if (!region || region === "book") return panel;
  return panel.querySelector<HTMLElement>(`[data-book-region="${region}"]`) ?? panel;
}

function rectsDiffer(a: Rect | null, b: Rect | null): boolean {
  if (!a || !b) return a !== b;
  return (
    Math.abs(a.top - b.top) > 0.5 ||
    Math.abs(a.left - b.left) > 0.5 ||
    Math.abs(a.width - b.width) > 0.5 ||
    Math.abs(a.height - b.height) > 0.5
  );
}

export function LessonLiveBridge() {
  const active = useLessonBridgeStore((s) => s.active);
  const runId = useLessonBridgeStore((s) => s.runId);
  const close = useLessonBridgeStore((s) => s.close);
  const markBridgeCompleted = useLessonBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = useLessonBridgeStore((s) => s.markRecognized);
  const markDecision = useLessonBridgeStore((s) => s.markDecision);
  const recognized = useLessonBridgeStore((s) => s.recognized);
  const setStoreStep = useLessonBridgeStore((s) => s.setStep);

  const setFocusMode = useOperatorGuideStore((s) => s.setFocusMode);
  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);

  useHyperliquidStore((s) => s.bookVersion);
  const book = useHyperliquidStore((s) => s.book);

  const reduceMotion = usePrefersReducedMotion();
  const supported = lessonVoiceSupported();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
  const [rect, setRect] = useState<Rect | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [interactiveDone, setInteractiveDone] = useState(false);

  const tokenRef = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(playing);
  const voiceOnRef = useRef(voiceOn);
  const reduceMotionRef = useRef(reduceMotion);
  const indexRef = useRef(index);
  const feedbackRef = useRef<"idle" | "correct" | "wrong">("idle");
  playingRef.current = playing;
  voiceOnRef.current = voiceOn;
  reduceMotionRef.current = reduceMotion;
  indexRef.current = index;

  const step = steps[Math.min(index, steps.length - 1)];

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const lineFor = useCallback((i: number) => {
    const s = steps[i];
    if (!s) return "";
    return s.coach(useHyperliquidStore.getState().book);
  }, []);

  const enter = useCallback(
    (i: number) => {
      const token = ++tokenRef.current;
      clearTimers();
      setFeedback("idle");
      feedbackRef.current = "idle";
      const s = steps[i];
      if (!s) return;
      if (i >= steps.length - 1) markBridgeCompleted();

      const book = useHyperliquidStore.getState().book;
      const coachText = lineFor(i);
      const text = buildBridgeNarration(s, coachText, book);
      const waitsForUser =
        s.mode === "recognize" || s.mode === "decide" || s.mode === "compare" || s.mode === "observe";
      const autoAdvance = !waitsForUser;
      setInteractiveDone(false);
      const baseHold = s.mode === "demo" ? 3600 : s.id === "done" ? 1400 : 1700;

      const afterNarration = () => {
        if (tokenRef.current !== token) return;
        if (!autoAdvance) return;
        if (holdTimer.current) clearTimeout(holdTimer.current);
        const hold = Math.round(baseHold * (reduceMotionRef.current ? 0.5 : 1));
        holdTimer.current = setTimeout(() => {
          if (tokenRef.current !== token) return;
          if (playingRef.current && i < steps.length - 1) setIndex(i + 1);
        }, hold);
      };

      speakAcademyNarration(text, {
        voiceOn: voiceOnRef.current,
        supported,
        rate: 0.94,
        onEnd: afterNarration,
        onError: () => {
          if (tokenRef.current !== token) return;
          if (autoAdvance) holdTimer.current = setTimeout(afterNarration, estimateMs(text));
        },
      });
    },
    [supported, clearTimers, lineFor, markBridgeCompleted],
  );

  // Spotlight the REAL order book panel while the bridge is open.
  useEffect(() => {
    if (!active) return;
    armLessonVoice();
    setHighlightPanel(ORDER_BOOK_BRIDGE_PANEL);
    setFocusMode(true);
    terminalBus.emit("widget:focus", { widgetId: ORDER_BOOK_BRIDGE_PANEL });
    return () => {
      setFocusMode(false);
      setHighlightPanel(null);
    };
  }, [active, runId, setFocusMode, setHighlightPanel]);

  useEffect(() => {
    if (!active) return;
    setIndex(0);
    setPlaying(true);
    playingRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId]);

  useEffect(() => {
    if (!active) return;
    setStoreStep(index);
    enter(index);
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, index]);

  // Track the live region rect — but never during recognition (it's a test).
  useEffect(() => {
    if (!active || step?.mode === "recognize") {
      setRect(null);
      return;
    }
    let raf = 0;
    let last: Rect | null = null;
    const tick = () => {
      const el = regionEl(step?.region ?? null);
      if (el) {
        const r = el.getBoundingClientRect();
        const next: Rect = { top: r.top, left: r.left, width: r.width, height: r.height };
        if (rectsDiffer(last, next)) {
          last = next;
          setRect(next);
        }
      } else if (last !== null) {
        last = null;
        setRect(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index]);

  // PHASE 2/9 — recognition: validate clicks on the REAL panel regions.
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      const cur = steps[indexRef.current];
      if (!cur?.recognize) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const panel = target.closest(`[data-book-panel="${ORDER_BOOK_BRIDGE_PANEL}"]`);
      const regionNode = target.closest("[data-book-region]") as HTMLElement | null;
      if (!panel || !regionNode) return; // clicked elsewhere — ignore quietly
      const region = regionNode.getAttribute("data-book-region") as Exclude<BookRegion, null> | null;
      if (!region) return;

      if (cur.recognize.accept.includes(region)) {
        if (feedbackRef.current === "correct") return;
        feedbackRef.current = "correct";
        setFeedback("correct");
        if (cur.conceptId) markRecognized(cur.conceptId);
        cancelLesson();
        if (voiceOnRef.current && supported) speakLesson("That's it — nicely done.", { rate: 0.95 });
        clearTimers();
        holdTimer.current = setTimeout(() => {
          feedbackRef.current = "idle";
          setIndex((i) => Math.min(i + 1, steps.length - 1));
        }, 1300);
      } else {
        feedbackRef.current = "wrong";
        setFeedback("wrong");
        cancelLesson();
        if (voiceOnRef.current && supported) speakLesson(cur.recognize.nudge, { rate: 0.95 });
        if (fbTimer.current) clearTimeout(fbTimer.current);
        fbTimer.current = setTimeout(() => {
          feedbackRef.current = "idle";
          setFeedback("idle");
        }, 1600);
      }
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, markRecognized, supported, clearTimers]);

  const exit = useCallback(() => {
    clearTimers();
    if (fbTimer.current) clearTimeout(fbTimer.current);
    cancelLesson();
    close();
  }, [close, clearTimers]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, exit]);

  const advanceAfterInteractive = useCallback(() => {
    setInteractiveDone(true);
    clearTimers();
    holdTimer.current = setTimeout(() => {
      if (playingRef.current && indexRef.current < steps.length - 1) {
        setIndex((i) => Math.min(i + 1, steps.length - 1));
      }
    }, 1400);
  }, [clearTimers]);

  if (!active || !step) return null;

  const isLast = index >= steps.length - 1;
  const isFirst = index <= 0;
  const isRecognize = step.mode === "recognize";
  const isDemo = step.mode === "demo";
  const isObserve = step.mode === "observe";
  const isCompare = step.mode === "compare";
  const isDecide = step.mode === "decide";
  const isInteractive = isRecognize || isObserve || isCompare || isDecide;
  const isDone = step.id === "done";
  const liveLine = step.coach(book);
  const whyCareLine = step.whyCare?.(book);

  const goto = (i: number) => {
    clearTimers();
    feedbackRef.current = "idle";
    setInteractiveDone(false);
    setIndex(Math.min(Math.max(i, 0), steps.length - 1));
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

  const stateTone =
    step.id === "live-spread" || step.id === "pretrade"
      ? LiveBookCoach.spread(book).state
      : step.id === "live-conditions"
        ? LiveBookCoach.tradeEnvironment(book) === "good"
          ? "good"
          : LiveBookCoach.tradeEnvironment(book) === "avoid"
            ? "danger"
            : "neutral"
        : "neutral";
  const ringColor =
    stateTone === "danger"
      ? "ring-rose-400/80 shadow-[0_0_30px_rgba(244,63,94,0.45)]"
      : stateTone === "warn"
        ? "ring-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
        : "ring-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.4)]";

  return (
    <>
      {/* Region spotlight ring over the REAL panel (follows live geometry). */}
      {rect ? (
        <div
          className={cn(
            "pointer-events-none fixed z-[150] rounded-md ring-2 transition-all duration-300",
            ringColor,
          )}
          style={{ top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 }}
          aria-hidden="true"
        />
      ) : null}

      {/* Coach card */}
      <div
        className="fixed inset-x-0 bottom-0 z-[160] flex justify-center px-3 pb-3"
        role="dialog"
        aria-modal="false"
        aria-label="Lesson-to-live bridge coach"
      >
        <div
          key={index}
          className={cn(
            "w-full max-w-xl border bg-slate-950/95 shadow-[0_-8px_40px_rgba(0,0,0,0.6)] backdrop-blur",
            isInteractive ? "border-violet-600/60" : "border-cyan-700/50",
          )}
          style={reduceMotion ? undefined : { animation: "fadeIn 240ms ease" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <Radio className={cn("h-3.5 w-3.5 shrink-0", isInteractive ? "text-violet-400" : "text-cyan-400")} />
              <span className={cn(TERMINAL_TYPO.label, isInteractive ? "text-violet-200" : "text-cyan-200")}>
                OPERATOR DECISION
              </span>
              <span className={cn(TERMINAL_TYPO.micro, "shrink-0 text-slate-500")}>{step.chapter}</span>
            </div>
            <button
              type="button"
              onClick={exit}
              className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-500 hover:text-slate-200")}
              aria-label="Exit live bridge"
            >
              EXIT <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-0.5 px-3 pt-1.5" aria-hidden="true">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-1 flex-1 transition-colors",
                  i < index
                    ? ["recognize", "decide", "compare", "observe"].includes(s.mode)
                      ? "bg-violet-800"
                      : "bg-cyan-800"
                    : i === index
                      ? ["recognize", "decide", "compare", "observe"].includes(s.mode)
                        ? "bg-violet-400"
                        : "bg-cyan-400"
                      : "bg-slate-800",
                )}
              />
            ))}
          </div>

          {/* Body */}
          <div className="px-3 py-2.5">
            <h2 className="font-mono text-sm font-semibold leading-tight text-slate-100">{step.title}</h2>

            {whyCareLine ? (
              <p className="mt-1 font-mono text-[10px] leading-snug text-amber-300/90">
                <span className="text-amber-500">WHY CARE </span>
                {whyCareLine}
              </p>
            ) : null}

            {/* Demo animation */}
            {isDemo && step.demo ? (
              <div className="mt-2">
                <MarketOrderDemo kind={step.demo} reduceMotion={reduceMotion} />
              </div>
            ) : null}

            {isObserve && step.observe ? (
              <ObservationalPause
                question={step.observe.question}
                reveal={step.observe.reveal}
                ced={step.observe.ced}
                onRevealed={() => {
                  markDecision(step.id);
                  advanceAfterInteractive();
                }}
              />
            ) : null}

            {isCompare && step.compare ? (
              <ConditionComparison
                good={step.compare.good}
                bad={step.compare.bad}
                onPicked={() => {
                  markDecision(step.id);
                  advanceAfterInteractive();
                }}
              />
            ) : null}

            {isDecide && step.decide ? (
              <DecisionScenario
                prompt={step.decide.prompt}
                options={step.decide.options}
                explanation={step.decide.explanation}
                onResolved={() => {
                  markDecision(step.id);
                  advanceAfterInteractive();
                }}
              />
            ) : null}

            {/* Recognition prompt + feedback (Phase 9) */}
            {isRecognize ? (
              <div className="mt-2">
                <p
                  className={cn(
                    "flex items-center gap-1.5 font-mono text-xs",
                    feedback === "correct"
                      ? "text-emerald-300"
                      : feedback === "wrong"
                        ? "text-amber-300"
                        : "text-violet-200",
                  )}
                  aria-live="polite"
                >
                  {feedback === "correct" ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> That&apos;s it — nicely done.
                    </>
                  ) : feedback === "wrong" ? (
                    step.recognize?.nudge
                  ) : (
                    <>
                      <MousePointerClick className="h-3.5 w-3.5 animate-pulse" /> {step.recognize?.prompt}
                    </>
                  )}
                </p>
                {!LiveBookCoach.hasBook(book) ? (
                  <p className="mt-1 font-mono text-[10px] text-amber-400/90">
                    Open the order book (Ctrl+2) so you can click on it.
                  </p>
                ) : null}
              </div>
            ) : !isObserve && !isCompare && !isDecide ? (
              <p className="mt-2 font-mono text-xs leading-relaxed text-slate-200" aria-live="polite">
                {liveLine}
              </p>
            ) : !isObserve ? (
              <p className="mt-2 font-mono text-xs leading-relaxed text-slate-300" aria-live="polite">
                {liveLine}
              </p>
            ) : null}

            {!isRecognize && !LiveBookCoach.hasBook(book) ? (
              <p className="mt-1.5 font-mono text-[10px] text-amber-400/90">
                The live order book isn&apos;t loaded yet — open it (Ctrl+2) to see the highlight.
              </p>
            ) : null}

            {step.id === "pretrade" ? (
              <PreTradeCheckPanel
                buyItems={LiveBookCoach.preTradeBuyCheck(book)}
                sellItems={LiveBookCoach.preTradeSellCheck(book)}
              />
            ) : null}

            {/* Validation summary (Phase 9) */}
            {isDone ? (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {ORDER_BOOK_REQUIRED_CONCEPTS.map((c) => {
                  const ok = recognized.includes(c);
                  return (
                    <div
                      key={c}
                      className={cn(
                        "flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wide",
                        ok
                          ? "border-emerald-700/40 bg-emerald-950/20 text-emerald-200"
                          : "border-slate-700 bg-slate-900/40 text-slate-500",
                      )}
                    >
                      <Check className={cn("h-3 w-3", ok ? "opacity-90" : "opacity-30")} /> {c}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Transport */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800 px-3 py-2">
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

            {!isInteractive ? (
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
            ) : null}

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
            >
              {voiceOn && supported ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {!supported ? "NO VOICE" : voiceOn ? "VOICE" : "MUTED"}
            </button>

            {isInteractive && !interactiveDone ? (
              <button
                type="button"
                onClick={() => goto(index + 1)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "flex items-center gap-1 border border-slate-800 px-2 py-1 text-slate-500 hover:text-slate-300",
                )}
              >
                SKIP
              </button>
            ) : isLast ? (
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
            ) : (
              <button
                type="button"
                onClick={() => goto(index + 1)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "flex items-center gap-1 border border-cyan-700/50 bg-cyan-950/30 px-2 py-1 text-cyan-300 hover:bg-cyan-950/50",
                )}
              >
                NEXT <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
