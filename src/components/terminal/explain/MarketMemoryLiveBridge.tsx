"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Award, Check, MousePointerClick, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { ConditionComparison, DecisionScenario } from "@/components/terminal/explain/OperatorDecisionPanels";
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";
import {
  MARKET_MEMORY_BRIDGE_PANEL,
  MARKET_MEMORY_BRIDGE_STEPS,
  MARKET_MEMORY_REQUIRED_CONCEPTS,
  type MMBridgeRegion,
} from "@/lib/education/marketMemoryBridgeSteps";
import { MarketMemoryCoach } from "@/lib/education/marketMemoryCoach";
import { humanizeForSpeech, speakAcademyBridgeStep } from "@/lib/education/academyVoice";
import { scrollAcademyBridgeTarget, useAcademyBridgeSpotlight } from "@/lib/education/useAcademyBridgeSpotlight";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  armLessonVoice,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { terminalBus } from "@/store/eventBus";
import { useMarketMemoryBridgeStore } from "@/store/useMarketMemoryBridgeStore";
import { useMarketMemoryStore, type MarketMemoryTab } from "@/store/useMarketMemoryStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = MARKET_MEMORY_BRIDGE_STEPS;

const BRIDGE_TABS = new Set<string>([
  "replay",
  "archive",
  "regime",
  "search",
  "analogs",
  "liquidity",
  "narrative",
  "portfolio",
  "research",
  "modes",
]);

function mmContext() {
  return MarketMemoryCoach.contextLive();
}

function panelEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[data-memorydesk-panel="${MARKET_MEMORY_BRIDGE_PANEL}"]`);
}

function regionEl(region: MMBridgeRegion): HTMLElement | null {
  const panel = panelEl();
  if (!panel) return null;
  if (!region || region === "panel") return panel;
  // Prefer tab content sections — tab nav buttons use data-memorydesk-tab.
  const section = panel.querySelector<HTMLElement>(`section[data-memorydesk-region="${region}"]`);
  if (section) return section;
  const tab = panel.querySelector<HTMLElement>(`button[data-memorydesk-tab="${region}"]`);
  if (tab) return tab;
  return panel;
}

function spotlightRegion(step: (typeof steps)[number] | undefined): MMBridgeRegion {
  if (!step) return null;
  if (step.mode === "recognize" && step.recognize?.accept.length) {
    return step.recognize.accept[0] ?? "panel";
  }
  return step.region ?? null;
}

export function MarketMemoryLiveBridge() {
  const active = useMarketMemoryBridgeStore((s) => s.active);
  const runId = useMarketMemoryBridgeStore((s) => s.runId);
  const close = useMarketMemoryBridgeStore((s) => s.close);
  const markBridgeCompleted = useMarketMemoryBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = useMarketMemoryBridgeStore((s) => s.markRecognized);
  const markDecision = useMarketMemoryBridgeStore((s) => s.markDecision);
  const recognized = useMarketMemoryBridgeStore((s) => s.recognized);
  const setStoreStep = useMarketMemoryBridgeStore((s) => s.setStep);

  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);
  const coachCtxRef = useRef(mmContext());

  const supported = lessonVoiceSupported();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
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

  const rect = useAcademyBridgeSpotlight({
    active,
    index,
    step,
    spotlightRegion,
    regionEl: (region) => regionEl(region as MMBridgeRegion),
    panelEl,
  });

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
      setHighlightPanel(MARKET_MEMORY_BRIDGE_PANEL);
      terminalBus.emit("widget:focus", { widgetId: MARKET_MEMORY_BRIDGE_PANEL });
      if (i >= steps.length - 1) markBridgeCompleted();
      const targetRegion = spotlightRegion(s);
      if (targetRegion && targetRegion !== "panel" && BRIDGE_TABS.has(targetRegion)) {
        useMarketMemoryStore.getState().setActiveTab(targetRegion as MarketMemoryTab);
      }
      const panel = panelEl();
      if (panel) scrollAcademyBridgeTarget(panel, { smooth: false });
      if (targetRegion && targetRegion !== "panel") {
        window.setTimeout(() => {
          scrollAcademyBridgeTarget(regionEl(targetRegion), { smooth: s.mode === "recognize" });
        }, 320);
      }
      const snap = mmContext();
      coachCtxRef.current = snap;
      const coachText = s.coach(snap);
      const extras =
        s.id === "workflow"
          ? MarketMemoryCoach.workflowSteps().map((w) => `${w.order}. ${w.label}: ${w.note}`)
          : [];
      const waits = s.mode === "recognize" || s.mode === "decide" || s.mode === "compare";
      const after = () => {
        if (tokenRef.current !== token || waits) return;
        holdTimer.current = setTimeout(() => {
          if (playingRef.current && i < steps.length - 1) setIndex(i + 1);
        }, 1700);
      };
      const scrollTarget = s.mode === "recognize" ? regionEl(spotlightRegion(s)) : undefined;
      speakAcademyBridgeStep(s, coachText, snap, {
        extraParts: extras,
        scrollTarget,
        scrollSmooth: true,
        voiceOn: voiceOnRef.current,
        supported,
        onEnd: after,
        onError: after,
      });
    },
    [supported, clearTimers, markBridgeCompleted, setHighlightPanel, runId],
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
    setHighlightPanel(MARKET_MEMORY_BRIDGE_PANEL);
    terminalBus.emit("widget:focus", { widgetId: MARKET_MEMORY_BRIDGE_PANEL });
    return () => {
      setHighlightPanel(null);
    };
  }, [active, runId, setHighlightPanel]);

  useEffect(() => {
    if (!active) return;
    skipIndexEffectRef.current = true;
    narratedKeyRef.current = "";
    setIndex(0);
    setPlaying(false);
    playingRef.current = false;
    setStoreStep(0);
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
    if (!playingRef.current) return;
    enterRef.current(index, true);
    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId, index]);

  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      const cur = steps[indexRef.current];
      if (!cur?.recognize) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const panel = target.closest(`[data-memorydesk-panel="${MARKET_MEMORY_BRIDGE_PANEL}"]`);
      const regionNode = (target.closest("[data-memorydesk-region]") ??
        target.closest("[data-memorydesk-tab]")) as HTMLElement | null;
      if (!panel || !regionNode) return;
      const region = (regionNode.getAttribute("data-memorydesk-region") ??
        regionNode.getAttribute("data-memorydesk-tab")) as Exclude<MMBridgeRegion, null> | null;
      if (!region || !cur.recognize.accept.includes(region)) {
        if (region) {
          setFeedback("wrong");
          if (voiceOnRef.current) speakLesson(humanizeForSpeech(cur.recognize.nudge), { rate: 0.9, pitch: 0.97 });
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
  const liveLine = step.coach(coachCtxRef.current);
  const whyCare = step.whyCare?.(coachCtxRef.current);
  const workflow = MarketMemoryCoach.workflowSteps();

  return (
    <>
      {rect ? (
        <div
          className={cn(
            "pointer-events-none fixed z-[200] rounded-md ring-2 transition-all duration-300",
            step.mode === "recognize"
              ? "animate-pulse ring-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.55)]"
              : "ring-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.35)]",
          )}
          style={{ top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 }}
        />
      ) : null}

      <div data-academy-bridge-chrome className="fixed inset-x-0 top-12 z-[160] flex justify-center px-3 pt-2">
        <div className={cn("w-full max-w-xl border bg-slate-950/95 backdrop-blur", isInteractive ? "border-cyan-600/60" : "border-cyan-700/50")}>
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
            <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>MARKET MEMORY BRIDGE · {step.chapter}</span>
            <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              EXIT <X className="inline h-3 w-3" aria-hidden />
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

            {step.id === "workflow" ? (
              <div className="mt-2 rounded-md border border-cyan-800/40 bg-cyan-950/15 p-2">
                <p className={cn(TERMINAL_TYPO.label, "mb-1 text-cyan-200")}>MEMORY WORKFLOW</p>
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
                    Market Memory Archive Certified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {MARKET_MEMORY_REQUIRED_CONCEPTS.map((c) => (
                    <div
                      key={c}
                      className={cn(
                        "flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase",
                        recognized.includes(c) || c === "market-memory-certified"
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
              <ArrowLeft className="inline h-3 w-3" aria-hidden />
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
                {playing ? <Pause className="inline h-3 w-3" aria-hidden /> : <Play className="inline h-3 w-3" aria-hidden />}
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
              {voiceOn ? <Volume2 className="inline h-3 w-3" aria-hidden /> : <VolumeX className="inline h-3 w-3" aria-hidden />}
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
              <button type="button" aria-label="Next step" onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))} className={cn(TERMINAL_TYPO.micro, "border border-cyan-700/50 px-2 py-1 text-cyan-300")}>
                <AcademyNextLabel />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
