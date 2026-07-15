"use client";

import { useState } from "react";
import { Activity, Download, ShieldCheck, Siren, Trash2 } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { ReliabilityOrchestrator } from "@/lib/reliability";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { AuditLogEngine } from "@/lib/security/AuditLogEngine";
import { downloadAuditCsv, fetchServerAudit } from "@/lib/security/serverAuditClient";
import { useHardeningStore } from "@/store/useHardeningStore";
import { useReliabilityStore } from "@/store/useReliabilityStore";
import { useSecurityStore } from "@/store/useSecurityStore";
import type { HardeningStatus } from "@/types/launch-hardening";

type ReliabilityTab = "runtime" | "data" | "execution" | "trust" | "launch" | "audit";

const TABS: Array<{ id: ReliabilityTab; label: string }> = [
  { id: "runtime", label: "RUNTIME" },
  { id: "data", label: "DATA" },
  { id: "execution", label: "EXECUTION" },
  { id: "trust", label: "TRUST" },
  { id: "launch", label: "LAUNCH" },
  { id: "audit", label: "AUDIT" },
];

function hardeningColor(s: HardeningStatus): string {
  if (s === "pass") return terminalSkin.textUp;
  if (s === "watch") return terminalSkin.textWarn;
  return terminalSkin.textDown;
}

