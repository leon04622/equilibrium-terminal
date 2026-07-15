"use client";

import { Globe2, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useMarketCoverageStore, type CoverageTab } from "@/store/useMarketCoverageStore";
import { useTerminalStore } from "@/store/terminalStore";

const TABS: { id: CoverageTab; label: string }[] = [
  { id: "coverage", label: "VENUES" },
  { id: "proprietary", label: "EQ METRICS" },
  { id: "onchain", label: "ON-CHAIN" },
  { id: "health", label: "HEALTH" },
  { id: "events", label: "EVENTS" },
];

function statusColor(status: string): string {
  if (status === "live") return terminalSkin.textUp;
  if (status === "staged") return terminalSkin.textWarn;
  if (status === "degraded") return terminalSkin.textWarn;
  return terminalSkin.textDown;
}

function healthColor(state: string): string {
  if (state === "healthy") return terminalSkin.textUp;
  if (state === "elevated") return "text-slate-400";
  if (state === "stressed") return terminalSkin.textWarn;
  return terminalSkin.textDown;
}

export function MarketCoverageConsole() {
  const snapshot = useMarketCoverageStore((s) => s.snapshot);
  const activeTab = useMarketCoverageStore((s) => s.activeTab);
  const setActiveTab = useMarketCoverageStore((s) => s.setActiveTab);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Indexing market coverage…</p>
      </div>
    );
  }

  const { dataQuality, coverageScore } = snapshot;

  return (
    <div
      data-crossmarket-panel="marketcoverage"
      data-crossmarket-region="panel"
      data-panel-id="marketcoverage"
      className="flex h-full flex-col overflow-hidden"
    >
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Globe2 className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>MARKET COVERAGE</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          EQ {coverageScore}/100 · trust {dataQuality.overallTrust}%
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {dataQuality.feedsOnline}/{dataQuality.feedsTotal} live
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-800 px-1",
              activeTab === t.id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "coverage" ? (
          <section data-crossmarket-region="venues">
            {snapshot.venues.map((v) => (
              <div
                key={v.id}
                data-crossmarket-region="venue-row"
                className={cn(terminalSkin.borderB, "flex justify-between gap-1 py-0.5")}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{v.name}</span>
                <span className={cn(TERMINAL_TYPO.micro, statusColor(v.status))}>
                  {v.status.toUpperCase()} · {v.kind}
                </span>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
              Staged venues = infrastructure ready; connect feeds in expansion phase.
            </p>
          </section>
        ) : null}

        {activeTab === "proprietary" ? (
          <section>
            {snapshot.proprietaryMetrics.map((m) => (
              <div key={m.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex justify-between gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>{m.label}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-300")}>
                    {m.value}
                    {m.unit}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "onchain" ? (
          <section>
            {snapshot.onChainSignals.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectAssetByCoin(s.coin, "coverage-onchain")}
                className={cn(
                  terminalSkin.row,
                  "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {s.category.toUpperCase()}
                  {s.sourceVerified ? " · VERIFIED" : " · STAGED"}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{s.headline}</span>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "health" ? (
          <section>
            <div className="mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3 text-slate-500" />
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>MARKET HEALTH</span>
            </div>
            {snapshot.healthIndicators.map((h) => (
              <div key={h.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex justify-between">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{h.label}</span>
                  <span className={cn(TERMINAL_TYPO.micro, healthColor(h.state))}>
                    {h.state.toUpperCase()} · {h.score}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{h.detail}</p>
              </div>
            ))}
            <span className={cn(TERMINAL_TYPO.micro, "mt-2 block text-slate-500")}>
              INSTITUTIONAL WATCH
            </span>
            {snapshot.institutionalWatches.slice(0, 6).map((w) => (
              <p key={w.id} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                {w.entity} — {w.note}
              </p>
            ))}
          </section>
        ) : null}

        {activeTab === "events" ? (
          <section>
            <div className="mb-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>RANKED EVENTS</span>
            </div>
            {snapshot.rankedEvents.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => e.coin && selectAssetByCoin(e.coin, "coverage-event")}
                className={cn(
                  terminalSkin.row,
                  "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  P{e.priority} · {e.source} · {e.verified ? "OK" : "—"}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{e.headline}</span>
              </button>
            ))}
            {dataQuality.staleSources.length > 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-slate-600")}>
                Stale: {dataQuality.staleSources.join(" · ")}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
