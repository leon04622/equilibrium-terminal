"use client";

import { Activity } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { useTerminalStore } from "@/store/terminalStore";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import {
  useExecutionAnalyticsStore,
  type ExecutionAnalyticsTab,
} from "@/store/useExecutionAnalyticsStore";
import type { ExecutionWorkspaceModeId } from "@/types/execution-analytics";

const TABS: { id: ExecutionAnalyticsTab; label: string }[] = [
  { id: "flow", label: "FLOW" },
  { id: "liquidity", label: "LIQUIDITY" },
  { id: "quality", label: "QUALITY" },
  { id: "micro", label: "MICRO" },
  { id: "cross", label: "CROSS" },
  { id: "alerts", label: "ALERTS" },
  { id: "modes", label: "MODES" },
];

function sev(s: string): string {
  if (s === "critical" || s === "high") return terminalSkin.textDown;
  if (s === "watch" || s === "elevated") return terminalSkin.textWarn;
  return terminalSkin.textUp;
}

export function ExecutionIntelligenceConsole() {
  const storeSnapshot = useExecutionAnalyticsStore((s) => s.snapshot);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin) ?? "BTC";
  const snapshot = useConsoleSnapshot(storeSnapshot, () =>
    ExecutionAnalyticsOrchestrator.snapshot(selectedCoin),
  );
  const activeTab = useExecutionAnalyticsStore((s) => s.activeTab);
  const setActiveTab = useExecutionAnalyticsStore((s) => s.setActiveTab);
  const setActiveMode = useExecutionAnalyticsStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting execution analytics…</p>
      </div>
    );
  }

  const applyMode = (id: ExecutionWorkspaceModeId) => {
    ExecutionAnalyticsOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" data-execintel-panel="execintel">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Activity className="h-3 w-3 text-emerald-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-emerald-300")}>EXECUTION INTEL</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.coin} · CONF {snapshot.executionConfidence} · SCORE {snapshot.analyticsScore}
        </span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto",
            snapshot.telemetry.workerActive ? terminalSkin.textUp : "text-slate-600",
          )}
        >
          {snapshot.telemetry.workerActive ? "WORKER LIVE" : "WORKER IDLE"}
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
              activeTab === t.id ? "text-emerald-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "flow" && (
          <section className="space-y-0.5">
            <Row label="Aggressive buy" value={`${snapshot.orderFlow.aggressiveBuyPct}%`} />
            <Row label="Aggressive sell" value={`${snapshot.orderFlow.aggressiveSellPct}%`} />
            <Row label="Market pressure" value={snapshot.orderFlow.marketPressure.toUpperCase()} />
            <Row label="Absorption" value={String(snapshot.orderFlow.absorptionScore)} />
            <Row label="Sweeps" value={String(snapshot.orderFlow.sweepCount)} />
            <Row label="Momentum" value={String(snapshot.orderFlow.momentumScore)} />
            <Row label="Imbalance" value={`${snapshot.orderFlow.imbalancePct}%`} />
          </section>
        )}

        {activeTab === "liquidity" && (
          <section>
            <Row label="Resting bid" value={`$${(snapshot.liquidity.restingBidUsd / 1e6).toFixed(2)}M`} />
            <Row label="Resting ask" value={`$${(snapshot.liquidity.restingAskUsd / 1e6).toFixed(2)}M`} />
            <Row label="Depth collapse risk" value={String(snapshot.liquidity.depthCollapseRisk)} />
            <Row label="Spoof score" value={String(snapshot.liquidity.spoofingScore)} />
            <Row label="Iceberg score" value={String(snapshot.liquidity.icebergScore)} />
            <Row label="Voids" value={String(snapshot.liquidity.voidCount)} />
            {snapshot.liquidity.heatmap.slice(0, 6).map((h) => (
              <div key={h.price} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{h.price.toFixed(2)}</span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  heat {h.heat.toFixed(2)}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "quality" && (
          <section className="space-y-0.5">
            <Row region="quality-slippage" label="Slippage" value={`${snapshot.quality.slippageBps.toFixed(1)} bps`} tone={sev(snapshot.quality.riskTier)} />
            <Row region="quality-spread" label="Spread" value={`${snapshot.quality.spreadBps.toFixed(1)} bps`} />
            <Row region="fill-quality" label="Fill quality" value={String(snapshot.quality.fillQualityScore)} />
            <Row label="Latency" value={`${snapshot.quality.latencyMs}ms`} />
            <Row label="Liq impact" value={`${snapshot.quality.liquidityImpactBps.toFixed(1)} bps`} />
            <Row label="Efficiency" value={String(snapshot.quality.efficiencyScore)} />
            <Row label="Risk tier" value={snapshot.quality.riskTier.toUpperCase()} tone={sev(snapshot.quality.riskTier)} />
          </section>
        )}

        {activeTab === "micro" && (
          <section className="space-y-0.5">
            <Row label="Spread velocity" value={String(snapshot.microstructure.spreadVelocity)} />
            <Row label="Book velocity" value={String(snapshot.microstructure.bookVelocity)} />
            <Row label="Depth shift" value={`${snapshot.microstructure.depthShiftPct}%`} />
            <Row label="Fragmentation" value={String(snapshot.microstructure.fragmentationScore)} />
            <Row label="Vacuum risk" value={String(snapshot.microstructure.vacuumRisk)} />
            <Row label="Exec pressure" value={String(snapshot.microstructure.executionPressure)} />
          </section>
        )}

        {activeTab === "cross" &&
          snapshot.crossVenue.map((r) => (
            <div key={r.exchange} className="border-b border-slate-800 py-0.5">
              <div className="flex justify-between">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{r.exchange.toUpperCase()}</span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {r.mid?.toFixed(2) ?? "—"}
                </span>
              </div>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                spr {r.spreadBps?.toFixed(1) ?? "—"} · div {r.divergenceBps ?? "—"} · liq {r.liquiditySharePct}%
              </span>
            </div>
          ))}

        {activeTab === "alerts" &&
          (snapshot.alerts.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No execution alerts.</p>
          ) : (
            snapshot.alerts.map((a) => (
              <div key={a.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, sev(a.severity))}>{a.headline}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{a.detail}</p>
              </div>
            ))
          ))}

        {activeTab === "modes" &&
          snapshot.workspaceModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => applyMode(m.id)}
              className={cn(
                "mb-0.5 w-full border border-slate-800 px-1 py-0.5 text-left",
                snapshot.activeMode === m.id && "border-emerald-800 bg-emerald-950/30",
              )}
            >
              <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{m.label}</span>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
            </button>
          ))}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  region,
}: {
  label: string;
  value: string;
  tone?: string;
  region?: string;
}) {
  return (
    <div className="flex justify-between border-b border-slate-800 py-0.5" data-execintel-region={region}>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-300")}>{value}</span>
    </div>
  );
}
