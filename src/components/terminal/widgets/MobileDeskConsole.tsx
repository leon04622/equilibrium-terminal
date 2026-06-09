"use client";

import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { MobileDeskOrchestrator } from "@/lib/mobile-desk/MobileDeskOrchestrator";
import { useMobileDeskStore, type MobileDeskTab } from "@/store/useMobileDeskStore";
import type { MobileDeskModeId } from "@/types/mobile-operational";

const TABS: { id: MobileDeskTab; label: string }[] = [
  { id: "arch", label: "ARCH" },
  { id: "alerts", label: "ALERTS" },
  { id: "intel", label: "INTEL" },
  { id: "portfolio", label: "RISK" },
  { id: "exec", label: "EXEC" },
  { id: "watch", label: "WATCH" },
  { id: "sync", label: "SYNC" },
  { id: "incident", label: "INCIDENT" },
  { id: "perf", label: "PERF" },
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

export function MobileDeskConsole() {
  const snapshot = useMobileDeskStore((s) => s.snapshot);
  const activeTab = useMobileDeskStore((s) => s.activeTab);
  const setActiveTab = useMobileDeskStore((s) => s.setActiveTab);
  const setActiveMode = useMobileDeskStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting mobile ops…</p>
      </div>
    );
  }

  const applyMode = (id: MobileDeskModeId) => {
    MobileDeskOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const sevTone = (s: string) =>
    s === "critical" ? "text-rose-400/90" : s === "watch" ? "text-amber-400/90" : undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Smartphone className="h-3 w-3 text-sky-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-sky-300")}>MOBILE OPS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · M{snapshot.awarenessScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.criticalAlerts}c · {snapshot.telemetry.pushDelivered24h} push/24h
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
        {activeTab === "arch" && (
          <div className="space-y-0">
            {snapshot.platforms.map((p) => (
              <Row
                key={p.platform}
                label={`${p.platform} · ${p.stack}`}
                value={`${p.status} · ${p.minOs}`}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.awarenessBrief}
            </p>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-0">
            {snapshot.alerts.map((a) => (
              <Row
                key={a.id}
                label={`${a.kind} · ${a.headline}`}
                value={a.pushed ? "pushed" : a.severity}
                tone={sevTone(a.severity)}
              />
            ))}
          </div>
        )}

        {activeTab === "intel" && (
          <div className="space-y-0">
            {snapshot.intelFeed.map((i) => (
              <Row
                key={i.id}
                label={i.headline.slice(0, 42)}
                value={i.category}
                tone={sevTone(i.severity)}
              />
            ))}
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-0">
            {snapshot.portfolio.map((p) => (
              <Row key={p.label} label={p.label} value={p.value} tone={sevTone(p.status)} />
            ))}
          </div>
        )}

        {activeTab === "exec" && (
          <div className="space-y-0">
            {snapshot.execution.map((e) => (
              <Row
                key={e.label}
                label={e.label}
                value={e.value}
                tone={e.actionable ? "text-cyan-400/90" : undefined}
              />
            ))}
          </div>
        )}

        {activeTab === "watch" && (
          <div className="space-y-0">
            {snapshot.watchlist.map((w) => (
              <Row
                key={w.coin}
                label={w.coin}
                value={`${w.volRegime} · ${w.alertCount} alerts`}
              />
            ))}
          </div>
        )}

        {activeTab === "sync" && (
          <div className="space-y-0">
            {snapshot.sessions.map((s) => (
              <Row
                key={s.deviceId}
                label={s.label}
                value={s.handoffReady ? "handoff ready" : "staged"}
              />
            ))}
          </div>
        )}

        {activeTab === "incident" && (
          <div className="space-y-1">
            {snapshot.incidentMode ? (
              <>
                <p className={cn(TERMINAL_TYPO.micro, "text-rose-300")}>
                  {snapshot.incidentMode.headline}
                </p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {snapshot.incidentMode.operationalSummary}
                </p>
                {snapshot.incidentMode.actions.map((act) => (
                  <Row key={act} label="→" value={act} />
                ))}
              </>
            ) : (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No active incident mode</p>
            )}
          </div>
        )}

        {activeTab === "perf" && (
          <div className="space-y-0">
            <Row label="Battery mode" value={snapshot.performance.batteryMode} />
            <Row label="WS reconnects" value={String(snapshot.performance.wsReconnects)} />
            <Row
              label="Background push"
              value={snapshot.performance.backgroundPushEnabled ? "on" : "off"}
            />
            <Row label="Offline queue" value={String(snapshot.performance.offlineQueueSize)} />
            <Row
              label="Update interval"
              value={`${snapshot.performance.avgUpdateIntervalMs}ms`}
            />
          </div>
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
                    ? "border-sky-500/40 bg-sky-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-sky-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
