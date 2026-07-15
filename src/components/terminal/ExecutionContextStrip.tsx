"use client";

import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { visibleTradingTaskIds } from "@/lib/operator-mode/operatorModePro";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Information-aware execution context — not trade advice. */
export function ExecutionContextStrip() {
  const book = useTerminalStore((s) => s.book);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const stress = useMarketAtmosphereStore((s) => s.stress);
  const regime = useMarketAtmosphereStore((s) => s.regime.regime);
  const slippage = useExecutionIntelligenceStore((s) => s.slippage);
  const execConf = useExecutionIntelligenceStore((s) => s.executionConfidence);
  const operatorActive = useOperatorModeStore((s) => s.active);
  const proCaps = useOperatorModeStore((s) => s.proCaps);
  const trading = useOperatorModeStore((s) => s.today.trading);
  const deskMode = useDeskExecutionStore((s) => s.mode);

  const spreadBps = book?.spreadBps ?? slippage.spreadBps;
  const spreadWarn = spreadBps > 12;
  const slipWarn = slippage.riskTier === "high" || slippage.riskTier === "critical";

  const tradingIds = visibleTradingTaskIds(proCaps);
  const checksDone = tradingIds.filter((id) => trading[id]).length;
  const checksTotal = tradingIds.length;

  const marketLabel = selectedAsset?.market === "spot" ? "SPOT" : "PERP";

  return (
    <div data-trade-region="exec-context" className="space-y-px">
      <div className={cn(terminalSkin.borderB, "grid grid-cols-2 gap-px bg-slate-900")}>
        <Cell label="MODE" value={deskMode.toUpperCase()} warn={deskMode === "live"} region="exec-mode" />
        <Cell label="MARKET" value={marketLabel} warn={marketLabel === "SPOT"} region="exec-market" />
        <Cell label="SPREAD" value={`${spreadBps.toFixed(1)} bps`} warn={spreadWarn} region="exec-spread" />
        <Cell label="SLIP TIER" value={slippage.riskTier.toUpperCase()} warn={slipWarn} region="exec-slip-tier" />
        <Cell label="REGIME" value={regime.toUpperCase()} region="exec-regime" />
        <Cell label="STRESS" value={stress.score.toFixed(0)} warn={stress.score > 65} region="exec-stress" />
        <Cell label="EXEC PIPE" value={`${execConf}%`} warn={execConf < 45} region="exec-pipe" />
      </div>
      {operatorActive && (proCaps.orderBookChecks || proCaps.executionGuidance) && checksTotal > 0 ? (
        <div className={cn(terminalSkin.borderB, "bg-slate-950 px-1 py-0.5")} data-trade-region="exec-operator">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>OPERATOR CHECKS </span>
          <span
            className={cn(
              TERMINAL_TYPO.dataSm,
              checksDone >= checksTotal ? terminalSkin.textUp : terminalSkin.textWarn,
            )}
          >
            {checksDone}/{checksTotal}
          </span>
          <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
            {checksDone >= checksTotal ? "cleared" : "from live book"}
          </span>
        </div>
      ) : null}
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
