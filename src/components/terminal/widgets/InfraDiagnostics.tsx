"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useDevOpsStore } from "@/store/useDevOpsStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";

type InfraTab = "platform" | "liveops";

function toneForLag(ms: number): "up" | "warn" | "down" {
  if (ms <= 25) return "up";
  if (ms <= 120) return "warn";
  return "down";
}

function MetricCell({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "up" | "down" | "warn" | "ai";
}) {
  const toneClass =
    tone === "up"
      ? terminalSkin.textUp
      : tone === "down"
        ? terminalSkin.textDown
        : tone === "warn"
          ? terminalSkin.textWarn
          : tone === "ai"
            ? terminalSkin.textAi
            : "text-slate-300";

  return (
    <div className="flex min-w-0 flex-col gap-0 rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.dataSm, "uppercase tabular-nums tracking-tighter", toneClass)}>
        {value}
        {unit ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-0.5 text-slate-600")}>{unit}</span>
        ) : null}
      </span>
    </div>
  );
}

function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}H${String(m).padStart(2, "0")}M`;
  if (m > 0) return `${m}M${String(s).padStart(2, "0")}S`;
  return `${s}S`;
}

export function InfraDiagnostics() {
  const [tab, setTab] = useState<InfraTab>("platform");
  const ops = useDevOpsStore((s) => s.snapshot);
  const vitals = useProductionConfigStore((s) => s.vitals);
  const cloudSyncStatus = useProductionConfigStore((s) => s.cloudSyncStatus);
  const sessionHealth = useProductionConfigStore((s) => s.sessionHealth);
  const gatewayMultiplexActive = useProductionConfigStore((s) => s.gatewayMultiplexActive);
  const platformAuthenticated = useProductionConfigStore((s) => s.platformAuthenticated);
  const entitlements = useProductionConfigStore((s) => s.entitlements);
  const serverSaveLogs = useProductionConfigStore((s) => s.serverSaveLogs);
  const lastSnapshotHash = useProductionConfigStore((s) => s.lastSnapshotHash);

  const recentLogs = useMemo(() => serverSaveLogs.slice(0, 6), [serverSaveLogs]);

  const gwTone = toneForLag(vitals.gatewayLatencyMs);
  const dbTone = toneForLag(vitals.dbCommitLatencyMs);
  const qTone =
    vitals.workerQueueLagMs > 200 ? "down" : vitals.workerQueueLagMs > 60 ? "warn" : "up";

  return (
    <div
      className={cn("flex h-full flex-col overflow-hidden rounded-none", terminalSkin.canvas)}
      data-panel-id="infra"
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between rounded-none px-1",
        )}
      >
        <span>LIVE OPS · INFRA</span>
        <span className={TERMINAL_TYPO.micro}>
          {ops ? (
            <>
              <span className={ops.operationalScore >= 85 ? terminalSkin.textUp : terminalSkin.textWarn}>
                OPS {ops.operationalScore}
              </span>
              <span className="text-slate-600"> · </span>
            </>
          ) : null}
          <span className={gatewayMultiplexActive ? terminalSkin.textUp : terminalSkin.textDown}>
            {gatewayMultiplexActive ? "GW MUX" : "GW OFF"}
          </span>
          <span className="text-slate-600"> · SYNC </span>
          <span
            className={
              cloudSyncStatus === "synced" ? terminalSkin.textUp : terminalSkin.textWarn
            }
          >
            {cloudSyncStatus.toUpperCase()}
          </span>
          <span className="text-slate-600"> · AUTH </span>
          <span className={platformAuthenticated ? terminalSkin.textAi : terminalSkin.textDown}>
            {platformAuthenticated ? "JWT" : "NONE"}
          </span>
        </span>
      </div>

      <nav className={cn(terminalSkin.borderB, "flex gap-0.5 p-0.5")}>
        {(
          [
            ["platform", "PLATFORM"],
            ["liveops", "LIVE OPS"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-800 px-1",
              tab === id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "liveops" && ops ? (
        <>
          <div className="grid shrink-0 grid-cols-4 gap-px bg-slate-800 p-px">
            <MetricCell label="ENV" value={ops.environment.toUpperCase()} tone="ai" />
            <MetricCell label="SLO" value={ops.uptimePct.toFixed(1)} unit="%" tone="up" />
            <MetricCell label="SCORE" value={String(ops.operationalScore)} tone="ai" />
            <MetricCell label="CI/CD" value={ops.cicdStatus.toUpperCase()} />
            <MetricCell label="REGION" value={ops.activeRegion.toUpperCase()} />
            <MetricCell label="WS" value={ops.stream.wsConnected ? "LIVE" : "DOWN"} tone={ops.stream.wsConnected ? "up" : "down"} />
            <MetricCell label="MSG AGE" value={String(ops.stream.lastMessageAgeMs)} unit="MS" />
            <MetricCell label="STR" value={ops.stream.stressMode ? "ON" : "OFF"} tone={ops.stream.stressMode ? "warn" : "up"} />
            <MetricCell label="BUILD" value={ops.release.buildId} />
            <MetricCell label="CHANNEL" value={ops.release.channel.toUpperCase()} />
            <MetricCell label="FPS" value={String(ops.observability.fps)} />
            <MetricCell label="EPS" value={ops.observability.metricsEps.toFixed(1)} />
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-1 py-0.5">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>REGIONS</p>
            {ops.regions.map((r) => (
              <div key={r.id} className="border-b border-slate-800 py-0.5">
                <span className={TERMINAL_TYPO.dataSm}>{r.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-500")}>
                  {r.health} · {r.latencyMs}ms · {r.trafficPct}%
                </span>
              </div>
            ))}
            {ops.incidents.length > 0 ? (
              <>
                <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-amber-500")}>INCIDENTS</p>
                {ops.incidents.map((i) => (
                  <div key={i.id} className="border-b border-slate-800 py-0.5">
                    <span className={TERMINAL_TYPO.dataSm}>{i.title}</span>
                    <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}> · {i.severity}</span>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </>
      ) : null}

      {tab === "platform" ? (
      <>
      <div className="grid shrink-0 grid-cols-4 gap-px bg-slate-800 p-px">
        <MetricCell label="GW LAT" value={vitals.gatewayLatencyMs.toFixed(1)} unit="MS" tone={gwTone} />
        <MetricCell
          label="UPSTREAM"
          value={String(vitals.gatewayUpstreamConnections)}
          tone={vitals.gatewayUpstreamConnections === 1 ? "up" : "warn"}
        />
        <MetricCell label="FANOUT" value={String(vitals.gatewayFanoutClients)} tone="ai" />
        <MetricCell label="UPTIME" value={formatUptime(vitals.systemUptimeSec)} tone="up" />
        <MetricCell label="Q DEPTH" value={String(vitals.workerQueueDepth)} tone={qTone} />
        <MetricCell label="Q LAG" value={vitals.workerQueueLagMs.toFixed(0)} unit="MS" tone={qTone} />
        <MetricCell label="WORKER/s" value={vitals.workerProcessedPerSecond.toFixed(1)} tone="ai" />
        <MetricCell
          label="DB COMMIT"
          value={vitals.dbCommitLatencyMs.toFixed(2)}
          unit="MS"
          tone={dbTone}
        />
        <MetricCell label="DB PEND" value={String(vitals.dbPendingWrites)} />
        <MetricCell label="TIER" value={vitals.activeSubscriptionTier.toUpperCase()} tone="ai" />
        <MetricCell label="DESKS" value={String(vitals.activeDeskCount)} />
        <MetricCell
          label="SESS"
          value={sessionHealth.replace(/_/g, " ")}
          tone={sessionHealth === "healthy" ? "up" : "warn"}
        />
      </div>

      <div
        className={cn(
          terminalSkin.borderB,
          "grid shrink-0 grid-cols-3 gap-px bg-slate-800 p-px",
        )}
      >
        <MetricCell
          label="ALPHA LAB"
          value={entitlements.alphaLabEnabled ? "ON" : "OFF"}
          tone={entitlements.alphaLabEnabled ? "up" : "down"}
        />
        <MetricCell
          label="TEAM NET"
          value={entitlements.teamNetEnabled ? "ON" : "OFF"}
          tone={entitlements.teamNetEnabled ? "up" : "down"}
        />
        <MetricCell
          label="TELEM EXPORT"
          value={entitlements.telemetryExportEnabled ? "ON" : "OFF"}
          tone={entitlements.telemetryExportEnabled ? "ai" : "down"}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-1 py-0.5">
        <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>
          SERVER SAVE LOG
          {lastSnapshotHash ? (
            <span className="ml-2 text-slate-500">HASH {lastSnapshotHash.slice(0, 12)}…</span>
          ) : null}
        </p>
        <div className="space-y-px">
          {recentLogs.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>NO PERSISTENCE EVENTS</p>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[72px_1fr_auto] gap-1 rounded-none border-[0.5px] border-slate-800 bg-slate-950/80 px-1 py-0.5"
              >
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    log.status === "ok"
                      ? terminalSkin.textUp
                      : log.status === "error"
                        ? terminalSkin.textDown
                        : terminalSkin.textWarn,
                  )}
                >
                  {log.operation.replace(/_/g, " ")}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-400")}>
                  {log.message}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>
                  {log.durationMs}MS
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      </>
      ) : null}
    </div>
  );
}
