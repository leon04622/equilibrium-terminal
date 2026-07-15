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
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";
import { LivePortfolioRiskCoach } from "@/lib/education/livePortfolioRiskCoach";
import {
  PORTFOLIO_RISK_BRIDGE_PANEL,
  PORTFOLIO_RISK_BRIDGE_STEPS,
  PORTFOLIO_RISK_REQUIRED_CONCEPTS,
  type PRBridgePanel,
  type PRBridgeRegion,
} from "@/lib/education/portfolioRiskBridgeSteps";
import { humanizeForSpeech, speakAcademyBridgeStep } from "@/lib/education/academyVoice";
import { bridgeRecognizeRegion, useAcademyBridgeSpotlight } from "@/lib/education/useAcademyBridgeSpotlight";
import {
  cancelLesson,
  getLessonVoiceEnabled,
  lessonVoiceSupported,
  armLessonVoice,
  setLessonVoiceEnabled,
  speakLesson,
} from "@/lib/education/LessonNarrator";
import { terminalBus } from "@/store/eventBus";
import { usePortfolioDeskStore } from "@/store/usePortfolioDeskStore";
import { usePortfolioRiskBridgeStore } from "@/store/usePortfolioRiskBridgeStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = PORTFOLIO_RISK_BRIDGE_STEPS;

function estimateMs(text: string): number {
  return Math.max(2800, text.length * 58);
}

const PANEL_ATTR: Record<PRBridgePanel, string> = {
  portfoliodesk: "data-portfolio-panel",
  positions: "data-positions-panel",
};

const REGION_ATTR: Record<PRBridgePanel, string> = {
  portfoliodesk: "data-portfolio-region",
  positions: "data-positions-region",
};

const PANEL_ID: Record<PRBridgePanel, string> = {
  portfoliodesk: PORTFOLIO_RISK_BRIDGE_PANEL,
  positions: "positions",
};

function panelEl(bridgePanel: PRBridgePanel): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const attr = PANEL_ATTR[bridgePanel];
  const id = PANEL_ID[bridgePanel];
  return document.querySelector<HTMLElement>(`[${attr}="${id}"]`);
}

function regionEl(bridgePanel: PRBridgePanel, region: PRBridgeRegion): HTMLElement | null {
  const panel = panelEl(bridgePanel);
  if (!panel) return null;
  if (!region || region === "panel") return panel;
  const attr = REGION_ATTR[bridgePanel];
  return panel.querySelector<HTMLElement>(`[${attr}="${region}"]`) ?? panel;
}

