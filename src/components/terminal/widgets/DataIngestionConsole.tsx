"use client";

import { Database, Layers, Radio, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useDataIngestionStore, type IngestionTab } from "@/store/useDataIngestionStore";

const TABS: { id: IngestionTab; label: string }[] = [
  { id: "sources", label: "SOURCES" },
  { id: "pipeline", label: "PIPELINE" },
  { id: "events", label: "EVENTS" },
  { id: "processing", label: "PROCESS" },
  { id: "quality", label: "QUALITY" },
  { id: "storage", label: "STORAGE" },
];

function healthColor(h: string): string {
  if (h === "live") return terminalSkin.textUp;
  if (h === "degraded") return terminalSkin.textWarn;
  if (h === "staged") return "text-slate-500";
  return terminalSkin.textDown;
}

export function DataIngestionConsole() {
  const snapshot = useDataIngestionStore((s) => s.snapshot);
  const activeTab = useDataIngestionStore((s) => s.activeTab);
  const setActiveTab = useDataIngestionStore((s) => s.setActiveTab);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting ingest infrastructure…</p>
      </div>
    );
  }

  const { quality, processing, ingestScore } = snapshot;
  const liveSources = snapshot.sources.filter((s) => s.health === "live").length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Database className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>DATA INGEST</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          EQ {ingestScore}/100 · trust {quality.overallTrust}%
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {liveSources}/{snapshot.sources.length} live · {processing.eventsPerSecond} evt/s
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
        {activeTab === "sources" ? (
          <section>
            {snapshot.sources.map((s) => (
              <div key={s.id} className={cn(terminalSkin.borderB, "flex justify-between gap-1 py-0.5")}>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{s.name}</span>
                <span className={cn(TERMINAL_TYPO.micro, healthColor(s.health))}>
                  {s.health.toUpperCase()} · {s.transport}
                </span>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
              Staged sources = adapter-ready; connect credentials in expansion phase.
            </p>
          </section>
        ) : null}

        {activeTab === "pipeline" ? (
          <section>
            {snapshot.pipelines.map((p) => (
              <div key={p.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex justify-between gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>{p.label}</span>
                  <span className={cn(TERMINAL_TYPO.micro, healthColor(p.status))}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  dedupe {p.dedupeSuppressed} · reconnects {p.reconnectCount} · backlog {p.backlog}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "events" ? (
          <section>
            {snapshot.recentEvents.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Awaiting normalized events…</p>
            ) : (
              snapshot.recentEvents.map((e) => (
                <div key={e.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                  <div className="flex gap-1">
                    <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                      {formatTapeTime(e.timestamp).slice(0, 8)}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                      {e.stream}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "w-20 truncate text-slate-500")}>
                      {e.sourceId}
                    </span>
                    <span className={cn(TERMINAL_TYPO.dataSm, "flex-1 truncate text-slate-300")}>
                      {e.eventType}
                      {e.asset ? ` · ${e.asset}` : ""}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>
                      {e.latencyMs}ms
                    </span>
                    {e.verified ? (
                      <ShieldCheck className="h-2.5 w-2.5 shrink-0 text-cyan-600" />
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "processing" ? (
          <section className="space-y-0.5">
            <Row label="Events/sec" value={String(processing.eventsPerSecond)} />
            <Row label="Trades/min" value={String(processing.tradesPerMinute)} />
            <Row label="Book updates/min" value={String(processing.bookUpdatesPerMinute)} />
            <Row label="Volatility score" value={String(processing.volatilityScore)} />
            <Row label="Liquidity score" value={String(processing.liquidityScore)} />
            <Row label="Spread bps" value={processing.spreadBps?.toFixed(1) ?? "—"} />
            <Row label="Funding bias" value={processing.fundingBias} />
            <Row label="Market breadth" value={String(processing.marketBreadth)} />
            {processing.anomalyFlags.length > 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)}>
                Anomalies: {processing.anomalyFlags.join(" · ")}
              </p>
            ) : (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No active anomalies.</p>
            )}
          </section>
        ) : null}

        {activeTab === "quality" ? (
          <section className="space-y-0.5">
            <Row label="Overall trust" value={`${quality.overallTrust}%`} />
            <Row label="Timestamp integrity" value={`${quality.timestampIntegrity}%`} />
            <Row label="Verified sources" value={`${quality.verifiedSourceRatio}%`} />
            <Row label="Redundancy" value={`${quality.redundancyCoverage}%`} />
            <Row label="Stale feeds" value={String(quality.staleFeedCount)} />
            <Row label="Conflicts" value={String(quality.conflictCount)} />
            <Row label="Uptime" value={`${quality.uptimePct}%`} />
            <Row label="Avg latency" value={`${quality.avgLatencyMs}ms`} />
          </section>
        ) : null}

        {activeTab === "storage" ? (
          <section>
            {snapshot.storage.map((s) => (
              <div key={s.tier} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex items-center gap-1">
                  <Layers className="h-2.5 w-2.5 text-slate-600" />
                  <span className={cn(TERMINAL_TYPO.micro, "uppercase text-slate-500")}>{s.tier}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "flex-1 text-slate-300")}>{s.label}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{s.status}</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {s.backend} · {s.itemCount} items · {s.capacityHint}
                </p>
              </div>
            ))}
            <div className={cn(terminalSkin.borderB, "mt-1 py-0.5")}>
              <Radio className="mb-0.5 inline h-2.5 w-2.5 text-cyan-600" />
              <p className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>GET /api/ingestion/events</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                Normalized event feed for institutional API consumers.
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-300")}>{value}</span>
    </div>
  );
}
