"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import type { AcademyWorkflow, AcademyWorkflowStep } from "@/lib/education/academyWorkflowPaths";
import { useAcademyBridgeSpotlight, scrollAcademyBridgeTarget } from "@/lib/education/useAcademyBridgeSpotlight";
import { useLessonLaunchers } from "@/lib/education/lessonLaunchers";
import { terminalBus } from "@/store/eventBus";
import { useAcademyWorkflowStore } from "@/store/useAcademyWorkflowStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

function isHeaderPanel(panelId: string): boolean {
  return panelId === "header-strip";
}

function panelEl(panelId: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (isHeaderPanel(panelId)) {
    return (
      document.getElementById("live-desk-bridge-target") ??
      document.querySelector<HTMLElement>('[data-livedesk-panel="header-strip"]') ??
      document.querySelector<HTMLElement>('[data-panel-id="header-strip"]')
    );
  }
  return document.querySelector<HTMLElement>(`[data-panel-id="${panelId}"]`);
}

function focusStep(step: AcademyWorkflowStep): void {
  const widgetId = step.panelId;
  useOperatorGuideStore.getState().setHighlightPanel(widgetId);
  if (isHeaderPanel(widgetId)) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  terminalBus.emit("widget:focus", { widgetId });
  const el = panelEl(widgetId);
  scrollAcademyBridgeTarget(el, { smooth: true });
}

export function AcademyWorkflowGuide() {
  const active = useAcademyWorkflowStore((s) => s.active);
  const workflow = useAcademyWorkflowStore((s) => s.workflow);
  const stepIndex = useAcademyWorkflowStore((s) => s.stepIndex);
  const close = useAcademyWorkflowStore((s) => s.close);
  const setStep = useAcademyWorkflowStore((s) => s.setStep);
  const markStep = useAcademyWorkflowStore((s) => s.markStep);
  const markCompleted = useAcademyWorkflowStore((s) => s.markCompleted);
  const { launch } = useLessonLaunchers();

  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const step = workflow?.steps[stepIndex];
  const isLast = workflow ? stepIndex >= workflow.steps.length - 1 : false;

  const measure = useCallback(() => {
    if (!step) return;
    const el = panelEl(step.panelId);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const minW = 280;
    const minH = 120;
    const w = Math.max(r.width, minW);
    const h = Math.max(r.height, minH);
    const left = r.left + r.width / 2 - w / 2;
    const top = r.top + r.height / 2 - h / 2;
    setRect({ top, left, width: w, height: h });
  }, [step]);

  useEffect(() => {
    if (!active || !step) return;
    focusStep(step);
    markStep(stepIndex);
    const t1 = window.setTimeout(measure, 200);
    const t2 = window.setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
      useOperatorGuideStore.getState().setHighlightPanel(null);
    };
  }, [active, step, stepIndex, measure, markStep]);

  useAcademyBridgeSpotlight({
    active: false,
    index: 0,
    step: undefined,
  });

  if (!active || !workflow || !step) return null;

  const advance = () => {
    if (isLast) {
      markCompleted();
      close();
      return;
    }
    setStep(stepIndex + 1);
  };

  const launchLesson = () => {
    if (!step.lessonId) return;
    close();
    launch(step.lessonId, step.bridgeMode ?? "bridge");
  };

  return (
    <>
      {rect ? (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-[155] bg-slate-950/55"
            aria-hidden
          />
          <div
            className="pointer-events-none fixed z-[156] rounded-lg ring-2 ring-violet-300 shadow-[0_0_48px_rgba(167,139,250,0.45)] transition-all duration-300"
            style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
          />
          <div
            className="pointer-events-none fixed z-[157] border border-violet-400/80 bg-violet-950/90 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-violet-100"
            style={{ top: Math.max(8, rect.top - 28), left: rect.left }}
          >
            <MapPin className="mr-1 inline h-3 w-3" />
            {step.label}
          </div>
        </>
      ) : null}

      <div className="fixed inset-x-0 bottom-4 z-[160] flex justify-center px-3">
        <div className="w-full max-w-lg border border-violet-700/50 bg-slate-950/98 shadow-2xl backdrop-blur">
          <header className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
            <div>
              <p className={cn(TERMINAL_TYPO.label, "text-violet-200")}>{workflow.title}</p>
              <p className="font-mono text-[9px] text-slate-500">
                Step {stepIndex + 1} of {workflow.steps.length} · {step.phase}
              </p>
            </div>
            <button type="button" onClick={close} className="text-slate-500 hover:text-slate-300" aria-label="Close workflow">
              <X className="h-4 w-4" />
            </button>
          </header>
          <div className="px-3 py-2.5">
            <h2 className="font-mono text-sm font-semibold text-slate-100">{step.label}</h2>
            <p className="mt-1 font-mono text-[10px] leading-snug text-slate-400">{step.detail}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {workflow.steps.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "rounded-sm border px-1.5 py-0.5 font-mono text-[8px] uppercase",
                    i < stepIndex
                      ? "border-emerald-800/40 text-emerald-400"
                      : i === stepIndex
                        ? "border-violet-600/50 text-violet-200"
                        : "border-slate-800 text-slate-600",
                  )}
                >
                  {i < stepIndex ? <Check className="inline h-2.5 w-2.5" /> : null} {s.label}
                </span>
              ))}
            </div>
          </div>
          <footer className="flex gap-1 border-t border-slate-800 p-2">
            {step.lessonId ? (
              <button
                type="button"
                onClick={launchLesson}
                className={cn(TERMINAL_TYPO.micro, "flex-1 border border-cyan-800/50 bg-cyan-950/30 px-2 py-1.5 text-cyan-200")}
              >
                Open full bridge
              </button>
            ) : null}
            <button
              type="button"
              onClick={advance}
              className={cn(TERMINAL_TYPO.micro, "flex flex-1 items-center justify-center gap-1 border border-violet-700/50 bg-violet-950/40 px-2 py-1.5 text-violet-100")}
            >
              {isLast ? "Complete workflow" : "Next step"}
              {!isLast ? <ArrowRight className="h-3 w-3" aria-hidden /> : null}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
