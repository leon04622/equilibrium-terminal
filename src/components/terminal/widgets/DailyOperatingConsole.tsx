"use client";

import { CheckSquare, Clock, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { OPERATIONAL_ROUTINES, RoutineCatalog, SessionWorkflowEngine } from "@/lib/daily";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { RoutineId, SessionWorkflowPreset } from "@/types/daily-operations";

const TABS = [
  { id: "brief" as const, label: "BRIEF" },
  { id: "state" as const, label: "STATE" },
  { id: "session" as const, label: "SESSION" },
  { id: "ops" as const, label: "MY OPS" },
  { id: "routines" as const, label: "ROUTINES" },
];

const SESSION_PRESETS: { id: SessionWorkflowPreset; label: string }[] = [
  { id: "asia_open", label: "ASIA OPEN" },
  { id: "london_open", label: "LONDON" },
  { id: "ny_open", label: "NY OPEN" },
  { id: "weekend_crypto", label: "WEEKEND" },
  { id: "post_fomc", label: "POST-FOMC" },
  { id: "etf_hours", label: "ETF HRS" },
];

export function DailyOperatingConsole() {
  const snapshot = useDailyOperationsStore((s) => s.snapshot);
  const memory = useDailyOperationsStore((s) => s.memory);
  const activeTab = useDailyOperationsStore((s) => s.activeTab);
  const setActiveTab = useDailyOperationsStore((s) => s.setActiveTab);
  const checklist = useDailyOperationsStore((s) => s.checklist);
  const toggleChecklist = useDailyOperationsStore((s) => s.toggleChecklist);
  const pinHeadline = useDailyOperationsStore((s) => s.pinHeadline);
  const personalPins = useDailyOperationsStore((s) => s.personalPins);
  const prioritizedAlerts = useDailyOperationsStore((s) => s.prioritizedAlerts);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Preparing daily operating context…</p>
      </div>
    );
  }

  const { briefing, clock, marketState, personal } = snapshot;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Sunrise className="h-3 w-3 text-amber-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-200")}>DAILY OPERATIONS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {clock.label} · {clock.liquidityPhase}
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-800 px-1",
              activeTab === t.id ? "text-amber-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "brief" ? (
          <section>
            <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-200")}>{briefing.headline}</p>
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-600")}>
              What matters before today&apos;s session · {briefing.macroEventsToday} macro events · alert
              pressure {briefing.alertPressure.toFixed(0)}
            </p>
            {briefing.bullets.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pinHeadline(b.headline)}
                className={cn(
                  terminalSkin.row,
                  "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
                )}
              >
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    b.severity === "critical"
                      ? terminalSkin.textDown
                      : b.severity === "watch"
                        ? terminalSkin.textWarn
                        : "text-slate-500",
                  )}
                >
                  {b.category.toUpperCase()}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{b.headline}</span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{b.detail}</span>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "state" ? (
          <section className="space-y-1">
            <StateRow label="VOLATILITY" value={marketState.volatilityState} />
            <StateRow label="LIQUIDITY" value={marketState.liquidityState} />
            <StateRow label="FUNDING" value={marketState.fundingEnvironment} />
            <StateRow label="SENTIMENT" value={marketState.sentimentEnvironment} />
            <StateRow label="MACRO RISK" value={marketState.macroRiskLevel} />
            <StateRow label="RISK MODE" value={marketState.riskOnOff} />
            <StateRow label="BREADTH" value={`${marketState.breadthScore}% advancers`} />
            <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>{marketState.compositeLabel}</p>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              Regime {marketState.regime} · calm surveillance — no trade calls
            </p>
          </section>
        ) : null}

        {activeTab === "session" ? (
          <section>
            <div className="mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                Next: {clock.nextTransitionLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {SESSION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => SessionWorkflowEngine.launch(p.id)}
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "border border-slate-800 px-1 text-slate-400 hover:text-cyan-300",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className={cn(TERMINAL_TYPO.micro, "mt-2 block text-slate-500")}>MARKET MEMORY</span>
            {memory.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Session archives build over time.</p>
            ) : (
              memory.slice(0, 6).map((m) => (
                <div key={m.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                    {new Date(m.savedAt).toISOString().slice(0, 16)} · {m.session}
                  </span>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{m.summary}</p>
                </div>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "ops" ? (
          <section>
            <div className="mb-1 grid grid-cols-2 gap-0.5">
              <OpsStat label="WATCHLIST" value={personal.watchlistCount} />
              <OpsStat label="ALERTS" value={personal.activeAlerts} />
              <OpsStat label="JOURNAL" value={personal.journalEntries} />
              <OpsStat label="VIEWS" value={personal.savedViews} />
            </div>
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>PINNED</span>
            {personalPins.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Pin items from the brief tab.</p>
            ) : (
              personalPins.map((h) => (
                <p key={h} className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                  {h}
                </p>
              ))
            )}
            <span className={cn(TERMINAL_TYPO.micro, "mt-2 block text-slate-500")}>CHECKLIST</span>
            {checklist.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleChecklist(c.id)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "flex w-full items-center gap-1 py-0.5 text-left",
                  c.done ? "text-slate-600 line-through" : "text-slate-300",
                )}
              >
                <CheckSquare className="h-3 w-3 shrink-0" />
                {c.label}
              </button>
            ))}
            <span className={cn(TERMINAL_TYPO.micro, "mt-2 block text-slate-500")}>PRIORITY ALERTS</span>
            {prioritizedAlerts.slice(0, 6).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => selectAssetByCoin(a.coin, "daily-ops")}
                className={cn(terminalSkin.row, "mb-0.5 w-full justify-between px-1 py-0.5")}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
                  {a.coin} · {a.title}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  P{a.priorityScore} · {a.reason}
                </span>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "routines" ? (
          <section>
            {OPERATIONAL_ROUTINES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => RoutineCatalog.launch(r.id as RoutineId)}
                className={cn(
                  terminalSkin.row,
                  "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-cyan-400")}>{r.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{r.description}</span>
              </button>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-900 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{value.replace(/_/g, " ").toUpperCase()}</span>
    </div>
  );
}

function OpsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn(terminalSkin.borderB, "px-1 py-0.5")}>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{value}</p>
    </div>
  );
}
