"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { OperatorGuideOrchestrator } from "@/lib/operator-guide/OperatorGuideOrchestrator";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { terminalBus } from "@/store/eventBus";
import type { OperatorGuideTab, ScenarioCategory, WorkflowId } from "@/types/operator-guide";

const TABS: { id: OperatorGuideTab; label: string }[] = [
  { id: "glossary", label: "GLOSSARY" },
  { id: "scenarios", label: "SCENARIOS" },
  { id: "workflows", label: "WORKFLOWS" },
  { id: "replay", label: "REPLAY" },
  { id: "modes", label: "MODES" },
];

const CATEGORY_LABEL: Record<ScenarioCategory, string> = {
  liquidation_cascade: "LIQ CASCADE",
  volatility_spike: "VOL SPIKE",
  trend_continuation: "TREND",
  gamma_squeeze: "GAMMA SQ",
  stablecoin_stress: "STABLE STRESS",
  macro_event: "MACRO",
  exchange_failure: "EXCHANGE",
  funding_squeeze: "FUNDING SQ",
  cross_venue_divergence: "CEX DIV",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{value}</span>
    </div>
  );
}

export function ExplainDeskConsole() {
  const [activeTab, setActiveTab] = useState<OperatorGuideTab>("glossary");
  const [search, setSearch] = useState("");

  const storeSnapshot = useOperatorGuideStore((s) => s.snapshot);
  const snap = useConsoleSnapshot(storeSnapshot, () => OperatorGuideOrchestrator.snapshot());
  const explainActive = useOperatorGuideStore((s) => s.explainModeActive);
  const toggleExplain = useOperatorGuideStore((s) => s.toggleExplainMode);
  const startWorkflow = useOperatorGuideStore((s) => s.startWorkflow);
  const activeStep = useOperatorGuideStore((s) => s.activeWorkflowStep);
  const advanceWorkflow = useOperatorGuideStore((s) => s.advanceWorkflow);
  const clearWorkflow = useOperatorGuideStore((s) => s.clearWorkflow);

  if (!snap) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting operator guide…</p>
      </div>
    );
  }

  const filteredRegistry = search.trim()
    ? snap.registry.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.id.includes(search.toLowerCase()),
      )
    : snap.registry;

  const workflow = snap.activeWorkflow;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <GraduationCap className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>OPERATOR GUIDE</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          W{snap.guideScore} · {snap.registry.length} panels
        </span>
        <button
          type="button"
          onClick={() => {
            toggleExplain();
            terminalBus.emit("guide:explain-toggle", { active: !explainActive });
          }}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto px-1",
            explainActive ? "text-cyan-400" : "text-slate-600",
          )}
        >
          EXPLAIN {explainActive ? "ON" : "OFF"}
        </button>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              INSTITUTIONAL_INTERACTION.tabButton,
              activeTab === t.id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "glossary" && (
          <section className="space-y-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search panels…"
              className={cn(
                TERMINAL_TYPO.micro,
                "w-full border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-300",
              )}
            />
            {filteredRegistry.slice(0, 48).map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  OperatorGuideOrchestrator.selectTarget(e.id);
                  terminalBus.emit("widget:focus", { widgetId: e.id });
                }}
                className={cn(
                  "flex w-full justify-between border-b border-slate-800/60 py-0.5 text-left hover:bg-slate-900/80",
                  TERMINAL_TYPO.micro,
                )}
              >
                <span className="text-slate-300">{e.title}</span>
                <span className="text-slate-600">{e.telemetry}</span>
              </button>
            ))}
          </section>
        )}

        {activeTab === "scenarios" && (
          <section className="space-y-1">
            {snap.scenarios.map((s) => (
              <div key={s.id} className="border-b border-slate-800 py-1">
                <div className="flex items-center gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    {CATEGORY_LABEL[s.category]}
                  </span>
                  <span
                    className={cn(
                      TERMINAL_TYPO.micro,
                      s.severity === "critical" ? "text-rose-400" : "text-amber-400",
                    )}
                  >
                    {s.severity.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.label, "text-slate-300")}>{s.title}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{s.headline}</p>
                <button
                  type="button"
                  className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-cyan-400")}
                  onClick={() => OperatorGuideOrchestrator.startScenario(s.id)}
                >
                  SHOW REAL EXAMPLE →
                </button>
              </div>
            ))}
          </section>
        )}

        {activeTab === "workflows" && (
          <section className="space-y-1">
            {workflow ? (
              <div className="mb-2 border border-cyan-900/40 bg-cyan-950/10 p-1">
                <p className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>{workflow.title}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{workflow.objective}</p>
                {workflow.steps[activeStep] ? (
                  <>
                    <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-300")}>
                      Step {activeStep + 1}/{workflow.steps.length}:{" "}
                      {workflow.steps[activeStep].title}
                    </p>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                      {workflow.steps[activeStep].detail}
                    </p>
                    <div className="mt-1 flex gap-2">
                      <button
                        type="button"
                        className={cn(TERMINAL_TYPO.micro, "text-cyan-400")}
                        onClick={() => {
                          const step = workflow.steps[activeStep];
                          OperatorGuideOrchestrator.selectTarget(step.explainTarget);
                          terminalBus.emit("widget:focus", { widgetId: step.focusPanel });
                        }}
                      >
                        FOCUS PANEL
                      </button>
                      {activeStep < workflow.steps.length - 1 ? (
                        <button
                          type="button"
                          className={cn(TERMINAL_TYPO.micro, "text-slate-400")}
                          onClick={advanceWorkflow}
                        >
                          NEXT →
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cn(TERMINAL_TYPO.micro, "text-slate-500")}
                          onClick={clearWorkflow}
                        >
                          DONE
                        </button>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
            {snap.workflows.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => startWorkflow(w.id as WorkflowId)}
                className="block w-full border-b border-slate-800 py-1 text-left hover:bg-slate-900/80"
              >
                <p className={cn(TERMINAL_TYPO.label, "text-slate-300")}>{w.title}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{w.objective}</p>
              </button>
            ))}
          </section>
        )}

        {activeTab === "replay" && (
          <section>
            <Row label="Mode" value={snap.activeReplay?.mode ?? "live"} />
            <Row label="Scenario" value={snap.activeReplay?.title ?? "—"} />
            <Row label="Progress" value={`${snap.activeReplay?.progressPct ?? 0}%`} />
            {snap.activeReplay?.activeAnnotation ? (
              <div className="mt-2 border border-slate-800 p-1">
                <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>
                  {snap.activeReplay.activeAnnotation.headline}
                </p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {snap.activeReplay.activeAnnotation.explanation}
                </p>
              </div>
            ) : (
              <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-slate-600")}>
                Select a scenario under SCENARIOS → SHOW REAL EXAMPLE
              </p>
            )}
          </section>
        )}

        {activeTab === "modes" && (
          <section className="space-y-1">
            {snap.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => OperatorGuideOrchestrator.setActiveMode(m.id)}
                className={cn(
                  "block w-full border-b border-slate-800 py-1 text-left",
                  snap.activeMode === m.id && "bg-cyan-950/20",
                )}
              >
                <p className={cn(TERMINAL_TYPO.label, "text-slate-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
