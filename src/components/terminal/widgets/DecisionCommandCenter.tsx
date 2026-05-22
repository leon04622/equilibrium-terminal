"use client";

import { useSyncExternalStore } from "react";
import { Brain, Shield, Target, Zap } from "lucide-react";
import { MODE_LABELS } from "@/lib/decision/DecisionModeWeights";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useDecisionEngineStore } from "@/store/useDecisionEngineStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { DecisionTraderMode, TradeThesis } from "@/types/decision-engine";

function subscribeSnapshot(cb: () => void) {
  return useDecisionEngineStore.subscribe((s) => s.version, () => cb());
}

function getSnapshot() {
  return useDecisionEngineStore.getState().snapshot;
}

function ConvictionMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70 ? "bg-[#00ff88]" : pct >= 45 ? "bg-[#ffaa00]" : "bg-[#ff3366]";
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>SIGNAL DENSITY</span>
        <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-300")}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full border border-slate-800 bg-slate-950">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ReadinessBadge({
  readiness,
  score,
}: {
  readiness: string;
  score: number;
}) {
  const color =
    score >= 60
      ? terminalSkin.textUp
      : score >= 40
        ? terminalSkin.textWarn
        : terminalSkin.textDown;
  return (
    <span className={cn(TERMINAL_TYPO.micro, color)}>
      EXEC {readiness.replace(/_/g, " ").toUpperCase()} · {score}
    </span>
  );
}

function ThesisBlock({ thesis }: { thesis: TradeThesis }) {
  const stanceColor =
    thesis.stance === "bullish"
      ? terminalSkin.textUp
      : thesis.stance === "bearish"
        ? terminalSkin.textDown
        : "text-slate-400";
  return (
    <div className={cn(terminalSkin.row, "flex-col items-stretch gap-0.5 px-1 py-1")}>
      <div className="flex items-center justify-between gap-1">
        <span className={cn(TERMINAL_TYPO.micro, stanceColor)}>
          {thesis.stance.toUpperCase()}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>
          {(thesis.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{thesis.summary}</p>
      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>WATCH: {thesis.invalidation}</p>
    </div>
  );
}

export function DecisionCommandCenter() {
  const snapshot = useSyncExternalStore(subscribeSnapshot, getSnapshot, () => null);
  const coin = useTerminalStore((s) => s.selectedAsset?.symbol ?? s.selectedCoin);
  const traderMode = useDecisionEngineStore((s) => s.traderMode);
  const setTraderMode = useDecisionEngineStore((s) => s.setTraderMode);
  const pipelineActive = useDecisionEngineStore((s) => s.pipelineActive);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          INDEXING MARKET CONTEXT…
        </span>
      </div>
    );
  }

  const primaryThesis = snapshot.theses.find((t) => t.stance === snapshot.fusedStance);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          terminalSkin.borderB,
          "flex shrink-0 flex-wrap items-center gap-2 px-1 py-0.5",
        )}
      >
        <Brain className="h-3 w-3 text-violet-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>MARKET CONTEXT</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{coin}</span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            pipelineActive ? terminalSkin.textUp : "text-slate-600",
          )}
        >
          {pipelineActive ? "LIVE" : "—"}
        </span>
        <select
          value={traderMode}
          onChange={(e) => setTraderMode(e.target.value as DecisionTraderMode)}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto border-0 bg-transparent text-cyan-400 outline-none",
          )}
        >
          {(Object.keys(MODE_LABELS) as DecisionTraderMode[]).map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className={cn(terminalSkin.borderB, "space-y-1 p-1")}>
          <ConvictionMeter value={snapshot.decisionConfidence} />
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                TERMINAL_TYPO.micro,
                snapshot.fusedStance === "bullish"
                  ? terminalSkin.textUp
                  : snapshot.fusedStance === "bearish"
                    ? terminalSkin.textDown
                    : "text-slate-400",
              )}
            >
              FUSED {snapshot.fusedStance.toUpperCase()}
            </span>
            <ReadinessBadge
              readiness={snapshot.executionReadiness.readiness}
              score={snapshot.executionReadiness.score}
            />
          </div>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
            {snapshot.marketState.label} · {snapshot.marketState.regime}
          </p>
        </section>

        <section className={cn(terminalSkin.borderB, "p-1")}>
          <div className="mb-0.5 flex items-center gap-1">
            <Target className="h-3 w-3 text-slate-500" />
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>STRATEGIC BRIEF</span>
          </div>
          <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
            {snapshot.briefing.primaryThesis}
          </p>
          {snapshot.briefing.challengeNote ? (
            <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn, "mt-0.5")}>
              {snapshot.briefing.challengeNote}
            </p>
          ) : null}
          <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-600")}>
            {snapshot.briefing.executionGuidance}
          </p>
        </section>

        <section className={cn(terminalSkin.borderB, "p-1")}>
          <div className="mb-0.5 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>DEVELOPMENTS</span>
          </div>
          {snapshot.actionables.slice(0, 4).map((a) => (
            <div key={a.id} className={cn(terminalSkin.row, "flex-col items-stretch px-1 py-0.5")}>
              <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>{a.headline}</span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{a.directive}</span>
            </div>
          ))}
        </section>

        {snapshot.conflicts.length > 0 ? (
          <section className={cn(terminalSkin.borderB, "p-1")}>
            <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)}>CONFLICTS</span>
            {snapshot.conflicts.map((c) => (
              <p key={c.id} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                {c.description}
              </p>
            ))}
          </section>
        ) : null}

        <section className={cn(terminalSkin.borderB, "p-1")}>
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>THESES</span>
          {primaryThesis ? <ThesisBlock thesis={primaryThesis} /> : null}
          {snapshot.theses
            .filter((t) => t.stance !== snapshot.fusedStance)
            .slice(0, 2)
            .map((t) => (
              <ThesisBlock key={t.id} thesis={t} />
            ))}
        </section>

        <section className="p-1">
          <div className="mb-0.5 flex items-center gap-1">
            <Shield className="h-3 w-3 text-rose-600" />
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>RISK INTEL</span>
          </div>
          {snapshot.risks.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No elevated risks.</p>
          ) : (
            snapshot.risks.slice(0, 3).map((r) => (
              <div key={r.id} className="py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textDown)}>
                  {r.headline}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{r.explanation}</p>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
