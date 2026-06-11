"use client";

import { useState } from "react";
import { ClipboardList, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useOperatorJournalStore } from "@/store/useOperatorJournalStore";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  BehavioralFlagKind,
  DecisionEntry,
  DecisionKind,
  EmotionalState,
} from "@/types/operator-journal";

const TABS = [
  { id: "session" as const, label: "SESSION" },
  { id: "log" as const, label: "LOG" },
  { id: "exec" as const, label: "EXEC" },
  { id: "behavior" as const, label: "BEHAVIOR" },
  { id: "review" as const, label: "REVIEW" },
  { id: "patterns" as const, label: "PATTERNS" },
];

const KINDS: DecisionKind[] = ["entry", "exit", "adjust", "skip", "observation"];
const EMOTIONS: EmotionalState[] = ["calm", "confident", "anxious", "frustrated", "fomo", "fatigued"];

const GRADE_COLOR: Record<string, string> = {
  A: "text-emerald-400",
  B: "text-emerald-300",
  C: "text-amber-400",
  D: "text-orange-400",
  F: "text-rose-400",
};

function ReplayButton({
  onClick,
  label = "REPLAY THIS MOMENT",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        TERMINAL_TYPO.micro,
        "mt-0.5 flex items-center gap-1 text-cyan-500 hover:text-cyan-300",
      )}
    >
      <PlayCircle className="h-3 w-3" />
      {label}
    </button>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 55 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="py-0.5">
      <div className="flex justify-between">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{label}</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-300 tabular-nums")}>{value}</span>
      </div>
      <div className="mt-0.5 h-1 w-full bg-slate-800">
        <div className={cn("h-1", color)} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function OperatorJournalConsole() {
  const tab = useOperatorJournalStore((s) => s.activeTab);
  const setTab = useOperatorJournalStore((s) => s.setActiveTab);
  const snapshot = useOperatorJournalStore((s) => s.snapshot);
  const logDecision = useOperatorJournalStore((s) => s.logDecision);
  const endSession = useOperatorJournalStore((s) => s.endSession);
  const openReplay = useOperatorJournalStore((s) => s.openReplay);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);

  const [kind, setKind] = useState<DecisionKind>("entry");
  const [thesis, setThesis] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [emotion, setEmotion] = useState<EmotionalState>("calm");
  const [riskNote, setRiskNote] = useState("");

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting operator journal…</p>
      </div>
    );
  }

  const { session, decisions, executionQuality, behavioralFlags, review, patterns, scorecard } = snapshot;

  const latestDecision: DecisionEntry | null = decisions[0] ?? null;
  const latestExecDecision: DecisionEntry | null =
    decisions.find((d) => d.kind === "entry" || d.kind === "exit" || d.kind === "adjust") ?? null;

  const replayFlag = (kind: BehavioralFlagKind) => {
    const target =
      decisions.find(
        (d) =>
          (kind === "revenge_trading" || kind === "volatility_chasing") && d.kind === "entry",
      ) ?? latestDecision;
    if (target) openReplay(target, kind);
  };

  const submit = () => {
    logDecision({
      coin: selectedCoin ?? "BTC",
      kind,
      thesis: thesis.trim(),
      confidence,
      emotion,
      riskNote: riskNote.trim(),
    });
    setThesis("");
    setRiskNote("");
    setConfidence(3);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" data-journal-panel="operatorjournal">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")} data-journal-region="panel">
        <ClipboardList className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>OPERATOR JOURNAL</span>
        <span className={cn(TERMINAL_TYPO.micro, GRADE_COLOR[scorecard.grade])}>
          {scorecard.grade} · {scorecard.composite}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {Math.round(session.durationMs / 60_000)}m · {session.decisionsCount} dec
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "px-1.5 py-0.5",
              tab === t.id ? "bg-cyan-950/40 text-cyan-300" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {t.label}
            {t.id === "behavior" && behavioralFlags.length > 0 ? (
              <span className="ml-0.5 text-rose-400">{behavioralFlags.length}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {tab === "session" ? (
          <div className="space-y-2" data-journal-region="session">
            <div className="grid grid-cols-2 gap-1" data-journal-region="scorecard">
              <Bar label="EXECUTION" value={scorecard.execution} />
              <Bar label="DISCIPLINE" value={scorecard.discipline} />
              <Bar label="DECISION Q" value={scorecard.decisionQuality} />
              <Bar label="CONSISTENCY" value={scorecard.consistency} />
            </div>
            <div className="border border-slate-800 p-1.5">
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>LIVE SESSION</p>
              <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-300")}>
                Duration {Math.round(session.durationMs / 60_000)} min · {session.decisionsCount} decisions
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                Regimes: {session.regimesParticipated.join(", ") || "—"}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                Vol exposure: {session.volatilityExposure.join(", ") || "—"}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                Liquidity: {session.liquidityConditions.join(", ") || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={endSession}
              className={cn(
                TERMINAL_TYPO.micro,
                "w-full border border-slate-700 py-1 text-slate-400 hover:border-rose-800 hover:text-rose-300",
              )}
            >
              END SESSION & ARCHIVE
            </button>
          </div>
        ) : null}

        {tab === "log" ? (
          <div className="space-y-1.5" data-journal-region="log">
            <div className="border border-slate-800 p-1.5" data-journal-region="decision-form">
              <div className="flex flex-wrap gap-0.5">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={cn(
                      TERMINAL_TYPO.micro,
                      "px-1 py-0.5",
                      kind === k ? "bg-cyan-950/40 text-cyan-300" : "text-slate-500",
                    )}
                  >
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>
              <textarea
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                placeholder="Thesis / reasoning…"
                rows={2}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "mt-1 w-full resize-none border border-slate-800 bg-slate-950 p-1 text-slate-200 outline-none focus:border-cyan-800",
                )}
              />
              <input
                value={riskNote}
                onChange={(e) => setRiskNote(e.target.value)}
                placeholder="Risk note (stop, size, invalidation)…"
                className={cn(
                  TERMINAL_TYPO.micro,
                  "mt-1 w-full border border-slate-800 bg-slate-950 p-1 text-slate-200 outline-none focus:border-cyan-800",
                )}
              />
              <div className="mt-1 flex items-center gap-1">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>CONF</span>
                {[1, 2, 3, 4, 5].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConfidence(c)}
                    className={cn(
                      TERMINAL_TYPO.micro,
                      "h-4 w-4",
                      confidence >= c ? "bg-cyan-700 text-slate-950" : "bg-slate-800 text-slate-500",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-1 flex flex-wrap gap-0.5">
                {EMOTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmotion(e)}
                    className={cn(
                      TERMINAL_TYPO.micro,
                      "px-1 py-0.5",
                      emotion === e ? "bg-violet-950/50 text-violet-300" : "text-slate-500",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={submit}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "mt-1.5 w-full border border-cyan-700/60 bg-cyan-950/40 py-1 text-cyan-200 hover:bg-cyan-900/50",
                )}
              >
                LOG DECISION · {(selectedCoin ?? "BTC").toUpperCase()}
              </button>
            </div>

            {decisions.slice(0, 12).map((d) => (
              <div key={d.id} className="border-b border-slate-800/70 py-1">
                <div className="flex items-center justify-between">
                  <span className={cn(TERMINAL_TYPO.micro, "text-cyan-400")}>
                    {d.kind.toUpperCase()} · {d.coin}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    C{d.confidence} · {d.emotion}
                  </span>
                </div>
                {d.thesis ? (
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{d.thesis}</p>
                ) : null}
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {d.context.regime} · {d.context.volatilityState} · {d.context.liquidityState}
                </p>
                {d.reflection ? (
                  <p className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>↳ {d.reflection}</p>
                ) : null}
                <ReplayButton onClick={() => openReplay(d)} />
              </div>
            ))}
          </div>
        ) : null}

        {tab === "exec" ? (
          <div className="space-y-2" data-journal-region="exec">
            <Bar label="EXECUTION QUALITY" value={executionQuality.score} />
            <div className="grid grid-cols-3 gap-1">
              <div className="border border-slate-800 p-1 text-center">
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>CHASE</p>
                <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>
                  {Math.round(executionQuality.chaseRate * 100)}%
                </p>
              </div>
              <div className="border border-slate-800 p-1 text-center">
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>OVERTRADE</p>
                <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>
                  {Math.round(executionQuality.overtradingPressure * 100)}%
                </p>
              </div>
              <div className="border border-slate-800 p-1 text-center">
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>LOW-LIQ</p>
                <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>
                  {Math.round(executionQuality.lowLiquidityExec * 100)}%
                </p>
              </div>
            </div>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              Slippage bias: <span className="text-slate-300">{executionQuality.slippageBias}</span>
            </p>
            <ul className="space-y-1">
              {executionQuality.notes.map((n) => (
                <li key={n} className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                  · {n}
                </li>
              ))}
            </ul>
            {latestExecDecision ? (
              <ReplayButton
                onClick={() => openReplay(latestExecDecision)}
                label="REPLAY LAST EXECUTION"
              />
            ) : null}
          </div>
        ) : null}

        {tab === "behavior" ? (
          <div className="space-y-1" data-journal-region="behavior">
            {behavioralFlags.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-emerald-400")}>
                No behavioral warnings — disciplined operation.
              </p>
            ) : (
              behavioralFlags.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    "border-l-2 bg-slate-900/40 p-1.5",
                    f.severity === "critical"
                      ? "border-rose-500"
                      : f.severity === "watch"
                        ? "border-amber-500"
                        : "border-slate-600",
                  )}
                >
                  <p
                    className={cn(
                      TERMINAL_TYPO.micro,
                      f.severity === "critical" ? "text-rose-400" : "text-amber-400",
                    )}
                  >
                    {f.kind.replace(/_/g, " ").toUpperCase()}
                  </p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{f.message}</p>
                  {latestDecision ? <ReplayButton onClick={() => replayFlag(f.kind)} /> : null}
                </div>
              ))
            )}
          </div>
        ) : null}

        {tab === "review" ? (
          review ? (
            <div className="space-y-2" data-journal-region="review">
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="border border-slate-800 p-1">
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>QUALITY</p>
                  <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>{review.qualityScore}</p>
                </div>
                <div className="border border-slate-800 p-1">
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>EXEC</p>
                  <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>{review.executionScore}</p>
                </div>
                <div className="border border-slate-800 p-1">
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>DISCIPLINE</p>
                  <p className={cn(TERMINAL_TYPO.label, "text-slate-200")}>{review.disciplineScore}</p>
                </div>
              </div>
              <div>
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>VOLATILITY ADAPTATION</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{review.volatilityAdaptation}</p>
              </div>
              <div>
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>MISSED OPPORTUNITIES</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{review.missedOpportunities}</p>
              </div>
              {review.bestDecision ? (
                <div>
                  <p className={cn(TERMINAL_TYPO.micro, "text-emerald-500")}>BEST DECISION</p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
                    {review.bestDecision.kind.toUpperCase()} {review.bestDecision.coin} ·{" "}
                    {review.bestDecision.thesis || "(no thesis)"}
                  </p>
                  <ReplayButton onClick={() => openReplay(review.bestDecision!)} />
                </div>
              ) : null}
              {review.worstDecision ? (
                <div>
                  <p className={cn(TERMINAL_TYPO.micro, "text-rose-500")}>WEAKEST DECISION</p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
                    {review.worstDecision.kind.toUpperCase()} {review.worstDecision.coin} ·{" "}
                    {review.worstDecision.thesis || "(no thesis)"}
                  </p>
                  <ReplayButton onClick={() => openReplay(review.worstDecision!)} />
                </div>
              ) : null}
              {review.dangerousBehaviors.length > 0 ? (
                <div>
                  <p className={cn(TERMINAL_TYPO.micro, "text-rose-500")}>DANGEROUS BEHAVIORS</p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
                    {review.dangerousBehaviors.join(" · ")}
                  </p>
                </div>
              ) : null}
              <div>
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>DESK DEBRIEF</p>
                <ul className="space-y-0.5">
                  {review.observations.map((o) => (
                    <li key={o} className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                      · {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              Log decisions during the session to generate a debrief.
            </p>
          )
        ) : null}

        {tab === "patterns" ? (
          <div className="space-y-1" data-journal-region="patterns">
            {patterns.map((p) => (
              <div key={p.id} className="border border-slate-800 p-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      TERMINAL_TYPO.micro,
                      p.polarity === "strength"
                        ? "text-emerald-400"
                        : p.polarity === "weakness"
                          ? "text-rose-400"
                          : "text-slate-400",
                    )}
                  >
                    {p.label}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{p.confidence}%</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{p.detail}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
