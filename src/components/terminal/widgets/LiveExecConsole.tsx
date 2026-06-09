"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { LiveExecOrchestrator } from "@/lib/live-exec-desk/LiveExecOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useLiveExecStore, type LiveExecTab } from "@/store/useLiveExecStore";
import type { LiveExecDeskId, LiveExecModeId } from "@/types/live-execution";

const TABS: { id: LiveExecTab; label: string }[] = [
  { id: "desks", label: "DESKS" },
  { id: "surfaces", label: "SURF" },
  { id: "context", label: "CTX" },
  { id: "multi", label: "MULTI" },
  { id: "response", label: "RESP" },
  { id: "coord", label: "DESK" },
  { id: "perf", label: "PERF" },
  { id: "continuity", label: "MEM" },
  { id: "keys", label: "KEYS" },
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

export function LiveExecConsole() {
  const snapshot = useLiveExecStore((s) => s.snapshot);
  const activeTab = useLiveExecStore((s) => s.activeTab);
  const setActiveTab = useLiveExecStore((s) => s.setActiveTab);
  const setActiveMode = useLiveExecStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting live execution floor…</p>
      </div>
    );
  }

  const applyMode = (id: LiveExecModeId) => {
    LiveExecOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const applyDesk = (deskId: LiveExecDeskId) => {
    LiveExecOrchestrator.applyDesk(deskId);
    useLiveExecStore.getState().setSnapshot(LiveExecOrchestrator.snapshot());
  };

  const focusPanel = (panelId: string) => {
    terminalBus.emit("widget:focus", { widgetId: panelId });
  };

  const sev = (s: string) =>
    s === "critical" ? "text-rose-400/90" : s === "watch" || s === "elevated" ? "text-amber-400/90" : "text-emerald-500/90";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Zap className="h-3 w-3 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>LIVE EXEC</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>F{snapshot.liveExecScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.asset} · pipe {snapshot.telemetry.pipelineActive ? "on" : "off"}
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
              activeTab === t.id ? "text-amber-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "desks" && (
          <div className="space-y-1">
            {snapshot.workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => applyDesk(w.id)}
                className={cn(
                  "w-full rounded border px-1 py-1 text-left",
                  snapshot.activeDesk === w.id
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-amber-300")}>{w.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {w.analyticsMode} · {w.primaryPanels.join(", ")}
                </p>
              </button>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-slate-500")}>{snapshot.liveBrief}</p>
          </div>
        )}

        {activeTab === "surfaces" &&
          snapshot.surfaces.map((s) => (
            <Row
              key={s.id}
              label={s.surface}
              value={`${s.status} · ${s.detail.slice(0, 24)}`}
              tone={s.status === "live" || s.status === "ready" ? "text-emerald-500/90" : undefined}
            />
          ))}

        {activeTab === "context" &&
          snapshot.context.map((c) => (
            <Row key={c.id} label={c.metric} value={c.value} tone={sev(c.tier)} />
          ))}

        {activeTab === "multi" &&
          snapshot.multiAsset.map((m) => (
            <Row key={m.id} label={m.asset} value={m.signal} />
          ))}

        {activeTab === "response" &&
          snapshot.rapidResponse.map((r) => (
            <Row key={r.id} label={r.event} value={r.action.slice(0, 28)} tone={sev(r.severity)} />
          ))}

        {activeTab === "coord" &&
          snapshot.coordination.map((c) => (
            <Row key={c.id} label={c.author} value={c.message.slice(0, 32)} />
          ))}

        {activeTab === "perf" &&
          snapshot.performance.map((p) => (
            <Row key={p.id} label={p.metric} value={p.value} />
          ))}

        {activeTab === "continuity" &&
          snapshot.continuity.map((c) => (
            <Row key={c.id} label={c.domain} value={c.state} />
          ))}

        {activeTab === "keys" && (
          <div className="space-y-0">
            {snapshot.hotkeys.map((h) => (
              <Row key={h.id} label={h.key} value={h.action} />
            ))}
            <button
              type="button"
              onClick={() => focusPanel("ticket")}
              className={cn(TERMINAL_TYPO.micro, "mt-2 text-amber-400 hover:underline")}
            >
              Focus ticket →
            </button>
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
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-amber-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
