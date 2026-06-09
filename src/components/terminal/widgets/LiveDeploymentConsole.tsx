"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { InviteGateEngine } from "@/lib/alpha/InviteGateEngine";
import { LiveDeploymentOrchestrator } from "@/lib/live-deployment/LiveDeploymentOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useLiveDeploymentStore, type LiveDeploymentTab } from "@/store/useLiveDeploymentStore";
import type { LiveDeploymentModeId } from "@/types/live-deployment";

const TABS: { id: LiveDeploymentTab; label: string }[] = [
  { id: "alpha", label: "ALPHA" },
  { id: "infra", label: "INFRA" },
  { id: "telemetry", label: "TEL" },
  { id: "retention", label: "RET" },
  { id: "feedback", label: "FB" },
  { id: "hardening", label: "HARD" },
  { id: "support", label: "SUP" },
  { id: "enterprise", label: "ENT" },
  { id: "success", label: "OK" },
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

export function LiveDeploymentConsole() {
  const snapshot = useLiveDeploymentStore((s) => s.snapshot);
  const activeTab = useLiveDeploymentStore((s) => s.activeTab);
  const setActiveTab = useLiveDeploymentStore((s) => s.setActiveTab);
  const setActiveMode = useLiveDeploymentStore((s) => s.setActiveMode);
  const [inviteCode, setInviteCode] = useState("");

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting live deployment desk…</p>
      </div>
    );
  }

  const applyMode = (id: LiveDeploymentModeId) => {
    LiveDeploymentOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const refresh = () => {
    useLiveDeploymentStore.getState().setSnapshot(LiveDeploymentOrchestrator.snapshot());
  };

  const focusPanel = (panelId: string) => {
    terminalBus.emit("widget:focus", { widgetId: panelId });
  };

  const submitInvite = () => {
    if (InviteGateEngine.validate(inviteCode)) {
      setInviteCode("");
      refresh();
    }
  };

  const sev = (s: string) =>
    s === "critical" || s === "killed" || s === "degraded"
      ? "text-rose-400/90"
      : s === "watch" || s === "elevated" || s === "required"
        ? "text-amber-400/90"
        : s === "validated" || s === "live" || s === "healthy" || s === "ready" || s === "approved"
          ? "text-emerald-500/90"
          : "text-slate-400";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Rocket className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>LIVE DEPLOY</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>N{snapshot.deploymentScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          rollout {snapshot.telemetryMeta.rolloutPct}%
        </span>
      </header>

      <p className={cn(TERMINAL_TYPO.micro, "shrink-0 border-b border-slate-800/80 px-1 py-0.5 text-slate-500")}>
        {snapshot.deploymentBrief}
      </p>

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
        {activeTab === "alpha" && (
          <div className="space-y-1">
            {snapshot.alphaControls.map((c) => (
              <Row key={c.id} label={c.control} value={`${c.state} · ${c.governance}`} tone={sev(c.state)} />
            ))}
            {InviteGateEngine.inviteRequired() && !snapshot.telemetryMeta.inviteValidated && (
              <div className="mt-1 flex gap-0.5">
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Invite code"
                  className={cn(INSTITUTIONAL_INTERACTION.input, "flex-1 text-[10px]")}
                />
                <button type="button" onClick={submitInvite} className={INSTITUTIONAL_INTERACTION.tabButton}>
                  VALIDATE
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "infra" &&
          snapshot.infraValidation.map((i) => (
            <Row key={i.id} label={i.system} value={`${i.status} · ${i.detail}`} tone={sev(i.status)} />
          ))}

        {activeTab === "telemetry" &&
          snapshot.telemetry.map((t) => (
            <Row key={t.id} label={t.metric} value={`${t.value} (${t.signal})`} />
          ))}

        {activeTab === "retention" &&
          snapshot.retentionInsights.map((r) => (
            <div key={r.id} className="mb-1 border-b border-slate-800/80 pb-0.5">
              <Row label={r.insight} value={r.strength} />
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{r.implication}</p>
            </div>
          ))}

        {activeTab === "feedback" &&
          snapshot.feedbackLoops.map((f) => (
            <Row key={f.id} label={`${f.channel} · ${f.priority}`} value={f.summary.slice(0, 40)} />
          ))}

        {activeTab === "hardening" &&
          snapshot.hardening.map((h) => (
            <div key={h.id} className="mb-1 border-b border-slate-800/80 pb-0.5">
              <Row label={h.area} value={h.status} tone={sev(h.status)} />
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{h.action}</p>
            </div>
          ))}

        {activeTab === "support" &&
          snapshot.supportOps.map((s) => (
            <Row key={s.id} label={s.workflow} value={s.state} tone={sev(s.state)} />
          ))}

        {activeTab === "enterprise" &&
          snapshot.enterpriseReadiness.map((e) => (
            <Row key={e.id} label={e.asset} value={e.readiness} tone={sev(e.readiness)} />
          ))}

        {activeTab === "success" && (
          <div className="space-y-1">
            {snapshot.successIndicators.map((s) => (
              <Row
                key={s.label}
                label={s.label}
                value={s.detail}
                tone={s.met ? "text-emerald-500/90" : "text-slate-500"}
              />
            ))}
            {snapshot.iterationFocus.map((f) => (
              <p key={f} className={cn(TERMINAL_TYPO.micro, "text-violet-400/80")}>
                → {f}
              </p>
            ))}
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
                    ? "border-violet-800/60 bg-violet-950/30"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-violet-300")}>{m.label}</p>
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
                      className={cn(
                        TERMINAL_TYPO.micro,
                        "rounded bg-slate-900 px-0.5 text-slate-500 hover:text-violet-400",
                      )}
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
