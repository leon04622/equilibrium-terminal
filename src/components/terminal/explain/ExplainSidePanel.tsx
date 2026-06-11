"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, GraduationCap, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { ExplainVisualCueCard } from "@/components/terminal/explain/ExplainVisualCue";
import { GuidedLessonPlayer } from "@/components/terminal/explain/GuidedLessonPlayer";
import { LiveOperatorCoach } from "@/components/terminal/explain/LiveOperatorCoach";
import { LiveFundingCoachPanel } from "@/components/terminal/explain/LiveFundingCoach";
import { LiveTradeTypesCoachPanel } from "@/components/terminal/explain/LiveTradeTypesCoach";
import { LiveLiquidationsCoachPanel } from "@/components/terminal/explain/LiveLiquidationsCoach";
import { LiveRiskManagementCoachPanel } from "@/components/terminal/explain/LiveRiskManagementCoach";
import { LiveSlippageCoachPanel } from "@/components/terminal/explain/LiveSlippageCoach";
import { LiveExecutionCoachPanel } from "@/components/terminal/explain/LiveExecutionCoach";
import { LivePortfolioRiskCoachPanel } from "@/components/terminal/explain/LivePortfolioRiskCoach";
import { LiveDailyOperationsCoachPanel } from "@/components/terminal/explain/LiveDailyOperationsCoach";
import { LiveOperatorJournalCoachPanel } from "@/components/terminal/explain/LiveOperatorJournalCoach";
import { LiveDeskCoachPanel } from "@/components/terminal/explain/LiveDeskCoachPanel";
import { PlainEnglishPanel } from "@/components/terminal/explain/PlainEnglishPanel";
import { ReplayLearningEngine } from "@/lib/operator-guide/ReplayLearningEngine";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { OperatorGuideOrchestrator } from "@/lib/operator-guide/OperatorGuideOrchestrator";
import { ComponentRegistryEngine } from "@/lib/operator-guide/ComponentRegistryEngine";
import { OperationalExplainEngine } from "@/lib/operator-guide/OperationalExplainEngine";
import { OperationalPlaybooks } from "@/lib/operator-guide/OperationalPlaybooks";
import { PanelPrimers } from "@/lib/operator-guide/PanelPrimers";
import { TranslationEngine } from "@/lib/education/TranslationEngine";
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import type { ExplainAudience, ProNextAction } from "@/types/operator-guide";
import { terminalBus } from "@/store/eventBus";

const ACTION_LABEL: Record<ProNextAction, string> = {
  wait: "WAIT",
  reduce_size: "REDUCE SIZE",
  avoid_market: "AVOID MARKET",
  use_limit: "USE LIMIT",
  monitor_funding: "MONITOR FUNDING",
  watch_continuation: "WATCH CONTINUATION",
  check_liquidity: "CHECK LIQUIDITY",
  hedge: "HEDGE",
  stand_aside: "STAND ASIDE",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-800/80 py-2">
      <h4 className={cn(TERMINAL_TYPO.micro, "mb-1 text-cyan-600")}>{title}</h4>
      <div className={cn(TERMINAL_TYPO.micro, "text-slate-300 leading-relaxed")}>{children}</div>
    </section>
  );
}

/** One labelled step of the plain-English primer (foundation, shown first). */
function PrimerField({
  step,
  label,
  children,
}: {
  step: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-cyan-900/50 text-[9px] font-semibold text-cyan-300">
          {step}
        </span>
        <h4 className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>{label}</h4>
      </div>
      <div className="pl-[1.4rem] text-[11px] leading-relaxed text-slate-200">{children}</div>
    </div>
  );
}

function focusPanel(panelId: string) {
  terminalBus.emit("widget:focus", { widgetId: panelId });
}

