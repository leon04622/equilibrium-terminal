"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { UnifiedOpsOrchestrator } from "@/lib/unified-ops/UnifiedOpsOrchestrator";
import { useUnifiedOpsStore, type UnifiedOpsTab } from "@/store/useUnifiedOpsStore";
import type { UnifiedOpsModeId } from "@/types/unified-operations";

const TABS: { id: UnifiedOpsTab; label: string }[] = [
  { id: "orchestration", label: "ORCH" },
  { id: "context", label: "CTX" },
  { id: "propagation", label: "PROP" },
  { id: "modes", label: "MODES" },
  { id: "continuity", label: "MEM" },
  { id: "immersion", label: "KEYS" },
  { id: "design", label: "DS" },
  { id: "crossdevice", label: "SYNC" },
  { id: "ai", label: "AI" },
  { id: "dashboard", label: "VIEW" },
];

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function UnifiedOpsConsole() {
  const storeSnapshot = useUnifiedOpsStore((s) => s.snapshot);
  const activeTab = useUnifiedOpsStore((s) => s.activeTab);
  const setActiveTab = useUnifiedOpsStore((s) => s.setActiveTab);
  const setActiveMode = useUnifiedOpsStore((s) => s.setActiveMode);
  const snapshot = useConsoleSnapshot(storeSnapshot, () => UnifiedOpsOrchestrator.snapshot());

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting unified OS…</p>
      </div>
    );
  }

  const applyDashboardMode = (id: UnifiedOpsModeId) => {
    UnifiedOpsOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const applyWorkspaceMode = (modeId: string) => {
    UnifiedOpsOrchestrator.applyOperationalMode(modeId);
    useUnifiedOpsStore.getState().setSnapshot(UnifiedOpsOrchestrator.snapshot());
  };

  const statusTone = (s: string) =>
    s === "live" || s === "armed" || s === "synced" ? "text-cyan-500/90" : "text-slate-400";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Layers className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>UNIFIED OPS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>U{snapshot.unifiedScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.activeTerminalMode} · {snapshot.telemetry.orchestrationLatencyMs}ms
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
              activeTab === t.id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "orchestration" && (
          <div className="space-y-0">
            {snapshot.workflowCoordination.map((w) => (
              <Row
                key={w.id}
                label={w.label}
                value={`${w.status} · ${w.detail.slice(0, 28)}`}
                tone={statusTone(w.status)}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.unifiedBrief}
            </p>
          </div>
        )}

        {activeTab === "context" &&
          snapshot.globalContext.map((c) => (
            <Row key={c.key} label={c.key} value={c.value} />
          ))}

        {activeTab === "propagation" &&
          snapshot.eventPropagation.map((e) => (
            <Row
              key={e.id}
              label={e.trigger}
              value={e.targets.slice(0, 32)}
              tone={statusTone(e.status)}
            />
          ))}

        {activeTab === "modes" && (
          <div className="space-y-1">
            {snapshot.operationalModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyWorkspaceMode(m.id)}
                className={cn(
                  "w-full rounded border px-1 py-1 text-left",
                  snapshot.activeTerminalMode === m.terminalMode
                    ? "border-cyan-500/40 bg-cyan-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {m.terminalMode} · {m.primaryPanels.join(", ")}
                </p>
              </button>
            ))}
          </div>
        )}

        {activeTab === "continuity" &&
          snapshot.continuity.map((c) => (
            <Row key={c.id} label={c.domain} value={c.state} />
          ))}

        {activeTab === "immersion" &&
          snapshot.immersionCommands.map((c) => (
            <Row key={c.id} label={c.command} value={c.description.slice(0, 36)} />
          ))}

        {activeTab === "design" &&
          snapshot.designSystem.map((d) => (
            <Row key={d.id} label={d.token} value={d.value} />
          ))}

        {activeTab === "crossdevice" &&
          snapshot.crossDevice.map((c) => (
            <Row key={c.id} label={c.channel} value={c.sync} />
          ))}

        {activeTab === "ai" &&
          snapshot.aiEmbedding.map((a) => (
            <Row key={a.id} label={a.workflow} value={a.assist.slice(0, 36)} />
          ))}

        {activeTab === "dashboard" && (
          <div className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyDashboardMode(m.id)}
                className={cn(
                  "w-full rounded border px-1 py-1 text-left",
                  snapshot.activeMode === m.id
                    ? "border-cyan-500/40 bg-cyan-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