export function PortfolioRiskLiveBridge() {
  const active = usePortfolioRiskBridgeStore((s) => s.active);
  const runId = usePortfolioRiskBridgeStore((s) => s.runId);
  const close = usePortfolioRiskBridgeStore((s) => s.close);
  const markBridgeCompleted = usePortfolioRiskBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = usePortfolioRiskBridgeStore((s) => s.markRecognized);
  const markDecision = usePortfolioRiskBridgeStore((s) => s.markDecision);
  const recognized = usePortfolioRiskBridgeStore((s) => s.recognized);
  const setStoreStep = usePortfolioRiskBridgeStore((s) => s.setStep);

  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);
  const setPortfolioTab = usePortfolioDeskStore((s) => s.setActiveTab);
  const snapshot = usePortfolioDeskStore((s) => s.snapshot);

  const supported = lessonVoiceSupported();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [interactiveDone, setInteractiveDone] = useState(false);

  const tokenRef = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    getTargetEl: (s) =>
      s ? regionEl(s.bridgePanel, bridgeRecognizeRegion(s) as PRBridgeRegion) : null,
  });

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const enter = useCallback(
    (i: number) => {
      const token = ++tokenRef.current;
      clearTimers();
      setFeedback("idle");
      setInteractiveDone(false);
      const s = steps[i];
      if (!s) return;
      if (s.portfolioTab) setPortfolioTab(s.portfolioTab);
      const widgetId = PANEL_ID[s.bridgePanel];
      setHighlightPanel(widgetId);
      terminalBus.emit("widget:focus", { widgetId });
      if (i >= steps.length - 1) markBridgeCompleted();
      const snap = usePortfolioDeskStore.getState().snapshot;
      const coachText = s.coach(snap);
      const extras =
        s.id === "pre-portfolio"
          ? LivePortfolioRiskCoach.prePortfolioChecklist().map((item) => `${item.label}: ${item.note}`)
          : [];
      const waits = s.mode === "recognize" || s.mode === "decide" || s.mode === "compare";
      const after = () => {
        if (tokenRef.current !== token || waits) return;
        holdTimer.current = setTimeout(() => {
          if (playingRef.current && i < steps.length - 1) setIndex(i + 1);
        }, 1700);
      };
      speakAcademyBridgeStep(s, coachText, snap, {
        extraParts: extras,
        scrollTarget:
          s.mode === "recognize"
            ? regionEl(s.bridgePanel, bridgeRecognizeRegion(s) as PRBridgeRegion)
            : undefined,
        scrollSmooth: true,
        voiceOn: voiceOnRef.current,
        supported,
        onEnd: after,
        onError: after,
      });
    },
    [supported, clearTimers, markBridgeCompleted, setPortfolioTab, setHighlightPanel],
  );

  const advanceAfterInteractive = useCallback(() => {
    setInteractiveDone(true);
    clearTimers();
    holdTimer.current = setTimeout(() => {
      if (playingRef.current && indexRef.current < steps.length - 1) setIndex((i) => i + 1);
    }, 1400);
  }, [clearTimers]);

  useEffect(() => {
    if (!active) return;
    setPortfolioTab("portfolio");
    setHighlightPanel(PORTFOLIO_RISK_BRIDGE_PANEL);
    terminalBus.emit("widget:focus", { widgetId: PORTFOLIO_RISK_BRIDGE_PANEL });
    return () => {
      setHighlightPanel(null);
    };
  }, [active, runId, setHighlightPanel, setPortfolioTab]);

  useEffect(() => {
    if (!active) return;
    setIndex(0);
    setPlaying(false);
    playingRef.current = false;
  }, [active, runId]);

  useEffect(() => {
    if (!active) return;
    setStoreStep(index);
    if (!playingRef.current) return;
    enter(index);
    return () => {
      clearTimers();
    };
  }, [active, runId, index, enter, setStoreStep, clearTimers]);

  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      const cur = steps[indexRef.current];
      if (!cur?.recognize) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const bp = cur.bridgePanel;
      const panelAttr = PANEL_ATTR[bp];
      const regionAttr = REGION_ATTR[bp];
      const panelId = PANEL_ID[bp];
      const panel = target.closest(`[${panelAttr}="${panelId}"]`);
      const regionNode = target.closest(`[${regionAttr}]`) as HTMLElement | null;
      if (!panel || !regionNode) return;
      const region = regionNode.getAttribute(regionAttr) as Exclude<PRBridgeRegion, null> | null;
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
  const liveLine = step.coach(snapshot);
  const whyCare = step.whyCare?.(snapshot);
  const preItems = LivePortfolioRiskCoach.prePortfolioChecklist();

  return (
    <>
      {rect ? (
        <div
          className="pointer-events-none fixed z-[150] rounded-md ring-2 ring-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.35)] transition-all duration-300"
          style={{ top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 }}
        />
      ) : null}

      <div data-academy-bridge-chrome className="fixed inset-x-0 top-12 z-[160] flex justify-center px-3 pt-2">
        <div
          className={cn(
            "w-full max-w-xl border bg-slate-950/95 backdrop-blur",
            isInteractive ? "border-amber-600/60" : "border-amber-700/50",
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
            <span className={cn(TERMINAL_TYPO.label, "text-amber-200")}>PORTFOLIO RISK BRIDGE · {step.chapter}</span>
            <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              EXIT <X className="inline h-3 w-3" />
            </button>
          </div>

          <div className="px-3 py-2.5">
            <h2 className="font-mono text-sm font-semibold text-slate-100">{step.title}</h2>
            {whyCare ? (
              <p className="mt-1 font-mono text-[10px] text-amber-300/90">
                <span className="text-amber-500">WHY CARE </span>
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
              <p
                className={cn(
                  "mt-2 flex items-center gap-1.5 font-mono text-xs",
                  feedback === "correct" ? "text-amber-300" : feedback === "wrong" ? "text-rose-300" : "text-amber-200",
                )}
              >
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

            {step.id === "pre-portfolio" ? (
              <div className="mt-2 rounded-md border border-amber-800/40 bg-amber-950/15 p-2">
                <p className={cn(TERMINAL_TYPO.label, "mb-1 text-amber-200")}>PORTFOLIO HEALTH CHECK</p>
                {preItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-1.5 border-b border-slate-800 py-1 font-mono text-[10px] text-slate-300 last:border-0"
                  >
                    <Check className="mt-px h-3 w-3 shrink-0 text-amber-400" />
                    <span>
                      <strong>{item.label}</strong> — {item.note}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {step.id === "certified" ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 border border-amber-700/50 bg-amber-950/20 px-3 py-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <span className="font-mono text-sm font-bold uppercase tracking-wide text-amber-200">
                    Portfolio Risk Certified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {PORTFOLIO_RISK_REQUIRED_CONCEPTS.map((c) => (
                    <div
                      key={c}
                      className={cn(
                        "flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase",
                        recognized.includes(c) || c === "portfolio-risk-certified"
                          ? "border-amber-700/40 text-amber-200"
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
            <button
              type="button"
              disabled={index <= 0}
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}
            >
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
                className={cn(TERMINAL_TYPO.micro, "border px-2 py-1", playing ? "border-amber-500/60 text-amber-200" : "text-slate-300")}
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
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
                className={cn(TERMINAL_TYPO.micro, "border border-slate-800 px-2 py-1 text-slate-500")}
              >
                SKIP
              </button>
            ) : isLast ? (
              <button
                type="button"
                onClick={exit}
                className={cn(TERMINAL_TYPO.micro, "border border-amber-700/50 px-2 py-1 text-amber-300")}
              >
                DONE
              </button>
            ) : (
              <button
                type="button"
                aria-label="Next step"
                onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
                className={cn(TERMINAL_TYPO.micro, "border border-amber-700/50 px-2 py-1 text-amber-300")}
              >
                <AcademyNextLabel />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
