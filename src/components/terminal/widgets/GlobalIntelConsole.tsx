"use client";

import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { useGlobalIntelStore, type GlobalIntelTab } from "@/store/useGlobalIntelStore";
import type { GlobalIntelModeId } from "@/types/global-intelligence";

const TABS: { id: GlobalIntelTab; label: string }[] = [
  { id: "wire", label: "WIRE" },
  { id: "events", label: "EVENTS" },
  { id: "macro", label: "MACRO" },
  { id: "etf", label: "ETF" },
  { id: "regulation", label: "REG" },
  { id: "cross", label: "X-ASSET" },
  { id: "propagation", label: "PROP" },
  { id: "alerts", label: "ALERTS" },
  { id: "calendar", label: "CAL" },
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

export function GlobalIntelConsole() {
  const snapshot = useGlobalIntelStore((s) => s.snapshot);
  const activeTab = useGlobalIntelStore((s) => s.activeTab);
  const setActiveTab = useGlobalIntelStore((s) => s.setActiveTab);
  const setActiveMode = useGlobalIntelStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting global intelligence…</p>
      </div>
    );
  }

  const applyMode = (id: GlobalIntelModeId) => {
    GlobalIntelOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const statusTone = (s: string) =>
    s === "critical" ? "text-rose-400/90" : s === "watch" ? "text-amber-400/90" : "text-slate-400";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Globe className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>GLOBAL INTEL</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>G{snapshot.globalScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.asset} · {snapshot.telemetry.wireItems} wire · {snapshot.telemetry.computeLatencyMs}ms
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
              activeTab === t.id ? "text-violet-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "wire" && (
          <div className="space-y-0">
            {snapshot.newsFeed.map((n) => (
              <Row
                key={n.id}
                label={n.headline.slice(0, 32)}
                value={`${n.source} · ${n.score}`}
                tone={statusTone(n.severity)}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.globalBrief}
            </p>
          </div>
        )}

        {activeTab === "events" &&
          snapshot.macroEvents.map((e) => (
            <Row
              key={e.id}
              label={`${e.category} · ${e.severity}`}
              value={e.summary.slice(0, 36)}
            />
          ))}

        {activeTab === "macro" &&
          snapshot.macroIndicators.map((m) => (
            <Row
              key={m.symbol}
              label={m.label}
              value={`${m.last} · ${m.changePct >= 0 ? "+" : ""}${m.changePct.toFixed(2)}%`}
              tone={m.changePct >= 0 ? "text-emerald-500/90" : "text-rose-400/90"}
            />
          ))}

        {activeTab === "etf" &&
          snapshot.etfFlows.map((e) => (
            <Row key={e.id} label={e.entity} value={e.note.slice(0, 40)} />
          ))}

        {activeTab === "regulation" &&
          snapshot.regulatory.map((r) => (
            <Row
              key={r.id}
              label={r.jurisdiction}
              value={`${r.topic} · ${r.severity}`}
              tone={statusTone(r.severity)}
            />
          ))}

        {activeTab === "cross" &&
          snapshot.crossAsset.map((c) => (
            <Row key={c.id} label={c.headline.slice(0, 28)} value={c.assets.join(", ")} />
          ))}

        {activeTab === "propagation" &&
          snapshot.propagation.map((p) => (
            <Row
              key={p.id}
              label={p.trigger.slice(0, 24)}
              value={p.propagation.slice(0, 36)}
              tone={statusTone(p.severity)}
            />
          ))}

        {activeTab === "alerts" &&
          snapshot.alerts.map((a) => (
            <Row
              key={a.id}
              label={a.headline.slice(0, 32)}
              value={`${a.kind} · ${a.severity}`}
              tone={statusTone(a.severity)}
            />
          ))}

        {activeTab === "calendar" &&
          snapshot.macroCalendar.map((c) => (
            <Row
              key={c.id}
              label={c.title.slice(0, 28)}
              value={`${c.region} · ${c.impact}`}
            />
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
                    ? "border-violet-500/40 bg-violet-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-violet-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
