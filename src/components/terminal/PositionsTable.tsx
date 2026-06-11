"use client";

import { useEffect, useSyncExternalStore } from "react";
import { X, Loader2 } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import type { PositionRow } from "@/types/account";

function subscribePositions(callback: () => void) {
  return useHyperliquidStore.subscribe((s) => s.positionsVersion, () => callback());
}

function getPositions(): PositionRow[] {
  return useHyperliquidStore.getState().positions;
}

function PositionRowView({
  row,
  onClose,
  closing,
}: {
  row: PositionRow;
  onClose: () => void;
  closing: boolean;
}) {
  const clearFlash = useHyperliquidStore((s) => s.clearPositionPnlFlash);

  useEffect(() => {
    if (!row.pnlFlash) return;
    const t = window.setTimeout(() => clearFlash(row.coin), 450);
    return () => window.clearTimeout(t);
  }, [row.pnlFlash, row.coin, clearFlash]);

  const side = row.size > 0 ? "LONG" : "SHORT";
  const sideColor = row.size > 0 ? "text-neon-green" : "text-neon-ruby";

  return (
    <tr
      className={cn(
        "border-b border-white/5 transition-colors hover:bg-white/[0.03]",
        row.pnlFlash === "up" && "animate-flash-up",
        row.pnlFlash === "down" && "animate-flash-down",
      )}
    >
      <td className="px-2 py-1.5">
        <span className="font-semibold text-white">{row.coin}</span>
        <span className={cn("ml-1.5 text-[9px]", sideColor)}>{side}</span>
      </td>
      <td className="px-2 py-1.5 text-right tabular-nums text-white/90">
        {formatSize(Math.abs(row.size))}
      </td>
      <td className="px-2 py-1.5 text-right tabular-nums text-terminal-muted">
        {formatPrice(row.entryPrice)}
      </td>
      <td className="px-2 py-1.5 text-right tabular-nums text-white/80">
        {formatPrice(row.markPrice)}
      </td>
      <td className="px-2 py-1.5 text-center text-[10px] text-terminal-muted">
        {row.marginType}
        <span className="ml-1 text-white/60">{row.leverage}x</span>
      </td>
      <td
        className={cn(
          "px-2 py-1.5 text-right tabular-nums font-medium",
          row.unrealizedPnl >= 0 ? "text-neon-green" : "text-neon-ruby",
        )}
      >
        {row.unrealizedPnl >= 0 ? "+" : ""}
        {row.unrealizedPnl.toFixed(2)}
      </td>
      <td className="px-1 py-1 text-center">
        <button
          type="button"
          onClick={onClose}
          disabled={closing}
          className="inline-flex h-6 w-6 items-center justify-center rounded border border-neon-ruby/40 text-neon-ruby transition hover:bg-neon-ruby/20 disabled:opacity-40"
          aria-label={`Market close ${row.coin}`}
        >
          {closing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      </td>
    </tr>
  );
}

export function PositionsTable() {
  const { isConnected, closePositionMarket, connectWallet, isConnecting } =
    useHyperliquidAuthContext();
  const accountValue = useHyperliquidStore((s) => s.accountValue);
  const withdrawable = useHyperliquidStore((s) => s.withdrawable);
  const orderPending = useHyperliquidStore((s) => s.orderPending);
  const walletAddress = useHyperliquidStore((s) => s.walletAddress);

  useSyncExternalStore(subscribePositions, getPositions, getPositions);
  const positions = useHyperliquidStore((s) => s.positions);

  if (!isConnected || !walletAddress) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="font-mono text-xs text-terminal-muted">
          Connect a wallet to view your positions, margin & PnL.
        </p>
        <button
          type="button"
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-1 border border-cyan-700/60 bg-cyan-950/40 px-3 py-1 font-mono text-[10px] text-cyan-200 hover:bg-cyan-900/50 disabled:opacity-50"
        >
          {isConnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Connect Wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" data-positions-panel="positions">
      <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-terminal-border/50 bg-black/25 px-3 py-2 font-mono text-[10px]">
        <div>
          <p className="text-terminal-muted uppercase tracking-wider">Equity</p>
          <p className="text-sm tabular-nums text-white">
            ${accountValue !== null ? accountValue.toFixed(2) : "—"}
          </p>
        </div>
        <div>
          <p className="text-terminal-muted uppercase tracking-wider">Withdrawable</p>
          <p className="text-sm tabular-nums text-neon-green">
            ${withdrawable !== null ? withdrawable.toFixed(2) : "—"}
          </p>
        </div>
        <div className="text-right" data-positions-region="position-count">
          <p className="text-terminal-muted uppercase tracking-wider">Positions</p>
          <p className="text-sm tabular-nums text-white">{positions.length}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full font-mono text-[11px]">
          <thead className="sticky top-0 z-10 bg-terminal-panel/95 text-[9px] uppercase tracking-widest text-terminal-muted">
            <tr className="border-b border-terminal-border/50">
              <th className="px-2 py-1.5 text-left">Asset</th>
              <th className="px-2 py-1.5 text-right">Size</th>
              <th className="px-2 py-1.5 text-right">Entry</th>
              <th className="px-2 py-1.5 text-right">Mark</th>
              <th className="px-2 py-1.5 text-center">Margin</th>
              <th className="px-2 py-1.5 text-right">uPnL</th>
              <th className="px-1 py-1.5 text-center">Close</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-terminal-muted"
                >
                  No open positions
                </td>
              </tr>
            ) : (
              positions.map((row) => (
                <PositionRowView
                  key={row.id}
                  row={row}
                  closing={orderPending}
                  onClose={() =>
                    void closePositionMarket(
                      row.coin,
                      row.assetIndex,
                      row.size,
                      row.markPrice,
                    )
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
