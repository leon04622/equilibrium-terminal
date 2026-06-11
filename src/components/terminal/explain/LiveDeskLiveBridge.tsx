"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  MousePointerClick,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import {
  ConditionComparison,
  DecisionScenario,
} from "@/components/terminal/explain/OperatorDecisionPanels";
import {
  LIVE_DESK_BRIDGE_PANEL,
  LIVE_DESK_BRIDGE_STEPS,
  LIVE_DESK_REQUIRED_CONCEPTS,
  type LDBridgeRegion,
} from "@/lib/education/liveDeskBridgeSteps";
import { LiveDeskCoach } from "@/lib/education/liveDeskCoach";
import { buildBridgeNarration, speakAcademyNarration } from "@/lib/education/academyVoice";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  armLessonVoice,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { useLiveDeskBridgeStore } from "@/store/useLiveDeskBridgeStore";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = LIVE_DESK_BRIDGE_STEPS;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function ldContext() {
  const snap = useDailyOperationsStore.getState().snapshot;
  return LiveDeskCoach.contextFromStore(snap);
}

function panelEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[data-livedesk-panel="${LIVE_DESK_BRIDGE_PANEL}"]`);
}

function regionEl(region: LDBridgeRegion): HTMLElement | null {
  const panel = panelEl();
  if (!panel) return null;
  if (!region || region === "panel") return panel;
  return panel.querySelector<HTMLElement>(`[data-livedesk-region="${region}"]`) ?? panel;
}

export function LiveDeskLiveBridge() {
  const active = useLiveDeskBridgeStore((s) => s.active);
  const runId = useLiveDeskBridgeStore((s) => s.runId);
  const close = useLiveDeskBridgeStore((s) => s.close);
  const markBridgeCompleted = useLiveDeskBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = useLiveDeskBridgeStore((s) => s.markRecognized);
  const markDecision = useLiveDeskBridgeStore((s) => s.markDecision);
  const recognized = useLiveDeskBridgeStore((s) => s.recognized);
  const setStoreStep = useLiveDeskBridgeStore((s) => s.setStep);

  const setFocusMode = useOperatorGuideStore((s) => s.setFocusMode);
  const storeSnapshot = useDailyOperationsStore((s) => s.snapshot);
  const ctx = LiveDeskCoach.contextFromStore(storeSnapshot);

  const supported = lessonVoiceSupported();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
  const [rect, setRect] = useState<Rect | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [interactiveDone, setInteractiveDone] = useState(false);

  const tokenRef = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narratedKeyRef = useRef("");
  const skipIndexEffectRef = useRef(false);
  const enterRef = useRef<(i: number, force?: boolean) => void>(() => {});
  const indexRef = useRef(index);
  const playingRef = useRef(playing);
  const voiceOnRef = useRef(voiceOn);
  indexRef.current = index;
  playingRef.current = playing;
  voiceOnRef.current = voiceOn;

  const step = steps[Math.min(index, steps.length - 1)];

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const enter = useCallback(
    (i: number, force = false) => {
      const token = ++tokenRef.current;
      clearTimers();
      const speakKey = `${runId}:${i}`;
      if (!force && narratedKeyRef.current === speakKey) return;
      narratedKeyRef.current = speakKey;
      setFeedback("idle");
      setInteractiveDone(false);
      const s = steps[i];
      if (!s) return;
      if (i >= steps.length - 1) markBridgeCompleted();
      const snap = ldContext();
      const coachText = s.coach(snap);
      const extras =
        s.id === "workflow-plan"
          ? LiveDeskCoach.workflowSteps().map((w) => `${w.order}. ${w.label}: ${w.note}`)
          : [];
      const text = buildBridgeNarration(s, coachText, snap, extras);
      const waits = s.mode === "recognize" || s.mode === "decide" || s.mode === "compare";
      const after = () => {
        if (tokenRef.current !== token || waits) return;
        holdTimer.current = setTimeout(() => {
          if (playingRef.current && i < steps.length - 1) setIndex(i + 1);
        }, 1700);
      };
      speakAcademyNarration(text, {
        voiceOn: voiceOnRef.current,
        supported,
        rate: 0.94,
        onEnd: after,
        onError: after,
      });
    },
    [supported, clearTimers, markBridgeCompleted, runId],
  );

  enterRef.current = enter;

  const advanceAfterInteractive = useCallback(() => {
    setInteractiveDone(true);
    clearTimers();
    holdTimer.current = setTimeout(() => {
      if (playingRef.current && indexRef.current < steps.length - 1) setIndex((i) => i + 1);
    }, 1400);
  }, [clearTimers]);

  useEffect(() => {
    if (!active) return;
    armLessonVoice();
    setFocusMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      setFocusMode(false);
    };
  }, [active, runId, setFocusMode]);

  useEffect(() => {
    if (!active) return;
    skipIndexEffectRef.current = true;
    narratedKeyRef.current = `${runId}:0`;
    setIndex(0);
    setPlaying(true);
    playingRef.current = true;
    setStoreStep(0);
    enterRef.current(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId]);

  useEffect(() => {
    if (!active) return;
    if (skipIndexEffectRef.current) {
      skipIndexEffectRef.current = false;
      return;
    }
    const speakKey = `${runId}:${index}`;
    if (narratedKeyRef.current === speakKey) return;
    narratedKeyRef.current = speakKey;
    setStoreStep(index);
    enterRef.current(index, true);
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, index]);

  useEffect(() => {
    if (!active || step?.mode === "recognize") {
      setRect(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = regionEl(step?.region ?? null);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else setRect(null);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, index, step?.mode, step?.region]);

  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      const cur = steps[indexRef.current];
      if (!cur?.recognize) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const panel = target.closest(`[data-livedesk-panel="${LIVE_DESK_BRIDGE_PANEL}"]`);
      const regionNode = target.closest("[data-livedesk-region]") as HTMLElement | null;
      if (!panel || !regionNode) return;
      const region = regionNode.getAttribute("data-livedesk-region") as Exclude<LDBridgeRegion, null> | null;
      if (!region || !cur.recognize.accept.includes(region)) {
        if (region) {
          setFeedback("wrong");
          if (voiceOnRef.current) speakLesson(cur.recognize.nudge, { rate: 0.95 });
          setTimeout(() => setFeedback("idle"), 1600);
        }
        return;
      }
      setFeedback("correct");
      if (cur.conceptId) markRecognized(cur.conceptId);
      cancelLesson();
      advanceAfterInteractive();
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [active, markRecognized, advanceAfterInteractive]);

  const exit = useCallback(() => {
    clearTimers();
    cancelLesson();
    close();
  }, [close, clearTimers]);

  if (!active || !step) return null;

  const isLast = index >= steps.length - 1;
  const isInteractive = step.mode === "recognize" || step.mode === "decide" || step.mode === "compare";
  const liveLine = step.coach(ctx);
  const whyCare = step.whyCare?.(ctx);
  const workflow = LiveDeskCoach.workflowSteps();

  return (
    <>
      {rect ? (
        <div
          className="pointer-events-none fixed z-[150] rounded-md ring-2 ring-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition-all duration-300"
          style={{ top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 }}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-[160] flex justify-center px-3 pb-3">
        <div className={cn("w-full max-w-xl border bg-slate-950/95 backdrop-blur", isInteractive ? "border-cyan-600/60" : "border-cyan-700/50")}>
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
            <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>LIVE DESK BRIDGE · {step.chapter}</span>
            <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              EXIT <X className="inline h-3 w-3" />
            </button>
          </div>

          <div className="px-3 py-2.5">
            <h2 className="font-mono text-sm font-semibold text-slate-100">{step.title}</h2>
            {whyCare ? (
              <p className="mt-1 font-mono text-[10px] text-cyan-300/90">
                <span className="text-cyan-500">WHY CARE </span>
                {whyCare}
              </p>
            ) : null}

            {step.mode === "compare" && step.compare ? (
              <ConditionComparison
                good={step.compare.good}
                bad={step.compare.bad}
                onPicked={() => {
                  markDecision(step.id);
                  advanceAfterInteractive();
                }}
              />
            ) : null}

            {step.mode === "decide" && step.decide ? (
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

            {step.mode === "recognize" ? (
              <p className={cn("mt-2 flex items-center gap-1.5 font-mono text-xs", feedback === "correct" ? "text-cyan-300" : feedback === "wrong" ? "text-rose-300" : "text-cyan-200")}>
                {feedback === "correct" ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Correct.
                  </>
                ) : feedback === "wrong" ? (
                  step.recognize?.nudge
                ) : (
                  <>
                    <MousePointerClick className="h-3.5 w-3.5" /> {step.recognize?.prompt}
                  </>
                )}
              </p>
            ) : step.mode !== "compare" && step.mode !== "decide" ? (
              <p className="mt-2 font-mono text-xs text-slate-200">{liveLine}</p>
            ) : (
              <p className="mt-2 font-mono text-xs text-slate-300">{liveLine}</p>
            )}

            {step.id === "workflow-plan" ? (
              <div className="mt-2 rounded-md border border-cyan-800/40 bg-cyan-950/15 p-2">
                <p className={cn(TERMINAL_TYPO.label, "mb-1 text-cyan-200")}>LIVE DESK WORKFLOW</p>
                {workflow.map((w) => (
                  <div key={w.order} className="flex gap-1.5 border-b border-slate-800 py-1 font-mono text-[10px] text-slate-300 last:border-0">
                    <Check className="mt-px h-3 w-3 shrink-0 text-cyan-400" />
                    <span>
                      <strong>{w.label}</strong> — {w.note}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {step.id === "certified" ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 border border-cyan-700/50 bg-cyan-950/20 px-3 py-2">
                  <Award className="h-5 w-5 text-cyan-400" />
                  <span className="font-mono text-sm font-bold uppercase tracking-wide text-cyan-200">
                    Live Desk Certified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {LIVE_DESK_REQUIRED_CONCEPTS.map((c) => (
                    <div
                      key={c}
                      className={cn(
                        "flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase",
                        recognized.includes(c) || c === "live-desk-certified"
                          ? "border-cyan-700/40 text-cyan-200"
                          : "border-slate-700 text-slate-500",
                      )}
                    >
                      <Check className="h-3 w-3" /> {c.replace(/-/g, " ")}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-center gap-2 border-t border-slate-800 px-3 py-2">
            <button type="button" disabled={index <= 0} onClick={() => setIndex((i) => Math.max(i - 1, 0))} className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}>
              <ArrowLeft className="inline h-3 w-3" />
            </button>
            {!isInteractive ? (
              <button
                type="button"
                onClick={() => {
                  setPlaying(!playing);
                  playingRef.current = !playing;
                  if (playing) {
                    cancelLesson();
                    clearTimers();
                  } else enter(index);
                }}
                className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-cyan-500/60 text-cyan-200" : "text-slate-300")}
              >
                {playing ? <Pause className="inline h-3 w-3" /> : <Play className="inline h-3 w-3" />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                const n = !voiceOn;
                setVoiceOn(n);
                voiceOnRef.current = n;
                setLessonVoiceEnabled(n);
              }}
              className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-300")}
            >
              {voiceOn ? <Volume2 className="inline h-3 w-3" /> : <VolumeX className="inline h-3 w-3" />}
            </button>
            {isInteractive && !interactiveDone ? (
              <button type="button" onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))} className={cn(TERMINAL_TYPO.micro, "border border-slate-800 px-2 py-1 text-slate-500")}>
                SKIP
              </button>
            ) : isLast ? (
              <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "border border-cyan-700/50 px-2 py-1 text-cyan-300")}>
                DONE
              </button>
            ) : (
              <button type="button" onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))} className={cn(TERMINAL_TYPO.micro, "border border-cyan-700/50 px-2 py-1 text-cyan-300")}>
                NEXT <ArrowRight className="inline h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
