"use client";

import { RotateCcw } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { paperBookSummary, unrealizedPnl } from "@/lib/execution/paperPnL";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { formatTapeTime } from "@/lib/theme";

export function PaperBlotterConsole() {
  const mode = useDeskExecutionStore((s) => s.mode);
  const positions = useDeskExecutionStore((s) => s.paperPositions);
  const fills = useDeskExecutionStore((s) => s.paperFills);
  const resetPaperBook = useDeskExecutionStore((s) => s.resetPaperBook);
  const book = useHyperliquidStore((s) => s.book);
  const selectedCoin = useHyperliquidStore((s) => s.selectedCoin);

  const marks: Record<string, number> = {};
  if (book?.coin && book.mid) marks[book.coin] = book.mid;
  for (const p of positions) {
    if (p.coin === book?.coin && book?.mid) marks[p.coin] = book.mid;
  }

  const { unrealized, openCount } = paperBookSummary(positions, marks);

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      data-paperblotter-panel="paperblotter"
    >
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>PAPER BLOTTER</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {mode.toUpperCase()} · {fills.length} fills · {openCount} open
        </span>
        <button
          type="button"
          onClick={resetPaperBook}
          className={cn(TERMINAL_TYPO.micro, "ml-auto flex items-center gap-0.5 text-slate-500 hover:text-slate-300")}
          title="Clear paper session"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          RESET
        </button>
      </header>

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
        data-paperblotter-region="tape"
      >
        <div
          className={cn(terminalSkin.borderB, "mb-1 grid grid-cols-2 gap-px bg-slate-900")}
          data-paperblotter-region="summary"
        >
          <div className="bg-slate-950 px-1 py-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>UNREAL P&amp;L</span>
            <p
              className={cn(
                TERMINAL_TYPO.dataSm,
                unrealized >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
              )}
            >
              {openCount ? `${unrealized >= 0 ? "+" : ""}${unrealized.toFixed(2)}` : "—"}
            </p>
          </div>
          <div className="bg-slate-950 px-1 py-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>ACTIVE COIN</span>
            <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{selectedCoin}</p>
          </div>
        </div>

        {positions.length === 0 && fills.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            No paper fills yet. DESK → PAPER, then place an order on Trade Ticket.
          </p>
        ) : null}

        {positions.length > 0 ? (
          <section className="mb-2">
            <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>OPEN POSITIONS</p>
            {positions.map((p) => {
              const mark = marks[p.coin];
              const pnl = mark ? unrealizedPnl(p, mark) : null;
              return (
                <div key={p.coin} className="border-b border-slate-800/80 py-1">
                  <div className="flex items-center gap-1">
                    <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
                      {p.coin}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                      {p.size > 0 ? "LONG" : "SHORT"} {formatSize(Math.abs(p.size))}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
                      @ {formatPrice(p.avgPx)}
                    </span>
                    {pnl != null ? (
                      <span
                        className={cn(
                          TERMINAL_TYPO.micro,
                          "w-14 text-right tabular-nums",
                          pnl >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
                        )}
                      >
                        {pnl >= 0 ? "+" : ""}
                        {pnl.toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {fills.length > 0 ? (
          <section>
            <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>FILL TAPE</p>
            {fills.map((f) => (
              <div key={f.id} className="flex items-center gap-1 border-b border-slate-800/60 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                  {formatTapeTime(f.at).slice(0, 8)}
                </span>
                <span className={cn(TERMINAL_TYPO.dataSm, "w-10", terminalSkin.textUp)}>{f.coin}</span>
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    f.isBuy ? terminalSkin.textUp : terminalSkin.textDown,
                  )}
                >
                  {f.isBuy ? "BUY" : "SELL"}
                </span>
                <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-400")}>
                  {formatSize(f.size)} @ {formatPrice(f.px)}
                </span>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
