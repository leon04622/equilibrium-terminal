"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { OperatorAiOrchestrator } from "@/lib/operator-ai-desk/OperatorAiOrchestrator";
import { OperatorAiResponseEngine } from "@/lib/operator-ai-desk/OperatorAiResponseEngine";
import { useOperatorAiStore, type OperatorAiTab } from "@/store/useOperatorAiStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { OperatorAiModeId } from "@/types/operator-ai";

const TABS: { id: OperatorAiTab; label: string }[] = [
  { id: "context", label: "CONTEXT" },
  { id: "summarize", label: "SUMMARY" },
  { id: "workflow", label: "FLOW" },
  { id: "research", label: "RES" },
  { id: "systems", label: "SYS" },
  { id: "briefing", label: "BRIEF" },
  { id: "query", label: "QUERY" },
  { id: "safety", label: "TRUST" },
  { id: "infer", label: "INFRA" },
  { id: "modes", label: "MODES" },
];

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function OperatorAiConsole() {
  const snapshot = useOperatorAiStore((s) => s.snapshot);
  const activeTab = useOperatorAiStore((s) => s.activeTab);
  const setActiveTab = useOperatorAiStore((s) => s.setActiveTab);
  const setActiveMode = useOperatorAiStore((s) => s.setActiveMode);
  const setLastQuery = useOperatorAiStore((s) => s.setLastQuery);
  const submitAiPrompt = useTerminalStore((s) => s.submitAiPrompt);
  const [queryInput, setQueryInput] = useState("");

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting operator AI…</p>
      </div>
    );
  }

  const applyMode = (id: OperatorAiModeId) => {
    OperatorAiOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const runQuery = () => {
    const q = queryInput.trim();
    if (!q) return;
    setLastQuery(q);
    submitAiPrompt(q, "operatordesk");
    setQueryInput("");
  };

  const statusTone = (s: string) =>
    s === "critical" ? "text-rose-400/90" : s === "watch" ? "text-amber-400/90" : "text-slate-400";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Bot className="h-3 w-3 text-neon-green" />
        <span className={cn(TERMINAL_TYPO.label, "text-neon-green")}>OPERATOR AI</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>O{snapshot.assistantScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.asset} · RAG {snapshot.telemetry.inferenceLatencyMs}ms
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              INSTITUTIONAL_INTERACTION.tabButton,
              activeTab === t.id ? "text-neon-green" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "context" && (
          <div className="space-y-0">
            {snapshot.contextualInsights.map((c) => (
              <Row
                key={c.id}
                label={c.domain}
                value={c.summary.slice(0, 40)}
                tone={c.confidence >= 70 ? "text-neon-green/90" : undefined}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.operatorBrief}
            </p>
          </div>
        )}

        {activeTab === "summarize" &&
          snapshot.intelSummaries.map((s) => (
            <Row
              key={s.id}
              label={s.category}
              value={s.headline}
              tone={statusTone(s.severity)}
            />
          ))}

        {activeTab === "workflow" &&
          snapshot.workflowSuggestions.map((w) => (
            <Row key={w.id} label={w.command} value={w.description.slice(0, 36)} />
          ))}

        {activeTab === "research" &&
          snapshot.researchAssist.map((r) => (
            <Row key={r.id} label={r.label} value={r.detail.slice(0, 40)} />
          ))}

        {activeTab === "systems" &&
          snapshot.systemContext.map((s) => (
            <Row
              key={s.system}
              label={s.system}
              value={`${s.status}${s.score != null ? ` · ${s.score}` : ""}`}
            />
          ))}

        {activeTab === "briefing" &&
          snapshot.briefings.map((b) => (
            <Row key={b.id} label={b.category} value={b.headline} tone={statusTone(b.severity)} />
          ))}

        {activeTab === "query" && (
          <div className="space-y-1">
            <div className="flex gap-1">
              <input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runQuery()}
                placeholder="Query events, regimes, exposure…"
                className="min-w-0 flex-1 rounded border border-slate-800 bg-black/40 px-1 py-0.5 font-mono text-[10px] text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={runQuery}
                className={cn(TERMINAL_TYPO.micro, "rounded border border-neon-green/30 px-1 text-neon-green")}
              >
                ASK
              </button>
            </div>
            {snapshot.retrievalHits.map((h) => (
              <Row key={h.id} label={h.source} value={h.snippet.slice(0, 36)} />
            ))}
            {queryInput.trim() ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                Preview: {OperatorAiResponseEngine.answer(queryInput).slice(0, 120)}…
              </p>
            ) : null}
          </div>
        )}

        {activeTab === "safety" &&
          snapshot.safetyBoundaries.map((s) => (
            <Row
              key={s.id}
              label={s.rule.slice(0, 28)}
              value={s.enforced ? "enforced" : "—"}
              tone={s.enforced ? "text-neon-green/90" : undefined}
            />
          ))}

        {activeTab === "infer" &&
          snapshot.inferenceInfra.map((i) => (
            <Row key={i.id} label={i.component} value={`${i.latencyMs}ms · ${i.status}`} />
          ))}

        {activeTab === "modes" && (
          <div className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "w-full rounded border px-1 py-1 text-left",
                  snapshot.activeMode === m.id
                    ? "border-neon-green/40 bg-neon-green/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-neon-green")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
