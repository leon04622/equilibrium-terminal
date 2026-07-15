"use client";

import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { useInstrumentMasterStore } from "@/store/useInstrumentMasterStore";
import { InstrumentMasterEngine } from "@/lib/institutional/InstrumentMasterEngine";

export function InstrumentMasterConsole() {
  const snapshot = useInstrumentMasterStore((s) => s.snapshot);
  const loading = useInstrumentMasterStore((s) => s.loading);
  const query = useInstrumentMasterStore((s) => s.query);
  const setQuery = useInstrumentMasterStore((s) => s.setQuery);

  const q = query.trim().toLowerCase();
  const rows = (snapshot?.instruments ?? []).filter(
    (i) =>
      !q ||
      i.symbol.toLowerCase().includes(q) ||
      i.coin.toLowerCase().includes(q) ||
      i.market.includes(q),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden" data-instrumentmaster-panel="instrumentmaster">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap items-center gap-2 px-1 py-0.5")}>
        <Database className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>INSTRUMENT MASTER</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          ICE/Refinitiv-style reference · {snapshot?.perpCount ?? 0} perp · {snapshot?.spotCount ?? 0} spot
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbol…"
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto w-28 border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-300",
          )}
        />
      </header>

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
      >
        {loading && !snapshot ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Loading instrument universe…</p>
        ) : (
          <table className={cn(TERMINAL_TYPO.micro, "w-full text-left")}>
            <thead>
              <tr className="text-slate-600">
                <th>SYMBOL</th>
                <th>MKT</th>
                <th>IDX</th>
                <th>LEV</th>
                <th>DEC</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map((i) => (
                <tr key={i.id} className="border-t border-slate-900">
                  <td className="text-slate-200">{i.symbol}</td>
                  <td className="text-slate-500">{i.market.toUpperCase()}</td>
                  <td className="tabular-nums text-slate-500">{i.assetIndex}</td>
                  <td className="tabular-nums text-slate-400">{i.maxLeverage}x</td>
                  <td className="tabular-nums text-slate-500">{i.szDecimals}</td>
                  <td className={i.isDelisted ? terminalSkin.textDown : terminalSkin.textUp}>
                    {i.isDelisted ? "DELISTED" : i.onlyIsolated ? "ISOLATED" : "ACTIVE"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {snapshot ? (
          <button
            type="button"
            onClick={() => void InstrumentMasterEngine.snapshot(true).then((s) => useInstrumentMasterStore.getState().setSnapshot(s))}
            className={cn(TERMINAL_TYPO.micro, "mt-2 text-slate-500 hover:text-slate-300")}
          >
            Force refresh reference data
          </button>
        ) : null}
      </div>
    </div>
  );
}
