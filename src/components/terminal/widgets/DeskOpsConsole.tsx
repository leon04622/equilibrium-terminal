"use client";

import { Users } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { DeskOpsOrchestrator } from "@/lib/desk-ops/DeskOpsOrchestrator";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { useDeskOpsStore, type DeskOpsTab } from "@/store/useDeskOpsStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { DeskOpsModeId } from "@/types/desk-operations";

const TABS: { id: DeskOpsTab; label: string }[] = [
  { id: "workspaces", label: "ORGS" },
  { id: "roles", label: "RBAC" },
  { id: "intel", label: "INTEL" },
  { id: "research", label: "RES" },
  { id: "alerts", label: "ALERTS" },
  { id: "coordination", label: "OPS" },
  { id: "governance", label: "AUDIT" },
  { id: "tenants", label: "TENANT" },
  { id: "memory", label: "MEM" },
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

export function DeskOpsConsole() {
  const storeSnapshot = useDeskOpsStore((s) => s.snapshot);
  const activeTab = useDeskOpsStore((s) => s.activeTab);
  const setActiveTab = useDeskOpsStore((s) => s.setActiveTab);
  const setActiveMode = useDeskOpsStore((s) => s.setActiveMode);
  const entitled = useProductionConfigStore((s) => s.isEntitled("teamNetEnabled"));

  const snapshot = useConsoleSnapshot(storeSnapshot, () => DeskOpsOrchestrator.snapshot());

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting desk operations…</p>
      </div>
    );
  }

  const applyMode = (id: DeskOpsModeId) => {
    DeskOpsOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const statusTone = (s: string) =>
    s === "active" || s === "complete" || s === "clear" || s === "operational"
      ? "text-cyan-500/90"
      : s === "critical" || s === "escalated"
        ? "text-rose-400/90"
        : "text-amber-400/90";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Users className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>DESK OPS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>D{snapshot.orgScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.asset} · {snapshot.telemetry.activeMembers} active · {snapshot.telemetry.computeLatencyMs}ms
        </span>
      </header>

      {!entitled ? (
        <p className={cn(terminalSkin.borderB, TERMINAL_TYPO.micro, "shrink-0 bg-cyan-950/30 px-2 py-1 text-cyan-400/90")}>
          Preview mode — local desk ops demo. Team tier unlocks live coordination sync.
        </p>
      ) : null}

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
        {activeTab === "workspaces" && (
          <div className="space-y-0">
            {snapshot.workspaces.map((w) => (
              <Row
                key={w.id}
                label={w.name}
                value={`${w.deskType} · ${w.members}m · v${w.layoutVersion}`}
                tone={statusTone(w.status)}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.orgBrief}
            </p>
          </div>
        )}

        {activeTab === "roles" &&
          snapshot.roles.map((r) => (
            <Row
              key={r.label}
              label={r.label}
              value={`trade ${r.canTrade ? "Y" : "—"} · res ${r.canResearch ? "Y" : "—"} · audit ${r.canAudit ? "Y" : "—"}`}
            />
          ))}

        {activeTab === "intel" &&
          snapshot.sharedIntel.map((i) => (
            <Row
              key={i.id}
              label={i.headline.slice(0, 28)}
              value={`${i.author} · ${i.severity}`}
              tone={statusTone(i.severity)}
            />
          ))}

        {activeTab === "research" &&
          snapshot.collabResearch.map((r) => (
            <Row key={r.id} label={r.title.slice(0, 32)} value={`${r.kind} · ${r.visibility}`} />
          ))}

        {activeTab === "alerts" &&
          snapshot.orgAlerts.map((a) => (
            <Row
              key={a.id}
              label={a.condition.slice(0, 28)}
              value={`${a.scope} · ${a.subscribers} subs`}
              tone={statusTone(a.severity)}
            />
          ))}

        {activeTab === "coordination" &&
          snapshot.coordination.map((c) => (
            <Row key={c.id} label={c.label} value={`${c.status} · ${c.owner}`} tone={statusTone(c.status)} />
          ))}

        {activeTab === "governance" &&
          snapshot.governance.map((g) => (
            <Row
              key={g.id}
              label={g.action}
              value={`${g.actor} · ${g.allowed ? "ok" : "deny"}`}
              tone={g.allowed ? "text-cyan-500/90" : "text-rose-400/90"}
            />
          ))}

        {activeTab === "tenants" &&
          snapshot.tenants.map((t) => (
            <Row
              key={t.tenantId}
              label={t.orgName}
              value={`${t.isolation} · ${t.dataBoundary}`}
            />
          ))}

        {activeTab === "memory" &&
          snapshot.collabMemory.map((m) => (
            <Row key={m.id} label={m.title.slice(0, 32)} value={`${m.kind} · ${m.author}`} />
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
