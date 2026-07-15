"use client";

import { RefreshCw, X } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { formatTapeTime } from "@/lib/theme";
import { useLiveBlotterStore } from "@/store/useLiveBlotterStore";
import { LiveBlotterEngine } from "@/lib/institutional/LiveBlotterEngine";
import { useTerminalStore } from "@/store/terminalStore";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";

export function LiveBlotterConsole() {
  const snapshot = useLiveBlotterStore((s) => s.snapshot);
  const loading = useLiveBlotterStore((s) => s.loading);
  const { cancelOpenOrders, oneClickEnabled, isAuthorized } = useHyperliquidAuthContext();

  const refresh = async () => {
    const wallet = useTerminalStore.getState().walletAddress;
    useLiveBlotterStore.getState().setLoading(true);
    const next = await LiveBlotterEngine.snapshot(wallet);
    useLiveBlotterStore.getState().setSnapshot(next);
  };

  const canCancel = oneClickEnabled && isAuthorized;

  const cancelOne = async (coin: string, oid: number) => {
    if (!canCancel) return;
    await cancelOpenOrders([{ coin, oid }]);
    await refresh();
  };

  const cancelAll = async () => {
    if (!canCancel || !snapshot?.openOrders.length) return;
    await cancelOpenOrders(snapshot.openOrders.map((o) => ({ coin: o.coin, oid: o.oid })));
    await refresh();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" data-liveblotter-panel="liveblotter">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <span className={cn(TERMINAL_TYPO.label, "text-emerald-300")}>LIVE BLOTTER</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Murex/Calypso-style order &amp; fill lifecycle
        </span>
        <button
          type="button"
          onClick={() => void refresh()}
          className={cn(TERMINAL_TYPO.micro, "ml-auto flex items-center gap-0.5 text-slate-500 hover:text-slate-300")}
        >
          <RefreshCw className={cn("h-2.5 w-2.5", loading && "animate-spin")} />
          SYNC
        </button>
      </header>

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
      >
        {snapshot?.error ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-amber-400")}>{snapshot.error}</p>
        ) : null}

        <section className="mb-2">
          <div className="mb-1 flex items-center justify-between">
            <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>
              OPEN ORDERS ({snapshot?.openOrders.length ?? 0})
            </p>
            {snapshot?.openOrders.length && canCancel ? (
              <button
                type="button"
                onClick={() => void cancelAll()}
                className={cn(TERMINAL_TYPO.micro, "text-rose-400 hover:text-rose-300")}
              >
                CANCEL ALL
              </button>
            ) : null}
          </div>
          {snapshot?.openOrders.length ? (
            <table className={cn(TERMINAL_TYPO.micro, "w-full text-left")}>
              <thead>
                <tr className="text-slate-600">
                  <th className="py-0.5">COIN</th>
                  <th>SIDE</th>
                  <th>SIZE</th>
                  <th>LIMIT</th>
                  <th>TYPE</th>
                  {canCancel ? <th /> : null}
                </tr>
              </thead>
              <tbody>
                {snapshot.openOrders.map((o) => (
                  <tr key={o.oid} className="border-t border-slate-900">
                    <td className="text-slate-300">{o.coin}</td>
                    <td className={o.side === "buy" ? terminalSkin.textUp : terminalSkin.textDown}>
                      {o.side.toUpperCase()}
                    </td>
                    <td className="tabular-nums text-slate-400">{formatSize(o.sz)}</td>
                    <td className="tabular-nums text-slate-400">{formatPrice(o.limitPx)}</td>
                    <td className="text-slate-500">{o.orderType}</td>
                    {canCancel ? (
                      <td>
                        <button
                          type="button"
                          onClick={() => void cancelOne(o.coin, o.oid)}
                          className="text-rose-400 hover:text-rose-300"
                          title="Cancel order"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No open orders.</p>
          )}
        </section>

        <section>
          <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-cyan-600")}>
            FILLS ({snapshot?.fills.length ?? 0})
          </p>
          {snapshot?.fills.length ? (
            <table className={cn(TERMINAL_TYPO.micro, "w-full text-left")}>
              <thead>
                <tr className="text-slate-600">
                  <th className="py-0.5">TIME</th>
                  <th>COIN</th>
                  <th>SIDE</th>
                  <th>SIZE</th>
                  <th>PX</th>
                  <th>PNL</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.fills.map((f) => (
                  <tr key={f.id} className="border-t border-slate-900">
                    <td className="text-slate-500">{formatTapeTime(f.time)}</td>
                    <td className="text-slate-300">{f.coin}</td>
                    <td className={f.side === "buy" ? terminalSkin.textUp : terminalSkin.textDown}>
                      {f.side.toUpperCase()}
                    </td>
                    <td className="tabular-nums text-slate-400">{formatSize(f.sz)}</td>
                    <td className="tabular-nums text-slate-400">{formatPrice(f.px)}</td>
                    <td
                      className={cn(
                        "tabular-nums",
                        f.closedPnl >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
                      )}
                    >
                      {f.closedPnl !== 0 ? f.closedPnl.toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              Connect wallet and trade live to populate fill history.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
