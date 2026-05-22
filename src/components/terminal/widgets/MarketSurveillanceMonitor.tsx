"use client";

import { useMemo } from "react";
import { Activity, Radio, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import { AssetWorkspaceOrchestrator } from "@/lib/workflow/AssetWorkspaceOrchestrator";
import type { WatchlistIntelRow } from "@/types/trader-workflow";

function isIntelRow(row: WatchlistIntelRow | { coin: string }): row is WatchlistIntelRow {
  return "volatilityRank" in row && typeof row.volatilityRank === "number";
}

function MoverCell({
  symbol,
  changePct,
  onSelect,
}: {
  symbol: string;
  changePct: number;
  onSelect: () => void;
}) {
  const up = changePct >= 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        terminalSkin.row,
        "min-w-[4.5rem] flex-col items-center px-1 py-0.5 hover:bg-slate-900",
      )}
    >
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{symbol}</span>
      <span
        className={cn(
          TERMINAL_TYPO.micro,
          "tabular-nums",
          up ? terminalSkin.textUp : terminalSkin.textDown,
        )}
      >
        {changePct >= 0 ? "+" : ""}
        {changePct.toFixed(2)}%
      </span>
    </button>
  );
}

export function MarketSurveillanceMonitor() {
  const surveillance = useInformationDiscoveryStore((s) => s.surveillance);
  const watchlist = useInformationDiscoveryStore((s) => s.watchlist);
  const watchlistIntel = useTraderWorkflowStore((s) => s.watchlistIntel);
  const timeline = useInformationDiscoveryStore((s) => s.assetTimeline);
  const pipelineActive = useInformationDiscoveryStore((s) => s.pipelineActive);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const coin = useTerminalStore((s) => s.selectedAsset?.symbol ?? s.selectedCoin);

  const heatIntensity = useMemo(() => {
    if (!surveillance) return 0;
    return Math.min(100, surveillance.stressScore * 0.6 + Math.abs(surveillance.narrativeAcceleration) * 0.4);
  }, [surveillance]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header
        className={cn(
          terminalSkin.borderB,
          "flex shrink-0 items-center gap-2 px-1 py-0.5",
        )}
      >
        <Radio className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>MARKET SURVEILLANCE</span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            pipelineActive ? terminalSkin.textUp : "text-slate-600",
          )}
        >
          {pipelineActive ? "LIVE" : "—"}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          REG {surveillance?.regime ?? "—"}
        </span>
      </header>

      <div
        className="h-1 shrink-0"
        style={{
          background: `linear-gradient(90deg, #0a1628 ${100 - heatIntensity}%, #00ff88 ${heatIntensity}%)`,
        }}
        title="Composite activity heat"
      />

      <section className={cn(terminalSkin.borderB, "shrink-0 p-1")}>
        <div className="mb-0.5 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-slate-500" />
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>MOVERS</span>
        </div>
        <div className="flex gap-0.5 overflow-x-auto">
          {surveillance?.movers.slice(0, 10).map((m) => (
            <MoverCell
              key={m.coin}
              symbol={m.symbol}
              changePct={m.changePct}
              onSelect={() => selectAssetByCoin(m.coin, "surveillance")}
            />
          ))}
        </div>
      </section>

      <section className={cn(terminalSkin.borderB, "shrink-0 p-1")}>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>WATCHLIST INTEL</span>
        <div className="mt-0.5 max-h-28 overflow-y-auto">
          {(watchlistIntel.length
            ? watchlistIntel
            : watchlist.map((w) => ({ coin: w.coin }))
          ).map((row) => {
              const intel = isIntelRow(row) ? row : null;
              const c = row.coin;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => AssetWorkspaceOrchestrator.open(c, { source: "watchlist-intel" })}
                  className={cn(
                    terminalSkin.row,
                    "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
                    c === coin && "border-l border-cyan-700",
                  )}
                >
                  <div className="flex w-full justify-between gap-1">
                    <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{c}</span>
                    {intel ? (
                      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                        VOL {intel.volatilityRank} · LIQ {intel.liquidityRank} · EX{" "}
                        {intel.execReadiness}
                      </span>
                    ) : null}
                  </div>
                  {intel ? (
                    <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                      {intel.summary}
                    </span>
                  ) : null}
                </button>
              );
            },
          )}
        </div>
      </section>

      <section className={cn(terminalSkin.borderB, "min-h-0 flex-1 overflow-y-auto p-1")}>
        <div className="mb-0.5 flex items-center gap-1">
          <Activity className="h-3 w-3 text-amber-500" />
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>WHAT MATTERS NOW</span>
        </div>
        {surveillance?.headlines.map((h) => (
          <button
            key={h.id}
            type="button"
            className={cn(
              terminalSkin.row,
              "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
            )}
            onClick={() => h.coin && selectAssetByCoin(h.coin, "surveillance")}
          >
            <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>{h.headline}</span>
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{h.detail}</span>
          </button>
        ))}
      </section>

      <section className="shrink-0 p-1">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          TIMELINE · {coin}
        </span>
        <div className="mt-0.5 max-h-24 overflow-y-auto">
          {timeline.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No events indexed.</p>
          ) : (
            timeline.map((e) => (
              <div key={e.id} className="border-l border-slate-800 py-0.5 pl-1">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {e.channel}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{e.headline}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}


