"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { useCryptoEcosystemStore, type EcosystemTab } from "@/store/useCryptoEcosystemStore";
import { terminalBus } from "@/store/eventBus";

const TABS: { id: EcosystemTab; label: string }[] = [
  { id: "layers", label: "LAYERS" },
  { id: "portfolio", label: "PORTFOLIO" },
  { id: "risk", label: "RISK" },
  { id: "execution", label: "EXEC" },
  { id: "research", label: "RESEARCH" },
  { id: "automation", label: "AUTO" },
  { id: "compliance", label: "COMPLY" },
  { id: "developer", label: "DEV" },
  { id: "memory", label: "MEMORY" },
];

function sevColor(s: string): string {
  if (s === "critical" || s === "fail") return terminalSkin.textDown;
  if (s === "watch" || s === "degraded") return terminalSkin.textWarn;
  if (s === "pass" || s === "operational") return terminalSkin.textUp;
  return "text-slate-500";
}

function fmtUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function CryptoEcosystemConsole() {
  const snapshot = useCryptoEcosystemStore((s) => s.snapshot);
  const activeTab = useCryptoEcosystemStore((s) => s.activeTab);
  const setActiveTab = useCryptoEcosystemStore((s) => s.setActiveTab);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting crypto operating ecosystem…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Layers className="h-3 w-3 text-indigo-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-indigo-300")}>CRYPTO FINANCIAL OS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          EQ {snapshot.ecosystemScore} · READY {snapshot.operatingReadiness}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          AUM {fmtUsd(snapshot.totalAumUsd)} · PnL {fmtUsd(snapshot.netPnlUsd)}
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
              activeTab === t.id ? "text-indigo-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "layers" &&
          snapshot.layers.map((l) => (
            <div key={l.layer} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "w-28 truncate text-slate-300")}>{l.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(l.health))}>{l.health.toUpperCase()}</span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>{l.activeModules} mod</span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{l.headline}</p>
            </div>
          ))}

        {activeTab === "portfolio" && (
          <>
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 border-b border-slate-800 px-1 text-slate-500")}>
              TREASURY · STABLE MONITOR
            </p>
            {snapshot.treasury.map((t) => (
              <div key={t.asset} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-16 text-slate-400")}>{t.asset}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-300")}>
                    {fmtUsd(t.balanceUsd)}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    util {t.utilizationPct}%
                  </span>
                </div>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 px-1 text-slate-600")}>EXPOSURE</p>
            {snapshot.portfolio.map((p) => (
              <div key={p.asset} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-12 font-bold text-slate-400")}>{p.asset}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-300")}>
                    {fmtUsd(p.notionalUsd)}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(p.riskBand))}>{p.riskBand}</span>
                  <span
                    className={cn(
                      TERMINAL_TYPO.micro,
                      "ml-auto tabular-nums",
                      p.pnlUsd >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
                    )}
                  >
                    {fmtUsd(p.pnlUsd)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "risk" &&
          snapshot.riskAlerts.map((a) => (
            <div key={a.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>{a.domain}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {a.headline}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(a.severity))}>{a.severity}</span>
              </div>
            </div>
          ))}

        {activeTab === "execution" &&
          snapshot.executionAnalytics.map((e) => (
            <div key={`${e.venue}-${e.asset}`} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.micro, "w-6 tabular-nums text-slate-600")}>#{e.rank}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {e.venue}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>
                  {e.avgSlippageBps.toFixed(1)}bps
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{e.fillRatePct}%</span>
              </div>
            </div>
          ))}

        {activeTab === "research" &&
          snapshot.researchSuite.map((r) => (
            <div
              key={r.id}
              className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
            >
              <button
                type="button"
                onClick={() => terminalBus.emit("widget:focus", { widgetId: "research" })}
                className="w-full text-left"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-14 uppercase text-slate-500")}>{r.kind}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {r.title}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{r.status}</span>
                </div>
              </button>
            </div>
          ))}

        {activeTab === "automation" &&
          snapshot.automations.map((a) => (
            <div key={a.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {a.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, a.humanInLoop ? "text-cyan-500" : "text-slate-600")}>
                  {a.humanInLoop ? "HUMAN" : "AUTO"}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, a.active ? terminalSkin.textUp : "text-slate-600")}>
                  {a.active ? "ON" : "OFF"}
                </span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{a.description}</p>
            </div>
          ))}

        {activeTab === "compliance" &&
          snapshot.compliance.map((c) => (
            <div key={c.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>{c.category}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {c.control}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(c.status))}>{c.status.toUpperCase()}</span>
              </div>
            </div>
          ))}

        {activeTab === "developer" &&
          snapshot.developerModules.map((m) => (
            <div key={m.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.micro, "w-10 text-slate-600")}>{m.type}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate font-mono text-slate-300")}>
                  {m.name}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(m.status))}>{m.consumers}</span>
              </div>
            </div>
          ))}

        {activeTab === "memory" &&
          snapshot.marketMemory.map((m) => (
            <div key={m.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>{m.kind}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {m.title}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>{m.relevance}</span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "pl-[4.5rem] text-slate-600")}>
                {formatTapeTime(m.archivedAt).slice(0, 8)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
