"use client";

import { LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import {
  useDerivativesDeskStore,
  type DerivativesDeskTab,
} from "@/store/useDerivativesDeskStore";
import type { DerivativesDashboardModeId } from "@/types/derivatives-intelligence";

const TABS: { id: DerivativesDeskTab; label: string }[] = [
  { id: "vol", label: "VOL" },
  { id: "options", label: "OPTIONS" },
  { id: "gamma", label: "GAMMA" },
  { id: "funding", label: "FUNDING" },
  { id: "state", label: "STATE" },
  { id: "cross", label: "CROSS" },
  { id: "chain", label: "CHAIN" },
  { id: "alerts", label: "ALERTS" },
  { id: "modes", label: "MODES" },
];

function sev(s: string): string {
  if (s === "critical" || s === "stress") return terminalSkin.textDown;
  if (s === "watch" || s === "expansion" || s === "elevated") return terminalSkin.textWarn;
  return terminalSkin.textUp;
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
    <div
      className="flex justify-between border-b border-slate-800/80 py-0.5"
      data-funding-region={region}
    >
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function DerivativesDeskConsole() {
  const snapshot = useDerivativesDeskStore((s) => s.snapshot);
  const activeTab = useDerivativesDeskStore((s) => s.activeTab);
  const setActiveTab = useDerivativesDeskStore((s) => s.setActiveTab);
  const setActiveMode = useDerivativesDeskStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting derivatives desk…</p>
      </div>
    );
  }

  const applyMode = (id: DerivativesDashboardModeId) => {
    DerivativesIntelligenceOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  return (
    <div data-funding-panel="derivdesk" className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <LineChart className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>DERIVATIVES DESK</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · {snapshot.marketState.regime.replace(/_/g, " ").toUpperCase()} · SCORE{" "}
          {snapshot.derivativesScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.optionsRows} opts
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
              activeTab === t.id ? "text-violet-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "vol" && (
          <section className="space-y-0.5">
            <Row label="ATM IV" value={`${snapshot.volatility.impliedVolAtm}%`} />
            <Row label="Realized vol" value={`${snapshot.volatility.realizedVol}%`} />
            <Row label="Vol spread" value={`${snapshot.volatility.volSpread}`} tone={sev(snapshot.volatility.regime)} />
            <Row label="Regime" value={snapshot.volatility.regime.toUpperCase()} tone={sev(snapshot.volatility.regime)} />
            <Row label="Term slope" value={String(snapshot.volatility.termStructureSlope)} />
            <Row label="25Δ skew" value={String(snapshot.volatility.skew25d)} />
            <Row label="Smile curvature" value={String(snapshot.volatility.smileCurvature)} />
            <Row label="Compression" value={String(snapshot.volatility.compressionScore)} />
          </section>
        )}

        {activeTab === "options" && (
          <section className="space-y-0.5">
            <Row label="Put/call ratio" value={String(snapshot.options.putCallRatio)} />
            <Row label="Max pain" value={String(snapshot.options.maxPainStrike)} />
            <Row label="OI concentration" value={String(snapshot.options.oiConcentrationScore)} />
            <Row label="IV surface pts" value={String(snapshot.options.ivSurfacePoints)} />
            {snapshot.options.strikeLadder.slice(0, 8).map((s) => (
              <div key={s.strike} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{s.strike}</span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  C {s.callOi} · P {s.putOi}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "gamma" && (
          <section className="space-y-0.5">
            <Row label="Net gamma" value={String(snapshot.gamma.netGammaExposure)} />
            <Row label="Dealer bias" value={snapshot.gamma.dealerGammaBias.replace(/_/g, " ")} />
            <Row label="Squeeze risk" value={String(snapshot.gamma.squeezeRiskScore)} tone={sev(snapshot.gamma.squeezeRiskScore >= 70 ? "critical" : "watch")} />
            <Row label="Expiry pressure" value={String(snapshot.gamma.expiryPressureScore)} />
            <Row label="Pin strike" value={snapshot.gamma.pinStrike != null ? String(snapshot.gamma.pinStrike) : "—"} />
            {snapshot.gamma.supportResistance.map((z) => (
              <Row key={z.price} label={`Level ${z.price}`} value={`str ${z.strength}`} />
            ))}
          </section>
        )}

        {activeTab === "funding" && (
          <section className="space-y-0.5" data-funding-region="panel">
            <Row region="rate" label="HL funding" value={`${snapshot.funding.hlFundingBps} bps`} />
            <Row label="Cross-venue avg" value={`${snapshot.funding.crossVenueFundingBps} bps`} />
            <Row label="Divergence" value={`${snapshot.funding.fundingDivergenceBps} bps`} />
            <Row region="oi" label="OI growth" value={`${snapshot.funding.oiGrowthPct}%`} />
            <Row label="Leverage conc" value={String(snapshot.funding.leverageConcentration)} />
            <Row region="crowding" label="Crowding" value={snapshot.funding.crowdingBias.toUpperCase()} />
            <Row
              region="liq"
              label="Liq pressure"
              value={String(snapshot.funding.liquidationPressureScore)}
              tone={sev(snapshot.funding.liquidationPressureScore >= 70 ? "critical" : "watch")}
            />
          </section>
        )}

        {activeTab === "state" && (
          <section className="space-y-0.5">
            <Row label="Market regime" value={snapshot.marketState.regime.replace(/_/g, " ")} />
            <Row label="Leverage saturation" value={String(snapshot.marketState.leverageSaturation)} />
            <Row label="Vol regime" value={snapshot.marketState.volatilityRegime} tone={sev(snapshot.marketState.volatilityRegime)} />
            <Row label="Options pressure" value={String(snapshot.marketState.optionsPressure)} />
            <Row label="Dealer" value={snapshot.marketState.dealerPositioning} />
            <Row label="Funding stress" value={String(snapshot.marketState.fundingStress)} />
            <Row label="Fragility" value={String(snapshot.marketState.fragilityScore)} tone={sev(snapshot.marketState.fragilityScore >= 70 ? "critical" : "watch")} />
          </section>
        )}

        {activeTab === "cross" && (
          <section className="space-y-0.5">
            <Row label="Spot/perp basis" value={`${snapshot.crossMarket.spotPerpBasisBps} bps`} />
            <Row label="Vol/price corr" value={String(snapshot.crossMarket.volPriceCorrelation)} />
            <Row label="Leverage/liq gap" value={String(snapshot.crossMarket.leverageLiquidityGap)} />
            <Row label="Options/spot skew" value={String(snapshot.crossMarket.optionsSpotSkew)} />
            <Row label="Fragmentation" value={String(snapshot.crossMarket.crossVenueFragmentation)} />
          </section>
        )}

        {activeTab === "chain" && (
          <section>
            {snapshot.chain.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Ingesting options chain…</p>
            ) : (
              snapshot.chain.slice(0, 14).map((r) => (
                <div key={r.instrument} className="border-b border-slate-800 py-0.5">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                    {r.venue} · {r.side.toUpperCase()} {r.strike}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                    IV {r.markIv.toFixed(1)} · Δ {r.delta.toFixed(2)} · OI {r.openInterest}
                  </span>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "alerts" && (
          <section>
            {snapshot.alerts.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textUp)}>No active derivatives alerts</p>
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

        {activeTab === "modes" && (
          <section className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "block w-full border border-slate-800 px-1 py-0.5 text-left",
                  snapshot.activeMode === m.id ? "border-violet-700/60 bg-violet-950/20" : "hover:bg-slate-900/50",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-violet-300")}>{m.label}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
