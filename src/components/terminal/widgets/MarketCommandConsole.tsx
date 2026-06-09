"use client";

import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { MarketCommandOrchestrator } from "@/lib/market-command/MarketCommandOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useMarketCommandStore, type MarketCommandTab } from "@/store/useMarketCommandStore";
import type { MarketCommandModeId } from "@/types/market-command";

const TABS: { id: MarketCommandTab; label: string }[] = [
  { id: "overview", label: "OVW" },
  { id: "systemic", label: "SYS" },
  { id: "liquidity", label: "LIQ" },
  { id: "volatility", label: "VOL" },
  { id: "incidents", label: "INC" },
  { id: "cross", label: "XAS" },
  { id: "org", label: "ORG" },
  { id: "visual", label: "VIS" },
  { id: "ai", label: "AI" },
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

export function MarketCommandConsole() {
  const snapshot = useMarketCommandStore((s) => s.snapshot);
  const activeTab = useMarketCommandStore((s) => s.activeTab);
  const setActiveTab = useMarketCommandStore((s) => s.setActiveTab);
  const setActiveMode = useMarketCommandStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting market command center…</p>
      </div>
    );
  }

  const applyMode = (id: MarketCommandModeId) => {
    MarketCommandOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const focusPanel = (panelId: string) => {
    terminalBus.emit("widget:focus", { widgetId: panelId });
  };

  const sev = (s: string) =>
    s === "critical"
      ? "text-rose-400/90"
      : s === "watch" || s === "elevated" || s === "degraded"
        ? "text-amber-400/90"
        : "text-emerald-500/90";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Radar className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>MARKET CMD</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>S{snapshot.situationalScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.asset} · {snapshot.telemetry.systemicTier}
        </span>
      </header>

      <p className={cn(TERMINAL_TYPO.micro, "shrink-0 border-b border-slate-800/80 px-1 py-0.5 text-slate-500")}>
        {snapshot.situationalBrief}
      </p>

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
        {activeTab === "overview" &&
          snapshot.overview.map((o) => (
            <Row key={o.id} label={`${o.domain}/${o.metric}`} value={o.value} tone={sev(o.status)} />
          ))}

        {activeTab === "systemic" &&
          snapshot.systemicRisk.map((r) => (
            <Row key={r.id} label={r.factor} value={`${r.score} · ${r.tier}`} tone={sev(r.tier)} />
          ))}

        {activeTab === "liquidity" &&
          snapshot.liquidityMaps.map((l) => (
            <Row key={l.id} label={l.route} value={`${l.magnitude} · ${l.velocity}`} tone={sev(l.velocity)} />
          ))}

        {activeTab === "volatility" &&
          snapshot.volatility.map((v) => (
            <Row key={v.id} label={v.indicator} value={v.value} tone={sev(v.severity)} />
          ))}

        {activeTab === "incidents" &&
          snapshot.incidents.map((i) => (
            <div key={i.id} className="mb-1 border-b border-slate-800/80 pb-0.5">
              <Row label={i.incident} value={i.severity} tone={sev(i.severity)} />
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{i.playbook}</p>
            </div>
          ))}

        {activeTab === "cross" &&
          snapshot.crossAsset.map((c) => (
            <Row key={c.id} label={c.link.slice(0, 28)} value={c.assets} />
          ))}

        {activeTab === "org" &&
          snapshot.orgCommand.map((o) => (
            <Row key={o.id} label={o.scope} value={`${o.status} · ${o.detail}`} tone={sev(o.status)} />
          ))}

        {activeTab === "visual" &&
          snapshot.visualOrchestration.map((v) => (
            <Row key={v.id} label={v.control} value={v.state} />
          ))}

        {activeTab === "ai" && (
          <p className={cn(TERMINAL_TYPO.micro, "leading-relaxed text-slate-400")}>{snapshot.aiSummary}</p>
        )}

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
                    ? "border-cyan-700/60 bg-cyan-950/30"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {m.panels.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        focusPanel(p);
                      }}
                      className={cn(TERMINAL_TYPO.micro, "rounded bg-slate-900 px-0.5 text-slate-500 hover:text-cyan-400")}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
