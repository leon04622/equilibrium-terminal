"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin, formatTapeTime } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { TradeSurveillanceEngine } from "@/lib/institutional/TradeSurveillanceEngine";
import { useTradeSurveillanceAlertStore } from "@/store/useTradeSurveillanceAlertStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { TradeSurveillanceSignalKind } from "@/types/institutional-capabilities";

function riskTone(score: number): string {
  if (score >= 70) return terminalSkin.textDown;
  if (score >= 45) return terminalSkin.textWarn;
  return terminalSkin.textUp;
}

function signalLabel(signal: TradeSurveillanceSignalKind): string {
  switch (signal) {
    case "spoof":
      return "SPOOF";
    case "wash":
      return "WASH";
    case "layering":
      return "LAYER";
    case "toxic_flow":
      return "TOXIC";
    case "sweep_cluster":
      return "SWEEPS";
  }
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between border-b border-slate-800 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, "tabular-nums", riskTone(value))}>{value}</span>
    </div>
  );
}

export function TradeSurveillanceConsole() {
  const matrixVersion = useExecutionIntelligenceStore((s) => s.matrixVersion);
  const pipelineActive = useExecutionIntelligenceStore((s) => s.pipelineActive);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin) ?? "BTC";
  const armed = useTradeSurveillanceAlertStore((s) => s.armed);
  const rules = useTradeSurveillanceAlertStore((s) => s.rules);
  const recentHits = useTradeSurveillanceAlertStore((s) => s.recentHits);
  const setArmed = useTradeSurveillanceAlertStore((s) => s.setArmed);
  const toggleRule = useTradeSurveillanceAlertStore((s) => s.toggleRule);
  const hydrate = useTradeSurveillanceAlertStore((s) => s.hydrate);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const snap = TradeSurveillanceEngine.snapshot(selectedCoin);
  void matrixVersion;

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      data-trade-surveillance-panel="tradesurveillance"
      onWheel={stopPanelWheelBubble}
    >
      <header className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap items-center gap-2 px-1 py-0.5")}>
        <ShieldAlert className="h-3 w-3 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>TRADE SURVEILLANCE</span>
        <span className={cn(TERMINAL_TYPO.micro, pipelineActive ? terminalSkin.textUp : "text-slate-600")}>
          {pipelineActive ? "LIVE" : "IDLE"}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snap.coin} · RISK {snap.compositeRisk}
        </span>
        <button
          type="button"
          onClick={() => setArmed(!armed)}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto flex items-center gap-0.5",
            armed ? "text-amber-300" : "text-slate-600 hover:text-slate-400",
          )}
          title={armed ? "Surveillance alerts armed" : "Surveillance alerts muted"}
        >
          {armed ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => setRulesOpen((v) => !v)}
          className={cn(TERMINAL_TYPO.micro, "text-slate-600 hover:text-amber-300")}
        >
          RULES ({rules.filter((r) => r.enabled).length})
        </button>
      </header>

      {rulesOpen ? (
        <div className={cn(terminalSkin.borderB, "shrink-0 space-y-1 px-1 py-1")}>
          {rules.map((rule) => (
            <label
              key={rule.id}
              className={cn(TERMINAL_TYPO.micro, "flex cursor-pointer items-center gap-2 text-slate-400")}
            >
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => toggleRule(rule.id, e.target.checked)}
                className="accent-amber-500"
              />
              <span className="min-w-0 flex-1 truncate">{rule.label}</span>
              <span className="text-slate-600">≥{rule.minScore}</span>
            </label>
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-1" onWheel={stopPanelWheelBubble}>
        <section className="mb-2">
          <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>MANIPULATION SCORES</p>
          <ScoreRow label="Spoof / quote fade" value={snap.spoofScore} />
          <ScoreRow label="Wash / churn" value={snap.washScore} />
          <ScoreRow label="Layering" value={snap.layeringScore} />
          <ScoreRow label="Toxic flow" value={snap.toxicFlowScore} />
          <ScoreRow label="Iceberg proxy" value={snap.icebergScore} />
        </section>

        <section className="mb-2">
          <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>EXECUTION CONTEXT</p>
          <ScoreRow label="Sweep count" value={snap.sweepCount} />
          <div className="flex justify-between border-b border-slate-800 py-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Slippage</span>
            <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-300")}>
              {snap.slippageBps.toFixed(1)} bps
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 py-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Spread</span>
            <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-300")}>
              {snap.spreadBps.toFixed(1)} bps
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 py-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Participants</span>
            <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-300")}>
              {snap.participantCount}
            </span>
          </div>
        </section>

        <section>
          <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>RECENT HITS</p>
          {recentHits.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No surveillance hits yet.</p>
          ) : (
            recentHits.slice(0, 8).map((hit) => (
              <div key={`${hit.at}-${hit.ruleId}`} className="border-b border-slate-800 py-0.5">
                <div className="flex items-center gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                    {formatTapeTime(hit.at).slice(0, 8)}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{hit.coin}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-amber-500/80")}>
                    {signalLabel(hit.signal)}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "ml-auto tabular-nums", riskTone(hit.score))}>
                    {hit.score}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[3.75rem] text-slate-600")}>
                  {hit.ruleLabel}
                </p>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
