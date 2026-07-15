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
  INTELLIGENCE_DESK_BRIDGE_STEPS,
  type IntelligenceDeskBridgePanel,
  type IntelligenceDeskBridgeRegion,
} from "@/lib/education/intelligenceDeskBridgeSteps";
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
import { useIntelligenceDeskBridgeStore } from "@/store/useIntelligenceDeskBridgeStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const steps = INTELLIGENCE_DESK_BRIDGE_STEPS;

const PANEL_ATTR: Record<IntelligenceDeskBridgePanel, string> = {
  intelligence: "data-intelligencedesk-panel",
  surveillance: "data-surveillance-panel",
  operatormode: "data-operatormode-panel",
};

const REGION_ATTR: Record<IntelligenceDeskBridgePanel, string> = {
  intelligence: "data-intelligencedesk-region",
  surveillance: "data-surveillance-region",
  operatormode: "data-operatormode-region",
};

const PANEL_ID: Record<IntelligenceDeskBridgePanel, string> = {
  intelligence: "intelligence",
  surveillance: "surveillance",
  operatormode: "operatormode",
};

function panelEl(bridgePanel: IntelligenceDeskBridgePanel): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const el = document.querySelector<HTMLElement>(`[${PANEL_ATTR[bridgePanel]}="${PANEL_ID[bridgePanel]}"]`);
  if (el) return el;
  if (bridgePanel === "intelligence") {
    return document.querySelector<HTMLElement>('[data-market-panel="intelligence"]');
  }
  return null;
}

function regionEl(bridgePanel: IntelligenceDeskBridgePanel, region: IntelligenceDeskBridgeRegion): HTMLElement | null {
  const panel = panelEl(bridgePanel);
  if (!panel) return null;
  if (!region || region === "panel") return panel;
  const attr = REGION_ATTR[bridgePanel];
  const scoped =
    document.querySelector<HTMLElement>(`[${attr}="${region}"]`) ??
    panel.querySelector<HTMLElement>(`[${attr}="${region}"]`);
  if (scoped) return scoped;
  if (bridgePanel === "intelligence" && region === "feed") {
    return (
      document.querySelector<HTMLElement>('[data-market-region="feed"]') ??
      panel.querySelector<HTMLElement>('[data-market-region="feed"]')
    );
  }
  return null;
}

export function IntelligenceDeskLiveBridge() {
  const active = useIntelligenceDeskBridgeStore((s) => s.active);
  const runId = useIntelligenceDeskBridgeStore((s) => s.runId);
  const close = useIntelligenceDeskBridgeStore((s) => s.close);
  const markBridgeCompleted = useIntelligenceDeskBridgeStore((s) => s.markBridgeCompleted);
  const markRecognized = useIntelligenceDeskBridgeStore((s) => s.markRecognized);
  const recognized = useIntelligenceDeskBridgeStore((s) => s.recognized);
  const setStoreStep = useIntelligenceDeskBridgeStore((s) => s.setStep);

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
      s ? regionEl(s.bridgePanel, bridgeRecognizeRegion(s) as IntelligenceDeskBridgeRegion) : null,
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
    const region = bridgeRecognizeRegion(step) as IntelligenceDeskBridgeRegion;
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