export function ExplainSidePanel() {
  const open = useOperatorGuideStore((s) => s.sidePanelOpen);
  const selectedId = useOperatorGuideStore((s) => s.selectedTargetId);
  const activeReplay = useOperatorGuideStore((s) => s.activeReplay);
  const setSidePanelOpen = useOperatorGuideStore((s) => s.setSidePanelOpen);
  const selectTarget = useOperatorGuideStore((s) => s.selectTarget);
  const selectedAudience = useOperatorGuideStore((s) => s.selectedAudience);
  const setSelectedAudience = useOperatorGuideStore((s) => s.setSelectedAudience);
  const activeLessonPanelId = useOperatorGuideStore((s) => s.activeLessonPanelId);
  const startLesson = useOperatorGuideStore((s) => s.startLesson);
  const focusModeActive = useOperatorGuideStore((s) => s.focusModeActive);
  const toggleFocusMode = useOperatorGuideStore((s) => s.toggleFocusMode);

  // Render the shell instantly; explanation content is memoized so it only
  // recomputes when the selected panel or audience changes (not on every
  // unrelated store update). Keeps single-click open well under 100ms.
  const entry = useMemo(
    () => (selectedId ? ComponentRegistryEngine.resolve(selectedId) : null),
    [selectedId],
  );
  const op = useMemo(
    () => (entry ? OperationalExplainEngine.explain(entry, selectedAudience) : null),
    [entry, selectedAudience],
  );
  const primer = useMemo(() => (entry ? PanelPrimers.for(entry) : null), [entry]);

  const [deeperOpen, setDeeperOpen] = useState(false);

  if (!open) return null;

  const startReplay = () => {
    if (!selectedId) return;
    const scenarioId = op?.replayScenarioId ?? OperationalPlaybooks.replayFor(selectedId);
    OperatorGuideOrchestrator.startScenario(scenarioId);
    const panels = OperationalPlaybooks.get(selectedId).focusPanelsOnReplay;
    for (const p of panels) focusPanel(p);
    focusPanel(selectedId);
  };

  return (
    <aside
      className={cn(
        "fixed right-0 top-[72px] z-[120] flex h-[calc(100vh-72px)] w-[min(440px,92vw)] flex-col",
        terminalSkin.border,
        "border-r-0 bg-slate-950/98 shadow-[-4px_0_24px_rgba(0,0,0,0.45)]",
      )}
    >
      <header
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "shrink-0 justify-between px-2",
        )}
      >
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-cyan-400" />
          <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>DESK PLAYBOOK</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSidePanelOpen(false);
            selectTarget(null);
          }}
          className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-300")}
          aria-label="Close guide panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {activeLessonPanelId ? <GuidedLessonPlayer panelId={activeLessonPanelId} /> : null}

        <div className="mb-2 flex items-center justify-between gap-1 border border-slate-800 p-1">
          <div className="flex flex-wrap gap-1">
            {(["scalp", "swing", "beginner", "advanced"] as ExplainAudience[]).map((aud) => (
              <button
                key={aud}
                type="button"
                onClick={() => setSelectedAudience(aud)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "px-1.5 py-0.5",
                  selectedAudience === aud ? "bg-cyan-950/40 text-cyan-400" : "text-slate-500",
                )}
              >
                {aud.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => toggleFocusMode()}
            title="Dim everything except what you're learning"
            className={cn(
              TERMINAL_TYPO.micro,
              "shrink-0 border px-1.5 py-0.5",
              focusModeActive
                ? "border-cyan-500/60 bg-cyan-950/50 text-cyan-200"
                : "border-slate-700 text-slate-500 hover:text-slate-300",
            )}
          >
            FOCUS {focusModeActive ? "ON" : "OFF"}
          </button>
        </div>

        {activeReplay?.activeAnnotation ? (
          <div className="mb-3 border border-amber-800/60 bg-amber-950/25 p-2">
            <p className={cn(TERMINAL_TYPO.micro, "text-amber-400")}>
              REPLAY · {activeReplay.title} · {activeReplay.progressPct}%
            </p>
            <p className={cn(TERMINAL_TYPO.label, "mt-1 text-slate-100")}>
              {activeReplay.activeAnnotation.headline}
            </p>
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-300")}>
              {activeReplay.activeAnnotation.explanation}
            </p>
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-rose-400")}>
              {activeReplay.activeAnnotation.riskNote}
            </p>
            {(() => {
              // PHASE 2 — plain-English narration: never show replay shorthand raw.
              const tr = TranslationEngine.translate(
                activeReplay.activeAnnotation.headline,
              );
              return (
                <div className="mt-1.5 border-t border-amber-900/40 pt-1.5">
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
                    <span className="mr-1 text-cyan-500">MEANS</span>
                    {tr.meaning}
                  </p>
                  <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-400")}>
                    <span className="mr-1 text-amber-500">WHY</span>
                    {tr.whyMatters}
                  </p>
                  <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-400")}>
                    <span className="mr-1 text-cyan-500">CHECK</span>
                    {tr.checkNext}
                  </p>
                </div>
              );
            })()}
            {activeReplay.activeAnnotation.focusPanel ? (
              <button
                type="button"
                className={cn(TERMINAL_TYPO.micro, "mt-1 text-cyan-400")}
                onClick={() => focusPanel(activeReplay.activeAnnotation!.focusPanel!)}
              >
                HIGHLIGHT {activeReplay.activeAnnotation.focusPanel.toUpperCase()}
              </button>
            ) : null}
            <button
              type="button"
              className={cn(TERMINAL_TYPO.micro, "ml-2 mt-1 text-slate-500")}
              onClick={() => ReplayLearningEngine.stopReplay()}
            >
              RETURN TO LIVE
            </button>
          </div>
        ) : null}

        {entry && op && primer ? (
          <>
            <div className="mb-2 border border-cyan-900/40 bg-cyan-950/15 p-2">
              <p className={cn(TERMINAL_TYPO.label, "text-slate-100")}>{entry.title}</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>{op.panelRole}</p>
            </div>

            {/* PHASE 1 — live, operational coach for the order book (senior
                trader pointing at the screen), shown above the static primer. */}
            <LiveOperatorCoach panelId={entry.id} />
            <LiveFundingCoachPanel panelId={entry.id} />
            <LiveTradeTypesCoachPanel panelId={entry.id} />
            <LiveLiquidationsCoachPanel panelId={entry.id} />
            <LiveRiskManagementCoachPanel panelId={entry.id} />
            <LiveSlippageCoachPanel panelId={entry.id} />
            <LiveExecutionCoachPanel panelId={entry.id} />
            <LivePortfolioRiskCoachPanel panelId={entry.id} />
            <LiveDailyOperationsCoachPanel panelId={entry.id} />
            <LiveOperatorJournalCoachPanel panelId={entry.id} />
            <LiveDeskCoachPanel panelId={entry.id} />

            {/* PLAIN-ENGLISH PRIMER — start from zero before any pro reads. */}
            <div className="mb-2 border border-slate-800 bg-slate-900/30 px-2 py-1">
              <PrimerField step="1" label="WHAT THIS IS">
                {primer.whatItIs}
              </PrimerField>
              <div className="border-t border-slate-800/70" />
              <PrimerField step="2" label="WHAT IT'S FOR">
                {primer.whatItsFor}
              </PrimerField>
              <div className="border-t border-slate-800/70" />
              <PrimerField step="3" label="HOW IT WORKS">
                {primer.howItWorks}
              </PrimerField>
              <div className="border-t border-slate-800/70" />
              <PrimerField step="4" label="HOW TO USE IT">
                <ol className="list-decimal space-y-1 pl-4">
                  {primer.howToUse.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </PrimerField>
            </div>

            <div className="mb-2 grid grid-cols-2 gap-1">
              {op.visualCues.map((cue) => (
                <ExplainVisualCueCard key={cue.label} cue={cue} />
              ))}
            </div>

            {!activeLessonPanelId ? (
              <button
                type="button"
                onClick={() => {
                  armLessonVoice();
                  startLesson(entry.id);
                }}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "mb-2 flex w-full items-center justify-center gap-1 border border-cyan-500/60 bg-cyan-950/40 py-1.5 text-cyan-200 hover:bg-cyan-900/50",
                )}
              >
                <GraduationCap className="h-3 w-3" />
                TEACH ME THIS — GUIDED FOCUS
              </button>
            ) : null}

            <button
              type="button"
              onClick={startReplay}
              className={cn(
                TERMINAL_TYPO.micro,
                "mb-2 flex w-full items-center justify-center gap-1 border border-cyan-700/50 bg-cyan-950/30 py-1.5 text-cyan-300 hover:bg-cyan-950/50",
              )}
            >
              <Play className="h-3 w-3" />
              WATCH THIS HAPPEN — REPLAY
            </button>

            {/* GOING DEEPER — pro-level interpretation, opt-in so beginners
                aren't dropped into the deep end. */}
            <button
              type="button"
              onClick={() => setDeeperOpen((v) => !v)}
              className={cn(
                TERMINAL_TYPO.micro,
                "mb-1 mt-1 flex w-full items-center gap-1 border border-slate-800 bg-slate-900/40 px-2 py-1.5 text-slate-300 hover:border-slate-600",
              )}
            >
              {deeperOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              GOING DEEPER — HOW TO READ IT LIVE
            </button>

            {deeperOpen ? (
              <div className="border-l border-slate-800/60 pl-1">
                <PlainEnglishPanel
                  contextText={[
                    op.liveReading,
                    op.whatChangesMatter,
                    op.dangerZone,
                    op.bullish,
                    op.bearish,
                  ].join(" ")}
                />

                <div className="mb-2 mt-2 border border-emerald-900/40 bg-emerald-950/20 p-2">
                  <p className={cn(TERMINAL_TYPO.micro, "text-emerald-500")}>PRO LIKELY DOES NEXT</p>
                  <p className={cn(TERMINAL_TYPO.label, "text-emerald-200")}>
                    {ACTION_LABEL[op.proDoesNext.action]}
                  </p>
                  <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-300")}>
                    {op.proDoesNext.detail}
                  </p>
                </div>

                <Block title="LOOK HERE FIRST">
                  <ol className="list-decimal space-y-1 pl-4">
                    {op.lookFirst.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </Block>

                <Block title="RIGHT NOW ON YOUR DESK">
                  <p className="text-amber-200/90">{op.liveReading}</p>
                </Block>

                <Block title="WHAT CHANGES MATTER">
                  <p>{op.whatChangesMatter}</p>
                </Block>

                <Block title="BULLISH READ">
                  <p className="text-emerald-400/90">{op.bullish}</p>
                </Block>

                <Block title="BEARISH READ">
                  <p className="text-rose-400/90">{op.bearish}</p>
                </Block>

                <Block title="CONFIRMS THE IDEA">
                  <p>{op.confirms}</p>
                </Block>

                <Block title="INVALIDATES IT">
                  <p>{op.invalidates}</p>
                </Block>

                <Block title="DANGER ZONE">
                  <p className="text-rose-300">{op.dangerZone}</p>
                </Block>

                <Block title="PROS WATCH">
                  <p>{op.proMonitors.join(" · ")}</p>
                </Block>

                <Block title="WORKFLOW (DO IN ORDER)">
                  <ol className="list-decimal space-y-1 pl-4">
                    {op.workflowSteps.map((step, i) => (
                      <li key={step}>
                        <span className="text-slate-500">{i + 1}. </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </Block>

                <Block title="BEGINNER MISTAKES">
                  <ul className="list-disc space-y-1 pl-4 text-rose-300/80">
                    {op.beginnerMistakes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </Block>
              </div>
            ) : null}

            <Block title="CHECK THESE PANELS NEXT">
              <div className="flex flex-wrap gap-1">
                {op.connectedPanels.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => focusPanel(p)}
                    className={cn(
                      TERMINAL_TYPO.micro,
                      "border border-slate-700 px-1 py-0.5 text-cyan-500 hover:border-cyan-800",
                    )}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </Block>
          </>
        ) : (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
            Click ? on any panel to open its desk playbook, or toggle EXPLAIN in the top bar.
          </p>
        )}
      </div>
    </aside>
  );
}
