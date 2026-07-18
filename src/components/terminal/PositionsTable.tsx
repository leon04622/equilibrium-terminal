"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { X, Loader2 } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import type { PositionRow } from "@/types/account";
import { useBuilderFeeGate } from "@/hooks/useBuilderFeeGate";
import { BuilderFeeApprovalModal } from "@/components/terminal/BuilderFeeApprovalModal";
import { spotBaseSymbol } from "@/lib/hyperliquid/spotDesk";
import { resolveAssetIndex } from "@/lib/hyperliquid/asset-index";
import { unrealizedPnl } from "@/lib/execution/paperPnL";

const PAPER_DEFAULT_ACCOUNT_USD = 10_000;

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
  const {
    isConnected,
    closePositionMarket,
    executeOrder,
    connectWallet,
    isConnecting,
    authError,
  } = useHyperliquidAuthContext();
  const deskMode = useDeskExecutionStore((s) => s.mode);
  const paperPositions = useDeskExecutionStore((s) => s.paperPositions);
  const {
    modalOpen: builderModalOpen,
    modalContext: builderModalContext,
    builderFeeApproving,
    authError: builderAuthError,
    runWithBuilderFee,
    cancelModal: cancelBuilderModal,
    confirmApproval: confirmBuilderApproval,
  } = useBuilderFeeGate();
  const accountValue = useHyperliquidStore((s) => s.accountValue);
  const withdrawable = useHyperliquidStore((s) => s.withdrawable);
  const orderPending = useHyperliquidStore((s) => s.orderPending);
  const walletAddress = useHyperliquidStore((s) => s.walletAddress);
  const spotBalances = useHyperliquidStore((s) => s.spotBalances);
  const assets = useHyperliquidStore((s) => s.assets);
  const mids = useHyperliquidStore((s) => s.mids.mids);

  useSyncExternalStore(subscribePositions, getPositions, getPositions);
  const positions = useHyperliquidStore((s) => s.positions);

  const paperPerpRows = useMemo((): PositionRow[] => {
    if (deskMode !== "paper") return [];
    return paperPositions
      .filter((p) => {
        const asset = assets.find((a) => a.coin === p.coin);
        return !asset || asset.market === "perp";
      })
      .filter((p) => Math.abs(p.size) > 1e-9)
      .map((p) => {
        const mark = mids[p.coin] ?? p.avgPx;
        const asset = assets.find((a) => a.coin === p.coin);
        return {
          id: `paper-${p.coin}`,
          coin: p.coin,
          assetIndex: asset?.assetIndex ?? 0,
          size: p.size,
          entryPrice: p.avgPx,
          markPrice: mark,
          unrealizedPnl: unrealizedPnl(p, mark),
          marginType: "Cross" as const,
          leverage: 10,
          pnlFlash: null,
        };
      });
  }, [assets, deskMode, mids, paperPositions]);

  const displayPositions = deskMode === "paper" ? paperPerpRows : positions;
  const displayEquity =
    deskMode === "paper" ? PAPER_DEFAULT_ACCOUNT_USD : accountValue;
  const displayWithdrawable =
    deskMode === "paper" ? PAPER_DEFAULT_ACCOUNT_USD : withdrawable;

  const spotHoldings = useMemo(() => {
    if (deskMode === "paper") {
      return paperPositions
        .filter((p) => p.size > 0 && assets.some((a) => a.market === "spot" && a.coin === p.coin))
        .map((p) => {
          const asset = assets.find((a) => a.coin === p.coin);
          return {
            coin: p.coin,
            symbol: spotBaseSymbol(p.coin),
            size: p.size,
            mark: mids[p.coin] ?? p.avgPx,
            assetIndex: asset?.assetIndex ?? 0,
            szDecimals: asset?.szDecimals ?? 4,
          };
        });
    }
    return spotBalances
      .filter((b) => b.coin !== "USDC" && b.available > 0)
      .map((b) => {
        const asset = assets.find(
          (a) => a.market === "spot" && spotBaseSymbol(a.coin) === b.coin,
        );
        const pairCoin = asset?.coin ?? `${b.coin}/USDC`;
        const mark =
          mids[pairCoin] ??
          (b.usdcValue && b.available > 0 ? b.usdcValue / b.available : 0);
        return {
          coin: pairCoin,
          symbol: b.coin,
          size: b.available,
          mark,
          assetIndex: asset?.assetIndex ?? 10_000,
          szDecimals: asset?.szDecimals ?? 4,
        };
      })
      .filter((h) => h.assetIndex > 0);
  }, [assets, deskMode, mids, paperPositions, spotBalances]);

  const requestClose = (row: PositionRow) => {
    const executeClose = () =>
      void (async () => {
        let assetIndex = row.assetIndex;
        if (assetIndex <= 0) {
          try {
            assetIndex = await resolveAssetIndex(row.coin);
          } catch {
            return;
          }
        }
        await closePositionMarket(row.coin, assetIndex, row.size, row.markPrice);
      })();
    if (deskMode !== "live") {
      executeClose();
      return;
    }
    runWithBuilderFee({ isPerp: true, context: "close", action: executeClose });
  };

  const requestSpotSell = (holding: (typeof spotHoldings)[number]) => {
    const executeSell = () =>
      void executeOrder({
        coin: holding.coin,
        asset: holding.assetIndex,
        isBuy: false,
        size: holding.size,
        mode: "market",
        markPx: holding.mark,
        szDecimals: holding.szDecimals,
      });
    if (deskMode === "live") {
      runWithBuilderFee({ isPerp: false, context: "close", action: executeSell });
      return;
    }
    executeSell();
  };

  if (deskMode !== "paper" && (!isConnected || !walletAddress)) {
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
          <p className="text-terminal-muted uppercase tracking-wider">
            {deskMode === "paper" ? "Paper equity" : "Equity"}
          </p>
          <p className="text-sm tabular-nums text-white">
            ${displayEquity !== null ? displayEquity.toFixed(2) : "—"}
          </p>
        </div>
        <div>
          <p className="text-terminal-muted uppercase tracking-wider">
            {deskMode === "paper" ? "Paper free" : "Withdrawable"}
          </p>
          <p className="text-sm tabular-nums text-neon-green">
            ${displayWithdrawable !== null ? displayWithdrawable.toFixed(2) : "—"}
          </p>
        </div>
        <div className="text-right" data-positions-region="position-count">
          <p className="text-terminal-muted uppercase tracking-wider">Positions</p>
          <p className="text-sm tabular-nums text-white">
            {displayPositions.length}
            {spotHoldings.length > 0 ? ` + ${spotHoldings.length} spot` : ""}
          </p>
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
            {displayPositions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-terminal-muted"
                >
                  {deskMode === "paper"
                    ? "No paper positions — use Trade Ticket (DESK → PAPER)"
                    : "No open positions"}
                </td>
              </tr>
            ) : (
              displayPositions.map((row) => (
                <PositionRowView
                  key={row.id}
                  row={row}
                  closing={orderPending}
                  onClose={() => requestClose(row)}
                />
              ))
            )}
          </tbody>
        </table>

        {spotHoldings.length > 0 ? (
          <table className="mt-2 w-full border-t border-terminal-border/40 font-mono text-[11px]">
            <thead className="bg-terminal-panel/95 text-[9px] uppercase tracking-widest text-terminal-muted">
              <tr>
                <th className="px-2 py-1.5 text-left" colSpan={5}>
                  Spot holdings
                </th>
                <th className="px-1 py-1.5 text-center">Sell</th>
              </tr>
            </thead>
            <tbody>
              {spotHoldings.map((h) => (
                <tr key={h.coin} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-2 py-1.5" colSpan={2}>
                    <span className="font-semibold text-white">{h.coin}</span>
                    <span className="ml-1.5 text-[9px] text-cyan-400">SPOT</span>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-white/90">
                    {formatSize(h.size)}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-white/80">
                    {h.mark > 0 ? formatPrice(h.mark) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-terminal-muted">
                    {h.mark > 0 ? `$${(h.size * h.mark).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button
                      type="button"
                      onClick={() => requestSpotSell(h)}
                      disabled={orderPending}
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-neon-ruby/40 text-neon-ruby transition hover:bg-neon-ruby/20 disabled:opacity-40"
                      aria-label={`Market sell ${h.coin}`}
                    >
                      {orderPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <BuilderFeeApprovalModal
        open={builderModalOpen}
        approving={builderFeeApproving}
        authError={builderAuthError ?? authError}
        context={builderModalContext}
        onApprove={() => void confirmBuilderApproval()}
        onCancel={cancelBuilderModal}
      />
    </div>
  );
}
