"use client";

import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Information-aware execution context — not trade advice. */
export function ExecutionContextStrip() {
  const book = useTerminalStore((s) => s.book);
  const stress = useMarketAtmosphereStore((s) => s.stress);
  const regime = useMarketAtmosphereStore((s) => s.regime.regime);
  const slippage = useExecutionIntelligenceStore((s) => s.slippage);
  const execConf = useExecutionIntelligenceStore((s) => s.executionConfidence);

  const spreadBps = book?.spreadBps ?? slippage.spreadBps;
  const spreadWarn = spreadBps > 12;
  const slipWarn = slippage.riskTier === "high" || slippage.riskTier === "critical";

  return (
    <div className={cn(terminalSkin.borderB, "grid grid-cols-2 gap-px bg-slate-900")} data-trade-region="exec-context">
      <Cell label="SPREAD" value={`${spreadBps.toFixed(1)} bps`} warn={spreadWarn} region="exec-spread" />
      <Cell label="SLIP TIER" value={slippage.riskTier.toUpperCase()} warn={slipWarn} region="exec-slip-tier" />
      <Cell label="REGIME" value={regime.toUpperCase()} region="exec-regime" />
      <Cell label="STRESS" value={stress.score.toFixed(0)} warn={stress.score > 65} region="exec-stress" />
      <Cell label="VELOCITY" value={`${stress.velocityRatio.toFixed(2)}x`} region="exec-velocity" />
      <Cell label="EXEC PIPE" value={`${execConf}%`} warn={execConf < 45} region="exec-pipe" />
    </div>
  );
}

function Cell({
  label,
  value,
  warn,
  region,
}: {
  label: string;
  value: string;
  warn?: boolean;
  region?: string;
}) {
  return (
    <div className="bg-slate-950 px-1 py-0.5" data-trade-region={region}>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <p
        className={cn(
          TERMINAL_TYPO.dataSm,
          "tabular-nums",
          warn ? terminalSkin.textWarn : "text-slate-300",
        )}
      >
        {value}
      </p>
    </div>
  );
}
