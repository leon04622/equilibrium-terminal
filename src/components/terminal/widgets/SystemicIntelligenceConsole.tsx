"use client";

import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { SystemicIntelligenceOrchestrator } from "@/lib/systemic-intelligence/SystemicIntelligenceOrchestrator";
import {
  useSystemicIntelligenceStore,
  type SystemicIntelTab,
} from "@/store/useSystemicIntelligenceStore";
import type { GraphEntity } from "@/types/market-knowledge-graph";
import type { SystemicDashboardModeId } from "@/types/systemic-intelligence";

const TABS: { id: SystemicIntelTab; label: string }[] = [
  { id: "graph", label: "GRAPH" },
  { id: "risk", label: "RISK" },
  { id: "narrative", label: "NARR" },
  { id: "flows", label: "FLOWS" },
  { id: "cascade", label: "CASCADE" },
  { id: "context", label: "CONTEXT" },
  { id: "memory", label: "MEMORY" },
  { id: "alerts", label: "ALERTS" },
  { id: "modes", label: "MODES" },
];

function sev(s: string): string {
  if (s === "critical") return terminalSkin.textDown;
  if (s === "watch" || s === "elevated") return terminalSkin.textWarn;
  return terminalSkin.textUp;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

function NetworkMini({
  entities,
  links,
  centerId,
}: {
  entities: GraphEntity[];
  links: { from: string; to: string }[];
  centerId: string;
}) {
  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    const cx = 120;
    const cy = 80;
    const core = entities.find((e) => e.id === centerId) ?? entities[0];
    if (core) pos.set(core.id, { x: cx, y: cy });
    const rest = entities.filter((e) => e.id !== core?.id);
    rest.forEach((e, i) => {
      const angle = (i / Math.max(1, rest.length)) * Math.PI * 2;
      const r = 48 + (i % 3) * 10;
      pos.set(e.id, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    });
    return pos;
  }, [entities, centerId]);

  return (
    <svg viewBox="0 0 240 160" className="mb-1 h-40 w-full bg-slate-950">
      {links.map((l, i) => {
        const a = positions.get(l.from);
        const b = positions.get(l.to);
        if (!a || !b) return null;
        return (
          <line key={`${l.from}-${l.to}-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#312e81" strokeWidth={0.6} />
        );
      })}
      {entities.map((e) => {
        const p = positions.get(e.id);
        if (!p) return null;
        const color =
          e.kind === "asset"
            ? "#a78bfa"
            : e.kind === "stablecoin"
              ? "#22d3ee"
              : e.kind === "exchange" || e.kind === "derivatives_venue"
                ? "#fbbf24"
                : e.kind === "narrative"
                  ? "#c084fc"
                  : "#64748b";
        return <circle key={e.id} cx={p.x} cy={p.y} r={e.id === centerId ? 5 : 3.5} fill={color} />;
      })}
    </svg>
  );
}

export function SystemicIntelligenceConsole() {
  const snapshot = useSystemicIntelligenceStore((s) => s.snapshot);
  const activeTab = useSystemicIntelligenceStore((s) => s.activeTab);
  const setActiveTab = useSystemicIntelligenceStore((s) => s.setActiveTab);
  const setActiveMode = useSystemicIntelligenceStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting systemic intelligence…</p>
      </div>
    );
  }

  const applyMode = (id: SystemicDashboardModeId) => {
    SystemicIntelligenceOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const centerId = `asset:${snapshot.asset.toUpperCase()}`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Share2 className="h-3 w-3 text-indigo-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-indigo-300")}>SYSTEMIC INTEL</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · {snapshot.systemicRisk.riskTier.toUpperCase()} · K{snapshot.systemicScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.entityCount}e / {snapshot.telemetry.linkCount}l
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
        {activeTab === "graph" && (
          <section>
            <NetworkMini
              entities={snapshot.subgraph.entities}
              links={snapshot.subgraph.links}
              centerId={centerId}
            />
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{snapshot.aiContextSummary}</p>
            {snapshot.relationships.slice(0, 6).map((r) => (
              <div key={`${r.from}-${r.to}`} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {r.from.split(":")[1] ?? r.from} → {r.to.split(":")[1] ?? r.to}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>{r.relation}</span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "risk" && (
          <section className="space-y-0.5">
            <Row label="Risk tier" value={snapshot.systemicRisk.riskTier.toUpperCase()} tone={sev(snapshot.systemicRisk.riskTier)} />
            <Row label="Contagion" value={String(snapshot.systemicRisk.contagionRisk)} />
            <Row label="Exchange conc" value={`${snapshot.systemicRisk.exchangeConcentration}%`} />
            <Row label="Stablecoin dep" value={`${snapshot.systemicRisk.stablecoinDependency}%`} />
            <Row label="Liq fragmentation" value={String(snapshot.systemicRisk.liquidityFragmentation)} />
            <Row label="Leverage stress" value={String(snapshot.systemicRisk.leverageStress)} />
            <Row label="Vol propagation" value={String(snapshot.systemicRisk.volPropagation)} />
            <Row label="Correlation stress" value={String(snapshot.relationshipMetrics.correlationStress)} />
          </section>
        )}

        {activeTab === "narrative" && (
          <section className="space-y-0.5">
            <Row label="Emergence" value={String(snapshot.narratives.emergenceScore)} />
            <Row label="Acceleration" value={String(snapshot.narratives.accelerationScore)} tone={sev(snapshot.narratives.accelerationScore >= 70 ? "watch" : "info")} />
            <Row label="Sentiment velocity" value={String(snapshot.narratives.sentimentVelocity)} />
            <Row label="Social amp" value={String(snapshot.narratives.socialAmplification)} />
            <Row label="Sectors" value={snapshot.narratives.sectorSpread.join(", ") || "—"} />
            {snapshot.narratives.activeNarratives.slice(0, 6).map((n) => (
              <div key={n.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>{n.label}</span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "flows" && (
          <section>
            {snapshot.liquidityFlows.map((f) => (
              <div key={f.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {f.from} → {f.to}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  {f.flowType} · ${Math.round(f.magnitudeUsd / 1000)}K · {f.velocity}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "cascade" && (
          <section>
            {snapshot.cascades.map((c) => (
              <div key={c.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, sev(c.severity))}>{c.trigger}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{c.propagation}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "context" && (
          <section>
            {snapshot.enrichments.slice(0, 8).map((e) => (
              <div key={e.eventId} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  imp {e.systemicImportance} · {e.relatedAssets.join(", ")}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{e.dependencyContext}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "memory" && (
          <section>
            {snapshot.memory.slice(-10).map((m) => (
              <div key={m.timestamp} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {new Date(m.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  {m.regime} · contagion {m.contagionRisk} · entities {m.entityCount}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "alerts" && (
          <section>
            {snapshot.alerts.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textUp)}>No systemic alerts</p>
            ) : (
              snapshot.alerts.map((a) => (
                <div key={a.id} className="border-b border-slate-800 py-0.5">
                  <span className={cn(TERMINAL_TYPO.micro, sev(a.severity))}>{a.headline}</span>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{a.detail}</p>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "modes" && (
          <section className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "block w-full border border-slate-800 px-1 py-0.5 text-left",
                  snapshot.activeMode === m.id ? "border-indigo-700/60 bg-indigo-950/20" : "hover:bg-slate-900/50",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-indigo-300")}>{m.label}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
