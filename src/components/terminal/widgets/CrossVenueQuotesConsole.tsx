"use client";

import { useMemo } from "react";
import { Globe2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { CrossExchangeIntelligenceEngine } from "@/lib/multi-exchange/CrossExchangeIntelligenceEngine";
import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { useDataIngestionStore } from "@/store/useDataIngestionStore";
import { useTerminalStore } from "@/store/terminalStore";

/** ICE/Refinitiv-style cross-venue top-of-book and basis vs Hyperliquid. */
export function CrossVenueQuotesConsole() {
  const ingestSnap = useDataIngestionStore((s) => s.snapshot);
  const coin = useTerminalStore((s) => s.selectedCoin);
  const book = useTerminalStore((s) => s.book);
  const hlMid = book?.mid ?? null;

  const quotes = useMemo(
    () => multiExchangeMarketState.forAsset(coin),
    [ingestSnap?.backbone.updatedAt, coin],
  );

  const signals = useMemo(
    () => CrossExchangeIntelligenceEngine.analyze(coin, hlMid),
    [coin, hlMid, quotes],
  );

  const hlQuote = hlMid
    ? {
        exchange: "hyperliquid" as const,
        mid: hlMid,
        spreadBps: book?.spreadBps ?? null,
        status: "live" as const,
      }
    : null;

  return (
    <div className="flex h-full flex-col overflow-hidden" data-crossvenue-panel="crossvenue">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Globe2 className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>CROSS-VENUE</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          ICE-style quotes · {coin} · {quotes.length} venues
        </span>
      </header>

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
      >
        {hlQuote ? (
          <div className={cn(TERMINAL_TYPO.micro, "mb-2 border border-cyan-900/40 bg-cyan-950/20 p-1")}>
            <span className="text-cyan-400">HL MID </span>
            <span className="tabular-nums text-slate-200">{formatPrice(hlQuote.mid)}</span>
            {hlQuote.spreadBps != null ? (
              <span className="ml-2 text-slate-500">spread {hlQuote.spreadBps.toFixed(1)} bps</span>
            ) : null}
          </div>
        ) : null}

        <table className={cn(TERMINAL_TYPO.micro, "mb-2 w-full text-left")}>
          <thead>
            <tr className="text-slate-600">
              <th>VENUE</th>
              <th>MID</th>
              <th>SPREAD</th>
              <th>VS HL</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const vsHl =
                hlMid && q.mid ? (((q.mid - hlMid) / hlMid) * 10_000).toFixed(1) : "—";
              return (
                <tr key={q.exchange} className="border-t border-slate-900">
                  <td className="uppercase text-slate-300">{q.exchange}</td>
                  <td className="tabular-nums text-slate-400">
                    {q.mid != null ? formatPrice(q.mid) : "—"}
                  </td>
                  <td className="tabular-nums text-slate-500">
                    {q.spreadBps != null ? `${q.spreadBps.toFixed(1)} bps` : "—"}
                  </td>
                  <td
                    className={cn(
                      "tabular-nums",
                      vsHl !== "—" && Math.abs(Number(vsHl)) >= 18
                        ? terminalSkin.textWarn
                        : "text-slate-500",
                    )}
                  >
                    {vsHl !== "—" ? `${vsHl} bps` : "—"}
                  </td>
                  <td className={q.status === "live" ? terminalSkin.textUp : "text-slate-600"}>
                    {q.status.toUpperCase()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {signals.length > 0 ? (
          <section>
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-amber-400")}>BASIS SIGNALS</p>
            {signals.map((s) => (
              <div key={s.id} className="border-b border-slate-900 py-0.5">
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    s.severity === "critical"
                      ? terminalSkin.textDown
                      : s.severity === "watch"
                        ? terminalSkin.textWarn
                        : "text-slate-400",
                  )}
                >
                  {s.headline}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{s.detail}</p>
              </div>
            ))}
          </section>
        ) : (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            Polling Binance, OKX, Bybit, Coinbase every few seconds…
          </p>
        )}
      </div>
    </div>
  );
}
