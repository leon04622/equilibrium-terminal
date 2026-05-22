"use client";

import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import {
  useProprietaryIntelligenceStore,
  type ProprietaryIntelTab,
} from "@/store/useProprietaryIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { terminalBus } from "@/store/eventBus";

const TABS: { id: ProprietaryIntelTab; label: string }[] = [
  { id: "metrics", label: "METRICS" },
  { id: "structure", label: "STRUCTURE" },
  { id: "benchmarks", label: "BENCH" },
  { id: "network", label: "NETWORK" },
  { id: "embedding", label: "EMBED" },
  { id: "signature", label: "SIGNATURE" },
  { id: "memory", label: "MEMORY" },
  { id: "distribution", label: "DIST" },
];

function bandColor(band: string): string {
  if (band === "critical") return terminalSkin.textDown;
  if (band === "elevated") return terminalSkin.textWarn;
  return "text-slate-500";
}

function trendGlyph(trend: string): string {
  if (trend === "improving") return "▲";
  if (trend === "deteriorating") return "▼";
  return "—";
}

export function ProprietaryIntelligenceConsole() {
  const snapshot = useProprietaryIntelligenceStore((s) => s.snapshot);
  const activeTab = useProprietaryIntelligenceStore((s) => s.activeTab);
  const setActiveTab = useProprietaryIntelligenceStore((s) => s.setActiveTab);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Computing proprietary intelligence…
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Gem className="h-3 w-3 text-sky-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-sky-300")}>PROPRIETARY INTEL</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          MOAT {snapshot.moatScore} · DIFF {snapshot.differentiationScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {snapshot.metrics.length} EQ metrics
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
              activeTab === t.id ? "text-sky-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "metrics" ? (
          <section>
            {snapshot.metrics.map((m) => (
              <div
                key={m.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 text-slate-600")}>{m.unit}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {m.label}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums font-bold text-slate-200")}>
                    {m.value}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, bandColor(m.band))}>{m.band.toUpperCase()}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{trendGlyph(m.trend)}</span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "structure" ? (
          <section>
            {snapshot.marketStructure.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.affectedAssets[0]) selectAssetByCoin(s.affectedAssets[0], "propintel");
                  terminalBus.emit("widget:focus", { widgetId: "intelengine" });
                }}
                className={cn(
                  terminalSkin.row,
                  "mb-0 w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>{s.domain}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {s.headline}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>{s.score}</span>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "benchmarks" ? (
          <section>
            {snapshot.benchmarks.map((b) => (
              <div key={b.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-8 tabular-nums text-slate-600")}>#{b.rank}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>
                    {b.category.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {b.entity}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>{b.score}</span>
                  <span
                    className={cn(
                      TERMINAL_TYPO.micro,
                      b.delta7d >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
                    )}
                  >
                    {b.delta7d >= 0 ? "+" : ""}
                    {b.delta7d}
                  </span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "network" ? (
          <section>
            {snapshot.networkSignals.map((n) => (
              <div key={n.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>{n.source}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {n.headline}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>
                    {n.privacyPreserved ? "PRIV" : "—"}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "pl-[5.5rem] text-slate-600")}>
                  {n.deskCount} desks · conf {(n.confidence * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "embedding" ? (
          <section>
            {snapshot.workflowEmbedding.map((w) => (
              <div key={w.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {w.label}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>{w.score}</span>
                  <span className={cn(TERMINAL_TYPO.micro, bandColor(w.dependencyBand))}>
                    {w.dependencyBand.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{w.description}</p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "signature" ? (
          <section>
            {snapshot.signatureFeatures.map((f) => (
              <div key={f.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {f.name}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{f.primaryMetric}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>{f.value}</span>
                  <span
                    className={cn(
                      TERMINAL_TYPO.micro,
                      f.status === "active" ? terminalSkin.textUp : terminalSkin.textWarn,
                    )}
                  >
                    {f.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "memory" ? (
          <section>
            {snapshot.operationalMemory.map((m) => (
              <div key={m.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>{m.kind}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {m.title}
                  </span>
                  {m.analogDate ? (
                    <span className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>ANALOG {m.analogDate}</span>
                  ) : null}
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[4.5rem] text-slate-600")}>{m.summary}</p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "distribution" ? (
          <section>
            {snapshot.distribution.map((d) => (
              <div key={d.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-14 uppercase text-slate-500")}>{d.kind}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {d.title}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>
                    {formatTapeTime(d.publishedAt).slice(0, 8)}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[4.5rem] text-slate-600")}>
                  {d.summary} · {d.channels.join(", ")}
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
