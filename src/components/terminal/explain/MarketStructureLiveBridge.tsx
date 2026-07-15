"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  MousePointerClick,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { AcademyNextLabel } from "@/components/terminal/explain/AcademyLessonControls";
import {
  MARKET_STRUCTURE_BRIDGE_STEPS,
  type MktStructBridgePanel,
  type MktStructBridgeRegion,
} from "@/lib/education/marketStructureBridgeSteps";
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
import { useMarketStructureBridgeStore } from "@/store/useMarketStructureBridgeStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = MARKET_STRUCTURE_BRIDGE_STEPS;

const PANEL_ATTR: Record<MktStructBridgePanel, string> = {
  chart: "data-chart-panel",
  surveillance: "data-surveillance-panel",
  domladder: "data-domladder-panel",
};

const REGION_ATTR: Record<MktStructBridgePanel, string> = {
  chart: "data-chart-region",
  surveillance: "data-surveillance-region",
  domladder: "data-domladder-region",
};

const PANEL_ID: Record<MktStructBridgePanel, string> = {
  chart: "chart",
  surveillance: "surveillance",
  domladder: "domladder",
};

function panelEl(bridgePanel: MktStructBridgePanel): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(`[${PANEL_ATTR[bridgePanel]}="${PANEL_ID[bridgePanel]}"]`);
}

function regionEl(bridgePanel: MktStructBridgePanel, region: MktStructBridgeRegion): HTMLElement | null {
  const panel = panelEl(bridgePanel);
  if (!panel) return null;
  if (!region || region === "panel") return panel;
  const attr = REGION_ATTR[bridgePanel];
  return document.querySelector<HTMLElement>(`[${attr}="${region}"]`) ?? panel.querySelector<HTMLElement>(`[${attr}="${region}"]`);
}

export function MarketStructureLiveBridge() {
  const active = useMarketStructureBridgeStore((s) => s.active);
  const runId = useMarketStructureBridgeStore((s) => s.runId);
  const close = useMarketStructureBridgeStore((s) => s.close);
  const markBridgeCompleted = useMarketStructureBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = useMarketStructureBridgeStore((s) => s.markRecognized);
  const recognized = useMarketStructureBridgeStore((s) => s.recognized);
  const setStoreStep = useMarketStructureBridgeStore((s) => s.setStep);

  const setHighlightPanel = useOperatorGuideStore((s) => s.setHighlightPanel);

  const supported = lessonVoiceSupported();
  const [index, setIndex] = useState(0);
  const [voiceOn, setVoiceOn] = useState(() => getLessonVoiceEnabled());
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  const step = steps[Math.min(index, steps.length - 1)];

  useAcademyBridgeSpotlight({
    active,
    index,
    step,
    getTargetEl: (s) =>
      s ? regionEl(s.bridgePanel, bridgeRecognizeRegion(s) as MktStructBridgeRegion) : null,
  });

  useEffect(() => {
    if (!active) return;
    armLessonVoice();
    return () => cancelLesson();
  }, [active, runId]);

  useEffect(() => {
    if (!active || !step) return;
    const widgetId = PANEL_ID[step.bridgePanel];
    setHighlightPanel(widgetId);
    terminalBus.emit("widget:focus", { widgetId });
    setStoreStep(index);
    if (index >= steps.length - 1) markBridgeCompleted();
  }, [active, index, step, setHighlightPanel, setStoreStep, markBridgeCompleted]);

  const onRecognizeClick = useCallback(() => {
    if (!step?.recognize || !step.conceptId) return;
    const region = bridgeRecognizeRegion(step) as MktStructBridgeRegion;
    const el = regionEl(step.bridgePanel, region);
    if (!el) {
      setFeedback("wrong");
      return;
    }
    markRecognized(step.conceptId);
    setFeedback("correct");
  }, [step, markRecognized]);

  if (!active || !step) return null;

  const coachText = step.coach;
  const isLast = index >= steps.length - 1;
  const waits = step.mode === "recognize";

  return (
    <div className="fixed inset-0 z-[195] pointer-events-none">
      <div className="pointer-events-auto fixed bottom-0 left-0 right-0 border-t border-violet-900/50 bg-slate-950/95 px-3 py-2 shadow-2xl">
        <div className="mx-auto flex max-w-4xl flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={cn(TERMINAL_TYPO.micro, "text-violet-500")}>{step.chapter}</span>
              <h3 className={cn(TERMINAL_TYPO.label, "text-violet-100")}>{step.title}</h3>
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{coachText}</p>
            </div>
            <button type="button" onClick={close} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}
            >
              <ArrowLeft className="inline h-3 w-3" />
            </button>
            {waits ? (
              <button
                type="button"
                onClick={onRecognizeClick}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "flex items-center gap-1 border px-2 py-1",
                  feedback === "correct"
                    ? "border-emerald-600/50 text-emerald-300"
                    : "border-violet-700/50 text-violet-300",
                )}
              >
                <MousePointerClick className="h-3 w-3" />
                {step.recognize?.prompt ?? "CONFIRM"}
              </button>
            ) : null}
            {!isLast ? (
              <button
                type="button"
                onClick={() => setIndex(index + 1)}
                className={cn(TERMINAL_TYPO.micro, "border border-violet-700/50 px-2 py-1 text-violet-300")}
              >
                <AcademyNextLabel />
              </button>
            ) : (
              <span className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-emerald-400")}>
                <Award className="h-3 w-3" /> CERTIFIED
              </span>
            )}
            {recognized.includes(step.conceptId ?? "") ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : null}
            {supported ? (
              <button
                type="button"
                onClick={() => {
                  const next = !voiceOn;
                  setVoiceOn(next);
                  setLessonVoiceEnabled(next);
                  if (next) void speakLesson(humanizeForSpeech(coachText));
                  else cancelLesson();
                }}
                className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}
              >
                {voiceOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
