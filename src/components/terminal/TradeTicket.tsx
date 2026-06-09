"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import type { TradeOrderMode } from "@/types/exchange";
import { Button } from "@/components/ui/button";
import { ExecutionContextStrip } from "@/components/terminal/ExecutionContextStrip";
import { ExecutionWarningBanner } from "@/components/terminal/ExecutionWarningBanner";
import { evaluateExecutionGuards } from "@/lib/wedge/executionGuards";
import { INSTITUTIONAL_INTERACTION, TERMINAL_TYPO, terminalSkin } from "@/lib/theme";

const SIZE_PRESETS = [0.25, 0.5, 1] as const;
const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 25, 50] as const;

export function TradeTicket() {
  const {
    isConnected,
    isConnecting,
    isAuthorized,
    authStatus,
    oneClickEnabled,
    connectWallet,
    approveAgent,
    executeOrder,
    setAssetLeverage,
    authError,
    needsArbitrumForAuth,
    switchToArbitrum,
  } = useHyperliquidAuthContext();

  const selectedAsset = useHyperliquidStore((s) => s.selectedAsset);
  const book = useHyperliquidStore((s) => s.book);
  const accountValue = useHyperliquidStore((s) => s.accountValue);
  const withdrawable = useHyperliquidStore((s) => s.withdrawable);
  const orderPending = useHyperliquidStore((s) => s.orderPending);
  const orderError = useHyperliquidStore((s) => s.orderError);
  const tradeTicketDraft = useHyperliquidStore((s) => s.tradeTicketDraft);
  const connectionStatus = useHyperliquidStore((s) => s.connectionStatus);
  const lastMessageAt = useHyperliquidStore((s) => s.lastMessageAt);

  const [mode, setMode] = useState<TradeOrderMode>("market");
  const [size, setSize] = useState("");
  const [limitPx, setLimitPx] = useState("");
  const [stopPx, setStopPx] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [flashSide, setFlashSide] = useState<"buy" | "sell" | null>(null);

  const markPx = book?.mid ?? null;

  const executionGuard = useMemo(
    () =>
      evaluateExecutionGuards({
        connectionStatus,
        lastMessageAt,
        markPx,
        bookUpdatedAt: book?.time ?? null,
      }),
    [book?.time, connectionStatus, lastMessageAt, markPx],
  );

  useEffect(() => {
    if (markPx && mode === "limit" && !limitPx) {
      setLimitPx(String(markPx));
    }
  }, [markPx, mode, limitPx]);

  useEffect(() => {
    if (!tradeTicketDraft) return;
    if (tradeTicketDraft.side) setFlashSide(tradeTicketDraft.side);
    if (tradeTicketDraft.size) setSize(tradeTicketDraft.size);
    window.setTimeout(() => setFlashSide(null), 400);
  }, [tradeTicketDraft]);

  const maxNotional = useMemo(() => {
    if (!accountValue || !markPx) return 0;
    return (accountValue * leverage) / markPx;
  }, [accountValue, leverage, markPx]);

  const applySizePct = useCallback(
    (pct: number) => {
      if (!maxNotional) return;
      const sz = maxNotional * pct;
      const decimals = selectedAsset?.szDecimals ?? 4;
      setSize(sz.toFixed(decimals));
    },
    [maxNotional, selectedAsset?.szDecimals],
  );

  const submit = useCallback(
    async (isBuy: boolean) => {
      if (executionGuard.blocked) return;
      if (selectedAsset?.assetIndex === undefined) return;
      const sz = parseFloat(size);
      if (!sz || sz <= 0) return;

      setFlashSide(isBuy ? "buy" : "sell");
      window.setTimeout(() => setFlashSide(null), 400);

      const params = {
        coin: selectedAsset.coin,
        asset: selectedAsset.assetIndex,
        isBuy,
        size: sz,
        mode,
        limitPx: mode === "limit" ? parseFloat(limitPx) : undefined,
        stopPx: mode === "stop" ? parseFloat(stopPx) : undefined,
        markPx: markPx ?? undefined,
        szDecimals: selectedAsset.szDecimals,
      };

      try {
        if (selectedAsset.market === "perp") {
          await setAssetLeverage(selectedAsset.assetIndex, leverage, true);
        }
        await executeOrder(params);
      } catch {
        /* surfaced via orderError */
      }
    },
    [
      executeOrder,
      executionGuard.blocked,
      leverage,
      limitPx,
      markPx,
      mode,
      selectedAsset,
      setAssetLeverage,
      size,
      stopPx,
    ],
  );

  const submitBlocked =
    executionGuard.blocked || orderPending || !isAuthorized || !oneClickEnabled;

  if (!isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="font-mono text-xs text-terminal-muted">
          Connect an EVM wallet to trade on Hyperliquid L1
        </p>
        <Button
          variant="terminal"
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full max-w-[200px]"
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col gap-1 p-1 font-mono", TERMINAL_TYPO.data)}>
      <ExecutionContextStrip />
      <ExecutionWarningBanner />
      <div className={cn(terminalSkin.border, "flex items-center justify-between bg-slate-950 px-1 py-0.5")}>
        <div>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Account</p>
          <p className={cn(TERMINAL_TYPO.dataLg, "text-slate-200")}>
            ${accountValue !== null ? accountValue.toFixed(2) : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Free</p>
          <p className={cn(TERMINAL_TYPO.data, terminalSkin.textUp)}>
            ${withdrawable !== null ? withdrawable.toFixed(2) : "—"}
          </p>
        </div>
        <div
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border-[0.5px] px-1 py-0.5",
            isAuthorized
              ? "border-[#00ff88]/30 text-[#00ff88]"
              : "border-amber-900/50 text-amber-400",
          )}
        >
          {isAuthorized ? <ShieldCheck className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
          {isAuthorized ? "1CT" : "NO 1CT"}
        </div>
      </div>

      {needsArbitrumForAuth && authStatus !== "approving" ? (
        <div className="space-y-1.5">
          <p className="text-[10px] text-amber-400/90">
            Your wallet is not on Arbitrum One (required for Hyperliquid authorization).
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full font-mono text-[10px]"
            onClick={() => void switchToArbitrum()}
          >
            Switch wallet to Arbitrum One
          </Button>
        </div>
      ) : null}
      {!oneClickEnabled && authStatus !== "approving" ? (
        <Button variant="terminal" className="w-full" onClick={() => void approveAgent()}>
          Authorize Agent (One-Click)
        </Button>
      ) : null}
      {authStatus === "approving" ? (
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Awaiting wallet signature…
        </div>
      ) : null}
      {authError ? <p className="text-[10px] text-neon-ruby">{authError}</p> : null}

      <div className="grid grid-cols-3 gap-px bg-slate-900">
        {(["market", "limit", "stop"] as TradeOrderMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              TERMINAL_TYPO.micro,
              "bg-slate-950 py-1 uppercase",
              mode === m ? "text-cyan-300" : "text-slate-600 hover:text-slate-400",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-px bg-slate-900">
        {LEVERAGE_OPTIONS.map((lev) => (
          <button
            key={lev}
            type="button"
            onClick={() => setLeverage(lev)}
            className={cn(
              TERMINAL_TYPO.micro,
              "bg-slate-950 py-0.5 tabular-nums",
              leverage === lev ? terminalSkin.textUp : "text-slate-600 hover:text-slate-400",
            )}
          >
            {lev}x
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-0.5">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Size</span>
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          placeholder="0.00"
        />
      </label>

      <div className="grid grid-cols-3 gap-px bg-slate-900">
        {SIZE_PRESETS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => applySizePct(pct)}
            className={cn(
              TERMINAL_TYPO.micro,
              "bg-slate-950 py-1 text-slate-600 hover:text-slate-300",
            )}
          >
            {pct * 100}%
          </button>
        ))}
      </div>

      {mode === "limit" ? (
        <label className="flex flex-col gap-0.5">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Limit price</span>
          <input
            value={limitPx}
            onChange={(e) => setLimitPx(e.target.value)}
            className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          />
        </label>
      ) : null}

      {mode === "stop" ? (
        <label className="flex flex-col gap-0.5">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Stop trigger</span>
          <input
            value={stopPx}
            onChange={(e) => setStopPx(e.target.value)}
            className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          />
        </label>
      ) : null}

      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
        Mark {markPx !== null ? formatPrice(markPx) : "—"} · Max ≈{" "}
        {maxNotional > 0 ? formatSize(maxNotional) : "—"} {selectedAsset?.symbol}
      </p>

      {executionGuard.reason ? (
        <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn, "text-center")}>
          {executionGuard.reason}
        </p>
      ) : null}

      {orderPending ? (
        <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn, "text-center")}>
          ORDER SUBMITTING — awaiting confirmation
        </p>
      ) : null}

      <div className="mt-auto grid grid-cols-2 gap-1">
        <button
          type="button"
          disabled={submitBlocked}
          onClick={() => void submit(true)}
          className={cn(
            TERMINAL_TYPO.label,
            "py-2 uppercase",
            terminalSkin.execBuy,
            flashSide === "buy" && terminalSkin.flashUp,
            submitBlocked && "opacity-50",
          )}
        >
          {orderPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Buy"}
        </button>
        <button
          type="button"
          disabled={submitBlocked}
          onClick={() => void submit(false)}
          className={cn(
            TERMINAL_TYPO.label,
            "py-2 uppercase",
            terminalSkin.execSell,
            flashSide === "sell" && terminalSkin.flashDown,
            submitBlocked && "opacity-50",
          )}
        >
          {orderPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sell"}
        </button>
      </div>

      {orderError ? (
        <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textDown, "text-center")}>{orderError}</p>
      ) : null}
    </div>
  );
}
