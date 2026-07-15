"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { budgetStatus } from "@/lib/performance/PerformanceBudgets";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { BuilderRevenuePanel } from "@/components/terminal/BuilderRevenuePanel";

function frictionTone(score: number): "up" | "warn" | "down" {
  if (score >= 70) return "down";
  if (score >= 40) return "warn";
  return "up";
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
      <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums tracking-tight", toneClass)}>
        {value}
        {unit ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-0.5 text-slate-600")}>{unit}</span>
        ) : null}
      </span>
    </div>
  );
}

export function DiagnosticsDashboard() {
  const runtime = usePerformanceStore((s) => s.vitals);
  const runtimeStatus = budgetStatus(runtime);
  const metrics = useTraderTelemetryStore((s) => s.metrics);
  const vitals = useTraderTelemetryStore((s) => s.vitals);
  const segment = useTraderTelemetryStore((s) => s.segment);
  const sessionId = useTraderTelemetryStore((s) => s.sessionId);
  const priorityCap = useTraderTelemetryStore((s) => s.workspacePriorityCap);
  const pipelineActive = useTraderTelemetryStore((s) => s.pipelineActive);
  const suggestionReason = useTraderTelemetryStore(
    (s) => s.adaptiveSuggestion?.reason ?? null,
  );
  const layoutFocusTrends = useTraderTelemetryStore((s) => s.layoutFocusTrends);
  const clickThrough = useTraderTelemetryStore((s) => s.clickThrough);

  const topFocus = useMemo(
    () =>
      [...layoutFocusTrends]
        .sort((a, b) => b.focusCount - a.focusCount)
        .slice(0, 4)
        .map((t) => ({ panelId: t.panelId, focusCount: t.focusCount })),
    [layoutFocusTrends],
  );

  const topRoutes = useMemo(
    () =>
      [...clickThrough]
        .sort((a, b) => b.views - a.views)
        .slice(0, 3)
        .map((c) => ({ routeHash: c.routeHash, views: c.views })),
    [clickThrough],
  );

  const frictionToneKey = frictionTone(metrics.cognitiveFrictionScore);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-none",
        terminalSkin.canvas,
      )}
      data-panel-id="diagnostics"
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between rounded-none px-1",
        )}
      >
        <span>INTERNAL DIAGNOSTICS</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={pipelineActive ? terminalSkin.textUp : terminalSkin.textDown}>
            {pipelineActive ? "PIPE ON" : "PIPE OFF"}
          </span>
          <span className="text-slate-600"> · SEG </span>
          <span className={terminalSkin.textAi}>{segment.toUpperCase()}</span>
          <span className="text-slate-600"> · CAP </span>
          <span className="tabular-nums text-slate-300">{priorityCap}</span>
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-px bg-slate-800 p-px">
        <MetricCell label="EVT/s" value={vitals.eventsPerSecond.toFixed(1)} tone="ai" />
        <MetricCell label="PROC" value={vitals.avgProcessMs.toFixed(2)} unit="ms" />
        <MetricCell label="LAST" value={vitals.lastProcessMs.toFixed(2)} unit="ms" />
        <MetricCell label="BUF" value={String(vitals.eventBufferDepth)} />
        <MetricCell
          label="DROP FR"
          value={String(vitals.droppedFrames)}
          tone={vitals.droppedFrames > 2 ? "warn" : "up"}
        />
        <MetricCell
          label="WS LAG"
          value={String(vitals.wsReconnectLagMs)}
          unit="ms"
          tone={vitals.wsReconnectLagMs > 500 ? "warn" : undefined}
        />
        <MetricCell label="HEAP" value={String(vitals.memoryHintMb)} unit="MB" />
        <MetricCell
          label="STREAM"
          value={vitals.lastStreamStatus.toUpperCase()}
          tone={vitals.lastStreamStatus === "connected" ? "up" : "warn"}
        />
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-px border-t border-slate-800 bg-slate-800 p-px">
        <MetricCell
          label="FPS"
          value={String(runtime.fps)}
          tone={runtimeStatus === "ok" ? "up" : runtimeStatus === "warn" ? "warn" : "down"}
        />
        <MetricCell label="P95 FR" value={runtime.frameTimeP95Ms.toFixed(1)} unit="ms" />
        <MetricCell label="STR/s" value={runtime.streamEps.toFixed(1)} tone="ai" />
        <MetricCell
          label="FLUSH"
          value={runtime.lastFlushMs.toFixed(2)}
          unit="ms"
          tone={runtime.lastFlushMs > 12 ? "warn" : undefined}
        />
        <MetricCell
          label="COAL"
          value={String(runtime.streamCoalesced)}
          tone={runtime.streamCoalesced > 20 ? "warn" : undefined}
        />
        <MetricCell
          label="DROP ST"
          value={String(runtime.streamDropped)}
          tone={runtime.streamDropped > 0 ? "down" : undefined}
        />
        <MetricCell label="RT HEAP" value={String(runtime.heapMb)} unit="MB" />
        <MetricCell
          label="STRESS"
          value={runtime.stressActive ? runtime.stressReason.toUpperCase() : "OFF"}
          tone={runtime.stressActive ? "warn" : "up"}
        />
      </div>

      <div
        className={cn(
          terminalSkin.borderB,
          "shrink-0 px-1 py-0.5",
          TERMINAL_TYPO.micro,
        )}
      >
        <span className="text-slate-600">SESSION </span>
        <span className="tabular-nums text-slate-400">{sessionId}</span>
        {suggestionReason ? (
          <>
            <span className="text-slate-700"> · </span>
            <span className={terminalSkin.textAi}>{suggestionReason}</span>
          </>
        ) : null}
      </div>

      <div
        className={cn(
          terminalSkin.row,
          terminalSkin.borderB,
          "gap-1 bg-slate-900/50 px-1",
          TERMINAL_TYPO.micro,
        )}
      >
        <span>COGNITIVE</span>
        <span className="ml-auto">FRICTION</span>
        <span
          className={cn(
            "w-10 text-right tabular-nums",
            frictionToneKey === "down" && terminalSkin.textDown,
            frictionToneKey === "warn" && terminalSkin.textWarn,
            frictionToneKey === "up" && terminalSkin.textUp,
          )}
        >
          {metrics.cognitiveFrictionScore}
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-px bg-slate-800 p-px">
        <MetricCell
          label="FATIGUE"
          value={String(metrics.alertFatigueIndex)}
          tone={
            metrics.alertFatigueIndex >= 85
              ? "down"
              : metrics.alertFatigueIndex >= 60
                ? "warn"
                : "up"
          }
        />
        <MetricCell
          label="HES p50"
          value={String(Math.round(metrics.hesitationLagMs))}
          unit="ms"
        />
        <MetricCell
          label="HES p95"
          value={String(Math.round(metrics.hesitationP95Ms))}
          unit="ms"
        />
        <MetricCell label="NAV REP" value={String(metrics.navigationRepetitionScore)} />
        <MetricCell label="FOCUS/m" value={String(metrics.focusSwitchRatePerMin)} />
        <MetricCell label="HES n" value={String(metrics.samplesHesitation)} />
        <MetricCell
          label="BYP CRIT"
          value={String(metrics.bypassedCriticalAlerts)}
          tone={metrics.bypassedCriticalAlerts > 0 ? "warn" : undefined}
        />
        <MetricCell label="BYP WATCH" value={String(metrics.bypassedWatchAlerts)} />
        <MetricCell
          label="FRICTION"
          value={String(metrics.cognitiveFrictionScore)}
          tone={frictionToneKey}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div
          className={cn(
            terminalSkin.borderB,
            "px-1 py-0.5",
            TERMINAL_TYPO.micro,
            "text-slate-600",
          )}
        >
          LAYOUT FOCUS TRENDS
        </div>
        {topFocus.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            NO FOCUS SAMPLES · AWAITING INTERACTION FOOTPRINT
          </p>
        ) : (
          topFocus.map((t) => (
            <div
              key={t.panelId}
              className={cn(
                terminalSkin.row,
                "justify-between border-b-[0.5px] border-slate-800 px-1",
              )}
            >
              <span className={TERMINAL_TYPO.dataSm}>{t.panelId.toUpperCase()}</span>
              <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-400")}>
                {t.focusCount} focus
              </span>
            </div>
          ))
        )}

        <div
          className={cn(
            terminalSkin.borderB,
            terminalSkin.borderT,
            "mt-0.5 px-1 py-0.5",
            TERMINAL_TYPO.micro,
            "text-slate-600",
          )}
        >
          CLICK-THROUGH (ANON HASH)
        </div>
        {topRoutes.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            NO ROUTE TELEMETRY
          </p>
        ) : (
          topRoutes.map((r) => (
            <div
              key={r.routeHash}
              className={cn(
                terminalSkin.row,
                "justify-between gap-2 border-b-[0.5px] border-slate-800 px-1",
              )}
            >
              <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-500")}>
                {r.routeHash}
              </span>
              <span className={cn(TERMINAL_TYPO.dataSm, "shrink-0 tabular-nums text-[#00e5ff]")}>
                {r.views}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-2 shrink-0">
        <BuilderRevenuePanel />
      </div>
    </div>
  );
}


