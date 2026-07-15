"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin, formatTapeTime } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { useSettlementLedgerStore } from "@/store/useSettlementLedgerStore";

type LedgerTab = "ledger" | "breaks" | "summary";

const TABS: { id: LedgerTab; label: string }[] = [
  { id: "summary", label: "SUMMARY" },
  { id: "ledger", label: "LEDGER" },
  { id: "breaks", label: "BREAKS" },
];

function statusTone(status: string): string {
  if (status === "break") return terminalSkin.textDown;
  if (status === "watch") return terminalSkin.textWarn;
  return terminalSkin.textUp;
}

export function SettlementLedgerConsole() {
  const snapshot = useSettlementLedgerStore((s) => s.snapshot);
  const [tab, setTab] = useState<LedgerTab>("summary");

  const fmtUsd = (n: number) =>
    n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

  return (
    <div className="flex h-full flex-col overflow-hidden" data-settlement-panel="settlementledger">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Scale className="h-3 w-3 text-sky-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-sky-300")}>SETTLEMENT LEDGER</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Murex/Calypso-style fill → position reconciliation
        </span>
        {snapshot ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-auto", statusTone(snapshot.status))}>
            {snapshot.status.toUpperCase()} · {snapshot.healthScore}%
          </span>
        ) : null}
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "px-1.5 py-0.5",
              tab === t.id ? "text-sky-300" : "text-slate-600 hover:text-slate-400",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
      >
        {!snapshot ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Reconciling execution stream…</p>
        ) : null}

        {snapshot && tab === "summary" ? (
          <section className="space-y-0.5">
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Recon status</span>
              <span className={cn(TERMINAL_TYPO.micro, statusTone(snapshot.status))}>
                {snapshot.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Health</span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{snapshot.healthScore}%</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Fills / positions</span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                {snapshot.fillCount} / {snapshot.positionCount}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Open orders</span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{snapshot.openOrderCount}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Fill notional</span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
                {fmtUsd(snapshot.totalFillNotionalUsd)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Fees</span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{fmtUsd(snapshot.totalFeesUsd)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Realized P&L (fills)</span>
              <span
                className={cn(
                  TERMINAL_TYPO.micro,
                  snapshot.totalRealizedPnlUsd >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
                )}
              >
                {fmtUsd(snapshot.totalRealizedPnlUsd)}
              </span>
            </div>
          </section>
        ) : null}

        {snapshot && tab === "breaks" ? (
          <section>
            {snapshot.breaks.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textUp)}>No reconciliation breaks</p>
            ) : (
              snapshot.breaks.map((b) => (
                <div key={b.id} className="mb-1 border border-slate-800/80 p-1">
                  <p
                    className={cn(
                      TERMINAL_TYPO.micro,
                      b.severity === "critical" ? terminalSkin.textDown : terminalSkin.textWarn,
                    )}
                  >
                    {b.headline}
                  </p>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{b.detail}</p>
                </div>
              ))
            )}
          </section>
        ) : null}

        {snapshot && tab === "ledger" ? (
          <table className={cn(TERMINAL_TYPO.micro, "w-full text-left")}>
            <thead>
              <tr className="text-slate-600">
                <th>TIME</th>
                <th>KIND</th>
                <th>COIN</th>
                <th>USD</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.ledger.map((e) => (
                <tr key={e.id} className="border-t border-slate-900">
                  <td className="text-slate-500">{formatTapeTime(e.at)}</td>
                  <td className="text-slate-400">{e.kind}</td>
                  <td className="text-slate-300">{e.coin}</td>
                  <td className="tabular-nums text-slate-400">{fmtUsd(e.amountUsd)}</td>
                  <td
                    className={cn(
                      e.status === "break"
                        ? terminalSkin.textDown
                        : e.status === "pending"
                          ? terminalSkin.textWarn
                          : "text-slate-500",
                    )}
                  >
                    {e.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
