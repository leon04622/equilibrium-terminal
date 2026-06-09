"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { FeatureFlagReleaseEngine } from "@/lib/ops-command/FeatureFlagReleaseEngine";
import { OpsCommandOrchestrator } from "@/lib/ops-command/OpsCommandOrchestrator";
import { useOpsCommandStore, type OpsCommandTab } from "@/store/useOpsCommandStore";
import type { OpsCommandModeId } from "@/types/ops-command";

const TABS: { id: OpsCommandTab; label: string }[] = [
  { id: "admin", label: "ADMIN" },
  { id: "observe", label: "OBSERVE" },
  { id: "incidents", label: "INCIDENT" },
  { id: "flags", label: "FLAGS" },
  { id: "orgs", label: "ORGS" },
  { id: "runtime", label: "RUNTIME" },
  { id: "support", label: "SUPPORT" },
  { id: "audit", label: "AUDIT" },
  { id: "billing", label: "BILLING" },
  { id: "intel", label: "INTEL" },
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

export function OpsCommandConsole() {
  const snapshot = useOpsCommandStore((s) => s.snapshot);
  const activeTab = useOpsCommandStore((s) => s.activeTab);
  const setActiveTab = useOpsCommandStore((s) => s.setActiveTab);
  const setActiveMode = useOpsCommandStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting ops command…</p>
      </div>
    );
  }

  const applyMode = (id: OpsCommandModeId) => {
    OpsCommandOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const statusTone = (s: string) =>
    s === "operational" ? "text-emerald-500/90" : s === "offline" ? "text-rose-400/90" : "text-amber-400/90";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Shield className="h-3 w-3 text-orange-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-orange-300")}>OPS COMMAND</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>C{snapshot.controlScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.openIncidents} inc · {snapshot.telemetry.servicesHealthy}/
          {snapshot.telemetry.serviceCount} svc
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
              activeTab === t.id ? "text-orange-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "admin" && (
          <div className="space-y-0">
            {snapshot.adminDomains.map((d) => (
              <Row
                key={d.id}
                label={d.domain}
                value={d.detail}
                tone={statusTone(d.status)}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.commandBrief}
            </p>
          </div>
        )}

        {activeTab === "observe" &&
          snapshot.serviceHealth.map((s) => (
            <Row
              key={s.service}
              label={s.service}
              value={`${s.latencyMs}ms · ${s.throughputPerMin}/min`}
              tone={statusTone(s.health)}
            />
          ))}

        {activeTab === "incidents" &&
          (snapshot.incidents.length > 0 ? (
            snapshot.incidents.map((i) => (
              <Row key={i.id} label={`${i.severity} · ${i.title}`} value={i.runbookId} />
            ))
          ) : (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No open incidents</p>
          ))}

        {activeTab === "flags" &&
          snapshot.featureFlags.map((f) => (
            <button
              key={f.id}
              type="button"
              className="w-full text-left"
              onClick={() => FeatureFlagReleaseEngine.toggleFlag(f.id)}
            >
              <Row
                label={f.label}
                value={`${f.enabled ? "on" : "off"} · ${f.rolloutPct}%`}
              />
            </button>
          ))}

        {activeTab === "orgs" &&
          snapshot.organizations.map((o) => (
            <Row key={o.id} label={o.name} value={`${o.tier} · ${o.seats} seats`} tone={statusTone(o.status)} />
          ))}

        {activeTab === "runtime" &&
          snapshot.runtimeControls.map((r) => (
            <Row key={r.id} label={r.control} value={r.status} />
          ))}

        {activeTab === "support" &&
          snapshot.supportTickets.map((t) => (
            <Row key={t.id} label={t.subject} value={`${t.severity} · ${t.status}`} />
          ))}

        {activeTab === "audit" &&
          snapshot.auditEvents.map((e) => (
            <Row key={e.id} label={e.event} value={e.actor} />
          ))}

        {activeTab === "billing" &&
          snapshot.billing.map((b) => (
            <Row key={b.label} label={b.label} value={b.value} tone={statusTone(b.status)} />
          ))}

        {activeTab === "intel" &&
          snapshot.productIntel.map((p) => (
            <Row key={p.metric} label={p.metric} value={`${p.value} (${p.trend})`} />
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
                    ? "border-orange-500/40 bg-orange-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-orange-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
