"use client";

import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import {
  usePortfolioDeskStore,
  type PortfolioDeskTab,
} from "@/store/usePortfolioDeskStore";
import type { PortfolioDashboardModeId } from "@/types/portfolio-risk-treasury";

const TABS: { id: PortfolioDeskTab; label: string }[] = [
  { id: "portfolio", label: "PORTFOLIO" },
  { id: "risk", label: "RISK" },
  { id: "treasury", label: "TREASURY" },
  { id: "analytics", label: "PNL" },
  { id: "collateral", label: "COLLATERAL" },
  { id: "cross", label: "VENUES" },
  { id: "alerts", label: "ALERTS" },
  { id: "history", label: "HISTORY" },
  { id: "modes", label: "MODES" },
];

function sev(s: string): string {
  if (s === "critical") return terminalSkin.textDown;
  if (s === "watch" || s === "elevated") return terminalSkin.textWarn;
  return terminalSkin.textUp;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function PortfolioDeskConsole() {
  const snapshot = usePortfolioDeskStore((s) => s.snapshot);
  const activeTab = usePortfolioDeskStore((s) => s.activeTab);
  const setActiveTab = usePortfolioDeskStore((s) => s.setActiveTab);
  const setActiveMode = usePortfolioDeskStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting portfolio desk…</p>
      </div>
    );
  }

  const applyMode = (id: PortfolioDashboardModeId) => {
    PortfolioDeskOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const fmtUsd = (n: number) =>
    n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(0)}`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Landmark className="h-3 w-3 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>PORTFOLIO DESK</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · HEALTH {snapshot.portfolioHealthScore} · {snapshot.risk.riskTier.toUpperCase()}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          DQ {snapshot.telemetry.dataQualityScore}
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
        {activeTab === "portfolio" && (
          <section className="space-y-0.5">
            <Row label="Total AUM" value={fmtUsd(snapshot.portfolio.totalAumUsd)} />
            <Row label="Account value" value={fmtUsd(snapshot.portfolio.accountValueUsd)} />
            <Row label="Withdrawable" value={fmtUsd(snapshot.portfolio.withdrawableUsd)} />
            <Row label="Net PnL" value={fmtUsd(snapshot.portfolio.netPnlUsd)} tone={snapshot.portfolio.netPnlUsd >= 0 ? terminalSkin.textUp : terminalSkin.textDown} />
            <Row label="Positions" value={String(snapshot.portfolio.positionCount)} />
            <Row label="Venues" value={String(snapshot.portfolio.venueCount)} />
            {snapshot.portfolio.holdings.slice(0, 8).map((h) => (
              <div key={`${h.venue}-${h.asset}`} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {h.asset} · {h.venue}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  {h.pctPortfolio}% · {fmtUsd(h.notionalUsd)}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "risk" && (
          <section className="space-y-0.5">
            <Row label="Risk tier" value={snapshot.risk.riskTier.toUpperCase()} tone={sev(snapshot.risk.riskTier)} />
            <Row label="Leverage" value={`${snapshot.risk.leverageRatio}x`} />
            <Row label="Margin util" value={`${snapshot.risk.marginUtilizationPct}%`} />
            <Row label="Liquidation risk" value={String(snapshot.risk.liquidationRiskScore)} tone={sev(snapshot.risk.riskTier)} />
            <Row label="Collateral health" value={String(snapshot.risk.collateralHealthScore)} />
            <Row label="Concentration" value={String(snapshot.risk.concentrationScore)} />
            <Row label="Stablecoin dep" value={`${snapshot.risk.stablecoinDependencyPct}%`} />
            <Row label="Vol exposure" value={String(snapshot.risk.volatilityExposureScore)} />
            <Row label="Direction" value={snapshot.risk.directionalBias.toUpperCase()} />
            <Row label="Correlation stress" value={String(snapshot.risk.correlationStress)} />
          </section>
        )}

        {activeTab === "treasury" && (
          <section className="space-y-0.5">
            <Row label="Stablecoin balance" value={fmtUsd(snapshot.treasury.stablecoinBalanceUsd)} />
            <Row label="Stablecoin %" value={`${snapshot.treasury.stablecoinPct}%`} />
            <Row label="Exchange allocation" value={`${snapshot.treasury.exchangeAllocationPct}%`} />
            <Row label="Cold / hot" value={snapshot.treasury.coldHotRatio.toFixed(2)} />
            <Row label="Operational liquidity" value={fmtUsd(snapshot.treasury.operationalLiquidityUsd)} />
            <Row label="Bridge exposure" value={fmtUsd(snapshot.treasury.bridgeExposureUsd)} />
            <Row label="Custody score" value={String(snapshot.treasury.custodyExposureScore)} />
            <Row label="Flow velocity" value={snapshot.treasury.flowVelocity.toUpperCase()} />
          </section>
        )}

        {activeTab === "analytics" && (
          <section className="space-y-0.5">
            <Row label="Unrealized PnL" value={fmtUsd(snapshot.analytics.unrealizedPnlUsd)} />
            <Row label="Realized PnL" value={fmtUsd(snapshot.analytics.realizedPnlUsd)} />
            <Row label="Total PnL" value={fmtUsd(snapshot.analytics.totalPnlUsd)} />
            <Row label="Max drawdown" value={`${snapshot.analytics.maxDrawdownPct}%`} />
            <Row label="Sharpe proxy" value={String(snapshot.analytics.sharpeProxy)} />
            <Row label="Capital efficiency" value={String(snapshot.analytics.capitalEfficiencyScore)} />
            <Row label="Exposure heat" value={String(snapshot.analytics.exposureHeat)} />
            <Row label="Risk-adj return" value={String(snapshot.analytics.riskAdjustedReturn)} />
          </section>
        )}

        {activeTab === "collateral" && (
          <section className="space-y-0.5">
            <Row label="Available collateral" value={fmtUsd(snapshot.collateral.availableCollateralUsd)} />
            <Row label="Utilization" value={`${snapshot.collateral.utilizationPct}%`} />
            <Row label="Margin health" value={String(snapshot.collateral.marginHealthScore)} />
            <Row label="Borrowing exposure" value={fmtUsd(snapshot.collateral.borrowingExposureUsd)} />
            <Row label="Funding cost" value={`${snapshot.collateral.fundingCostBps} bps`} />
            <Row label="Liq proximity" value={`${snapshot.collateral.liquidationProximityPct}%`} tone={sev(snapshot.risk.riskTier)} />
            <Row label="Cross-margin dep" value={`${snapshot.collateral.crossMarginDependency}%`} />
          </section>
        )}

        {activeTab === "cross" && (
          <section>
            {snapshot.crossVenue.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No cross-venue rows</p>
            ) : (
              snapshot.crossVenue.map((v) => (
                <div key={`${v.venue}-${v.asset}`} className="border-b border-slate-800 py-0.5">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                    {String(v.venue)} · {v.asset}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "ml-1", sev(v.riskBand))}>
                    {v.pctTotal}% · {fmtUsd(v.notionalUsd)} · {v.riskBand}
                  </span>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "alerts" && (
          <section>
            {snapshot.alerts.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textUp)}>No active portfolio risk alerts</p>
            ) : (
              snapshot.alerts.map((a) => (
                <div key={a.id} className="border-b border-slate-800 py-0.5">
                  <span className={cn(TERMINAL_TYPO.micro, sev(a.severity))}>{a.headline}</span>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{a.detail}</p>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "history" && (
          <section>
            {snapshot.history.slice(-12).map((h) => (
              <div key={h.timestamp} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  AUM {fmtUsd(h.accountValueUsd)} · lev {h.leverageRatio}x · risk {h.riskScore}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "modes" && (
          <section className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "block w-full border border-slate-800 px-1 py-0.5 text-left",
                  snapshot.activeMode === m.id ? "border-amber-700/60 bg-amber-950/20" : "hover:bg-slate-900/50",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-amber-300")}>{m.label}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
