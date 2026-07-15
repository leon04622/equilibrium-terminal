"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";
import {
  MARKET_MECHANICS_BRIDGE_STEPS,
  type MMBridgePanel,
  type MMBridgeRegion,
} from "@/lib/education/marketMechanicsBridgeSteps";
import { humanizeForSpeech } from "@/lib/education/academyVoice";
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
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { useMarketMechanicsBridgeStore } from "@/store/useMarketMechanicsBridgeStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = MARKET_MECHANICS_BRIDGE_STEPS;

const PANEL_ATTR: Record<MMBridgePanel, string> = {
  hyperbook: "data-book-panel",
  chart: "data-chart-panel",
  intelligence: "data-market-panel",
};

const REGION_ATTR: Record<MMBridgePanel, string> = {
  hyperbook: "data-book-region",
  chart: "data-chart-region",
  intelligence: "data-market-region",
};

const PANEL_ID: Record<MMBridgePanel, string> = {
  hyperbook: "hyperbook",
  chart: "chart",
  intelligence: "intelligence",
};

function panelEl(bridgePanel: MMBridgePanel): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[${PANEL_ATTR[bridgePanel]}="${PANEL_ID[bridgePanel]}"]`);
}

function regionEl(bridgePanel: MMBridgePanel, region: MMBridgeRegion): HTMLElement | null {
  const panel = panelEl(bridgePanel);
  if (!panel) return null;
  if (!region || region === "panel") return panel;
  return panel.querySelector<HTMLElement>(`[${REGION_ATTR[bridgePanel]}="${region}"]`) ?? panel;
}

function estimateMs(text: string): number {
  return Math.max(2400, text.length * 52);
}

export function MarketMechanicsLiveBridge() {
  const active = useMarketMechanicsBridgeStore((s) => s.active);
  const runId = useMarketMechanicsBridgeStore((s) => s.runId);
  const close = useMarketMechanicsBridgeStore((s) => s.close);
  const markBridgeCompleted = useMarketMechanicsBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = useMarketMechanicsBridgeStore((s) => s.markRecognized);
  const setStoreStep = useMarketMechanicsBridgeStore((s) => s.setStep);

  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);
  const book = useHyperliquidStore((s) => s.book);

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
      s ? regionEl(s.bridgePanel, bridgeRecognizeRegion(s) as MMBridgeRegion) : null,
  });

  const clearTimers = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const speakLine = useCallback(
    (text: string, onEnd: () => void) => {
      if (!voiceOnRef.current || !supported) {
        onEnd();
        return;
      }
      speakLesson(humanizeForSpeech(text), { rate: 0.95, pitch: 0.98, onEnd, onError: onEnd });
    },
    [supported],
  );

  const enter = useCallback(
    (i: number) => {
      const token = ++tokenRef.current;
      clearTimers();
      setFeedback("idle");
      setInteractiveDone(false);
      const s = steps[i];
      if (!s) return;
      const widgetId = PANEL_ID[s.bridgePanel];
      setHighlightPanel(widgetId);
      terminalBus.emit("widget:focus", { widgetId });
      if (i >= steps.length - 1) markBridgeCompleted();

      const coachText = s.coach(useHyperliquidStore.getState().book);
      const fullText = [s.title, s.whyCare, coachText].filter(Boolean).join(". ");
      const waits = s.mode === "recognize";
      const after = () => {
        if (tokenRef.current !== token || waits) return;
        holdTimer.current = setTimeout(() => {
          if (playingRef.current && i < steps.length - 1) setIndex(i + 1);
        }, estimateMs(fullText) * 0.35);
      };
      cancelLesson();
      speakLine(fullText, after);
    },
    [clearTimers, markBridgeCompleted, setHighlightPanel, speakLine],
  );

  const advanceAfterInteractive = useCallback(() => {
    setInteractiveDone(true);
    clearTimers();
    holdTimer.current = setTimeout(() => {
      if (playingRef.current && indexRef.current < steps.length - 1) setIndex((i) => i + 1);
    }, 1200);
  }, [clearTimers]);

  useEffect(() => {
    if (!active) return;
    setHighlightPanel("hyperbook");
    terminalBus.emit("widget:focus", { widgetId: "hyperbook" });
    return () => setHighlightPanel(null);
  }, [active, runId, setHighlightPanel]);

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
    return () => clearTimers();
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
      if (!panel) return;
      const regionNode = target.closest(`[${regionAttr}]`) as HTMLElement | null;
      const region =
        regionNode?.getAttribute(regionAttr) ??
        (cur.recognize.accept.includes("feed") ? "feed" : null);
      if (!region || !cur.recognize.accept.includes(region as Exclude<MMBridgeRegion, null>)) {
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
  const isInteractive = step.mode === "recognize";
  const liveLine = step.coach(book);

  return (
    <>
      {rect ? (
        <div
          className={cn(
            "pointer-events-none fixed z-[150] rounded-md ring-2 transition-all duration-300",
            step.mode === "recognize"
              ? "animate-pulse ring-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.55)]"
              : "ring-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.35)]",
          )}
          style={{ top: rect.top - 2, left: rect.left - 2, width: rect.width + 4, height: rect.height + 4 }}
        />
      ) : null}

      <div data-academy-bridge-chrome className="fixed inset-x-0 top-12 z-[160] flex justify-center px-3 pt-2">
        <div
          className={cn(
            "w-full max-w-xl border bg-slate-950/95 backdrop-blur",
            isInteractive ? "border-cyan-600/60" : "border-cyan-700/50",
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
            <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>MARKET MECHANICS BRIDGE · {step.chapter}</span>
            <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              EXIT <X className="inline h-3 w-3" />
            </button>
          </div>

          <div className="px-3 py-2.5">
            <h2 className="font-mono text-sm font-semibold text-slate-100">{step.title}</h2>
            {step.whyCare ? (
              <p className="mt-1 font-mono text-[10px] text-cyan-300/90">
                <span className="text-cyan-500">WHY CARE </span>
                {step.whyCare}
              </p>
            ) : null}

            {step.mode === "recognize" ? (
              <p
                className={cn(
                  "mt-2 flex items-center gap-1.5 font-mono text-xs",
                  feedback === "correct" ? "text-cyan-300" : feedback === "wrong" ? "text-rose-300" : "text-cyan-200",
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
            ) : (
              <p className="mt-2 font-mono text-xs text-slate-200">{liveLine}</p>
            )}
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
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
                className={cn(TERMINAL_TYPO.micro, "border border-slate-800 px-2 py-1 text-slate-500")}
              >
                SKIP
              </button>
            ) : isLast ? (
              <button type="button" onClick={exit} className={cn(TERMINAL_TYPO.micro, "border border-cyan-700/50 px-2 py-1 text-cyan-300")}>
                DONE
              </button>
            ) : (
              <button
                type="button"
                aria-label="Next step"
                onClick={() => setIndex((i) => Math.min(i + 1, steps.length - 1))}
                className={cn(TERMINAL_TYPO.micro, "border border-cyan-700/50 px-2 py-1 text-cyan-300")}
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