export function ReliabilityConsole() {
  const storeSnapshot = useReliabilityStore((s) => s.snapshot);
  const snapshot = useConsoleSnapshot(storeSnapshot, () => ReliabilityOrchestrator.snapshot());
  const auditLog = useReliabilityStore((s) => s.auditLog);
  const clearAudit = useReliabilityStore((s) => s.clearAudit);
  const trust = useSecurityStore((s) => s.snapshot);
  const hardening = useHardeningStore((s) => s.snapshot);
  const securityAudit = AuditLogEngine.load();
  const [tab, setTab] = useState<ReliabilityTab>("runtime");
  const [serverAuditCount, setServerAuditCount] = useState<number | null>(null);

  const pullServerAudit = async () => {
    const entries = await fetchServerAudit(120);
    setServerAuditCount(entries.length);
    if (entries.length > 0) downloadAuditCsv(entries, "equilibrium-server-audit.csv");
  };

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Initializing reliability monitor…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex items-center gap-2 px-1 py-0.5")}>
        <ShieldCheck className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>RELIABILITY</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          TRUST {snapshot.trustScore}%
          {hardening ? (
            <>
              {" "}
              · LAUNCH {hardening.launchReadinessScore}
              {hardening.launchApproved ? (
                <span className={terminalSkin.textUp}> ✓</span>
              ) : null}
            </>
          ) : null}
        </span>
        {snapshot.volatility.highVolMode ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-amber-400")}>HIGH VOL MODE</span>
        ) : (
          <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>NORMAL</span>
        )}
      </header>

      <nav className={cn(terminalSkin.borderB, "flex gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-800 px-1",
              tab === t.id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {tab === "runtime" ? (
          <section className="space-y-1">
            <Row label="Websocket" value={snapshot.runtime.websocketHealth} />
            <Row label="Reconnects" value={String(snapshot.runtime.reconnectAttempts)} />
            <Row label="Lag" value={`${snapshot.runtime.lastMessageLagMs}ms`} />
            <Row label="Throughput" value={`${snapshot.runtime.streamThroughputPerMin}/min`} />
            <Row label="CPU pressure" value={snapshot.runtime.cpuPressure} />
            <Row label="Memory pressure" value={snapshot.runtime.memoryPressure} />
            <Row label="State sync" value={`${snapshot.runtime.stateSyncConsistency}%`} />
          </section>
        ) : null}

        {tab === "data" ? (
          <section className="space-y-1">
            <Row label="Quality score" value={`${snapshot.data.qualityScore}%`} />
            <Row label="Timestamp integrity" value={`${snapshot.data.timestampIntegrity}%`} />
            <Row label="Source verification" value={`${snapshot.data.sourceVerification}%`} />
            <Row label="Redundancy" value={`${snapshot.data.redundancyCoverage}%`} />
            <Row label="Stale feeds" value={String(snapshot.data.staleFeedCount)} />
            <Row label="Conflicts" value={String(snapshot.data.conflictCount)} />
          </section>
        ) : null}

        {tab === "execution" ? (
          <section className="space-y-1">
            <Row label="Confirmation clarity" value={`${snapshot.execution.confirmationClarity}%`} />
            <Row label="Slippage warning coverage" value={`${snapshot.execution.slippageWarningCoverage}%`} />
            <Row label="Retry safety" value={`${snapshot.execution.retrySafetyScore}%`} />
            <Row label="Reconciliation health" value={`${snapshot.execution.reconciliationHealth}%`} />
            <Row label="Failed orders" value={String(snapshot.execution.failedOrderCount)} />
            <div className={cn(terminalSkin.borderB, "mt-1 py-0.5")}>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                deterministic execution + traceability under stress
              </span>
            </div>
          </section>
        ) : null}

        {tab === "trust" ? (
          <section className="space-y-1">
            <Row label="Trust score" value={trust ? `${trust.trustScore}%` : "—"} />
            <Row label="Session" value={trust?.sessionHealth.toUpperCase() ?? "NONE"} />
            <Row label="WS bound" value={trust?.wsSessionBound ? "YES" : "NO"} />
            <Row label="Devices" value={String(trust?.activeDevices ?? 0)} />
            <Row label="Suspicious" value={String(trust?.suspiciousDevices ?? 0)} />
            <Row label="Exec denials" value={String(trust?.executionDenials1h ?? 0)} />
            <Row label="JWT rotation" value={trust?.secretsRotationDue ? "DUE" : "OK"} />
            <div className={cn(terminalSkin.borderB, "mt-1 py-0.5")}>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                RBAC · SIWE · audit · rate limits · execution isolation
              </span>
            </div>
            {securityAudit.slice(0, 6).map((e) => (
              <div key={e.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {e.category}/{e.action}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{e.detail}</p>
              </div>
            ))}
          </section>
        ) : null}

        {tab === "launch" && hardening ? (
          <section className="space-y-1">
            <Row
              label="Launch readiness"
              value={`${hardening.launchReadinessScore}% ${hardening.launchApproved ? "APPROVED" : "HOLD"}`}
            />
            <Row label="Integration" value={`${hardening.integrationScore}%`} />
            <Row label="Workflow" value={`${hardening.workflowScore}%`} />
            <Row label="Data quality" value={`${hardening.dataQualityScore}%`} />
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>INTEGRATION AUDIT</p>
            {hardening.integration.map((r) => (
              <div key={r.domain} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex items-center justify-between gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{r.label}</span>
                  <span className={cn(TERMINAL_TYPO.micro, hardeningColor(r.status))}>
                    {r.score} · {r.status}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{r.detail}</p>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>WORKFLOW CONTINUITY</p>
            {hardening.workflows.map((w) => (
              <div key={w.stage} className="flex items-center justify-between py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{w.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, hardeningColor(w.status))}>{w.continuityPct}%</span>
              </div>
            ))}
            {hardening.blockers.length > 0 ? (
              <>
                <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-amber-500")}>BLOCKERS</p>
                {hardening.blockers.map((b) => (
                  <p key={b} className={cn(TERMINAL_TYPO.micro, "text-amber-400")}>
                    {b}
                  </p>
                ))}
              </>
            ) : null}
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>PRE-LAUNCH ENVIRONMENTS</p>
            {hardening.environments.map((e) => (
              <p key={e.id} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                {e.label} · {e.hlNetwork}
                {e.stressReplay ? " · STRESS" : ""}
              </p>
            ))}
          </section>
        ) : null}

        {tab === "audit" ? (
          <section>
            <div className="mb-1 flex items-center justify-between gap-1">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>RUNTIME AUDIT</span>
              <button
                type="button"
                onClick={clearAudit}
                className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-500 hover:text-cyan-300")}
              >
                <Trash2 className="h-3 w-3" /> CLEAR
              </button>
            </div>
            {auditLog.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No audit entries yet.</p>
            ) : (
              auditLog.slice(0, 80).map((e) => (
                <div key={e.id} className={cn(terminalSkin.borderB, "mb-0.5 py-0.5")}>
                  <div className="flex items-center gap-1">
                    {e.severity === "critical" ? (
                      <Siren className="h-3 w-3 text-red-500" />
                    ) : (
                      <Activity className="h-3 w-3 text-slate-500" />
                    )}
                    <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{e.category.toUpperCase()}</span>
                    <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
                      {new Date(e.at).toISOString().slice(11, 19)}
                    </span>
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{e.summary}</p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{e.detail}</p>
                </div>
              ))
            )}

            <div className={cn(terminalSkin.borderB, "mb-1 mt-2 flex items-center justify-between pt-1")}>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                EXECUTION AUDIT ({securityAudit.length})
                {serverAuditCount != null ? ` · server ${serverAuditCount}` : ""}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void pullServerAudit()}
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "flex items-center gap-1 text-slate-500 hover:text-cyan-300",
                  )}
                >
                  <Download className="h-3 w-3" /> SERVER CSV
                </button>
                <button
                  type="button"
                  onClick={() => AuditLogEngine.downloadCsv()}
                  disabled={securityAudit.length === 0}
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "flex items-center gap-1 text-slate-500 hover:text-cyan-300 disabled:opacity-40",
                  )}
                >
                  <Download className="h-3 w-3" /> LOCAL CSV
                </button>
              </div>
            </div>
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-600")}>
              Server audit persists across redeploys when Vercel KV is connected (KV_REST_API_*).
            </p>
            {securityAudit.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No execution audit entries yet.</p>
            ) : (
              securityAudit.slice(0, 40).map((e) => (
                <div key={e.id} className={cn(terminalSkin.borderB, "mb-0.5 py-0.5")}>
                  <div className="flex items-center gap-1">
                    <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                      {e.category}/{e.action}
                    </span>
                    <span
                      className={cn(
                        TERMINAL_TYPO.micro,
                        e.outcome === "ok"
                          ? terminalSkin.textUp
                          : e.outcome === "denied"
                            ? terminalSkin.textWarn
                            : terminalSkin.textDown,
                      )}
                    >
                      {e.outcome.toUpperCase()}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
                      {new Date(e.at).toISOString().slice(11, 19)}
                    </span>
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-400")}>{e.detail}</p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-700")}>{e.traceId}</p>
                </div>
              ))
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn(terminalSkin.borderB, "flex items-center justify-between py-0.5")}>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{value.toUpperCase()}</span>
    </div>
  );
}
