"use client";

import { Bell, BellOff, RotateCcw, Shield } from "lucide-react";
import { TerminalSelect } from "@/components/ui/TerminalSelect";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { useInstitutionalRiskStore } from "@/store/useInstitutionalRiskStore";
import type { VaRHorizonDays } from "@/types/institutional-capabilities";

function NumInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-2 text-slate-400")}>
      <span className="min-w-[8rem] truncate">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 border border-slate-800 bg-slate-950 px-1 tabular-nums text-slate-300"
      />
      {suffix ? <span className="text-slate-600">{suffix}</span> : null}
    </label>
  );
}

export function RiskLimitsPanel() {
  const limits = useInstitutionalRiskStore((s) => s.limits);
  const varLimits = useInstitutionalRiskStore((s) => s.varLimits);
  const riskAlertsArmed = useInstitutionalRiskStore((s) => s.riskAlertsArmed);
  const setLimits = useInstitutionalRiskStore((s) => s.setLimits);
  const setVarLimits = useInstitutionalRiskStore((s) => s.setVarLimits);
  const setRiskAlertsArmed = useInstitutionalRiskStore((s) => s.setRiskAlertsArmed);
  const resetLimits = useInstitutionalRiskStore((s) => s.resetLimits);
  const resetVarLimits = useInstitutionalRiskStore((s) => s.resetVarLimits);

  return (
    <section className="space-y-2" data-risk-limits-panel="limits">
      <header className="flex flex-wrap items-center gap-2">
        <Shield className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>RISK GOVERNANCE</span>
        <button
          type="button"
          onClick={() => setRiskAlertsArmed(!riskAlertsArmed)}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto flex items-center gap-0.5",
            riskAlertsArmed ? "text-cyan-300" : "text-slate-600",
          )}
          title={riskAlertsArmed ? "Risk alerts armed" : "Risk alerts muted"}
        >
          {riskAlertsArmed ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          ALERTS
        </button>
      </header>

      <div className={cn(terminalSkin.borderB, "space-y-1 pb-2")}>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>PRE-TRADE LIMITS (Trade ticket)</p>
        <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-2 text-slate-400")}>
          <input
            type="checkbox"
            checked={limits.enabled}
            onChange={(e) => setLimits({ enabled: e.target.checked })}
            className="accent-cyan-500"
          />
          Enforce pre-trade checks
        </label>
        <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-2 text-slate-400")}>
          <input
            type="checkbox"
            checked={limits.blockOnBreach}
            onChange={(e) => setLimits({ blockOnBreach: e.target.checked })}
            className="accent-cyan-500"
          />
          Block orders on breach
        </label>
        <NumInput
          label="Max leverage"
          value={limits.maxLeverage}
          onChange={(v) => setLimits({ maxLeverage: v })}
          min={1}
          max={100}
          suffix="x"
        />
        <NumInput
          label="Max margin util"
          value={limits.maxMarginUtilPct}
          onChange={(v) => setLimits({ maxMarginUtilPct: v })}
          min={10}
          max={100}
          suffix="%"
        />
        <NumInput
          label="Max notional / coin"
          value={limits.maxNotionalPerCoinUsd}
          onChange={(v) => setLimits({ maxNotionalPerCoinUsd: v })}
          min={1000}
          max={10_000_000}
          step={1000}
          suffix="USD"
        />
        <NumInput
          label="Max concentration"
          value={limits.maxConcentrationPct}
          onChange={(v) => setLimits({ maxConcentrationPct: v })}
          min={5}
          max={100}
          suffix="%"
        />
        <button
          type="button"
          onClick={resetLimits}
          className={cn(TERMINAL_TYPO.micro, "flex items-center gap-0.5 text-slate-600 hover:text-cyan-300")}
        >
          <RotateCcw className="h-3 w-3" />
          Reset pre-trade defaults
        </button>
      </div>

      <div className="space-y-1">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>VaR LIMITS (Alerts panel)</p>
        <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-2 text-slate-400")}>
          <input
            type="checkbox"
            checked={varLimits.enabled}
            onChange={(e) => setVarLimits({ enabled: e.target.checked })}
            className="accent-cyan-500"
          />
          Alert on VaR breach
        </label>
        <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-2 text-slate-400")}>
          <span className="min-w-[8rem]">Alert horizon</span>
          <TerminalSelect
            value={String(varLimits.alertHorizonDays)}
            onChange={(v) => setVarLimits({ alertHorizonDays: Number(v) as VaRHorizonDays })}
            options={[
              { value: "1", label: "1 day" },
              { value: "5", label: "5 day" },
              { value: "10", label: "10 day" },
            ]}
          />
        </label>
        <NumInput
          label="Watch threshold"
          value={varLimits.maxVar95Pct}
          onChange={(v) => setVarLimits({ maxVar95Pct: v })}
          min={1}
          max={50}
          step={0.5}
          suffix="% VaR95"
        />
        <NumInput
          label="Critical threshold"
          value={varLimits.criticalVar95Pct}
          onChange={(v) => setVarLimits({ criticalVar95Pct: v })}
          min={varLimits.maxVar95Pct}
          max={80}
          step={0.5}
          suffix="% VaR95"
        />
        <NumInput
          label="Alert cooldown"
          value={Math.round(varLimits.alertCooldownMs / 1000)}
          onChange={(v) => setVarLimits({ alertCooldownMs: v * 1000 })}
          min={30}
          max={900}
          suffix="sec"
        />
        <button
          type="button"
          onClick={resetVarLimits}
          className={cn(TERMINAL_TYPO.micro, "flex items-center gap-0.5 text-slate-600 hover:text-cyan-300")}
        >
          <RotateCcw className="h-3 w-3" />
          Reset VaR defaults
        </button>
      </div>
    </section>
  );
}
