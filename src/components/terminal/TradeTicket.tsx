"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import type { TradeOrderMode } from "@/types/exchange";
import { Button } from "@/components/ui/button";
import { ExecutionContextStrip } from "@/components/terminal/ExecutionContextStrip";
import { LiveExecutionReadinessStrip } from "@/components/terminal/LiveExecutionReadinessStrip";
import { ExecutionWarningBanner } from "@/components/terminal/ExecutionWarningBanner";
import { ExecutionLastResultStrip } from "@/components/terminal/ExecutionLastResultStrip";
import { PreTradeRiskStrip } from "@/components/terminal/PreTradeRiskStrip";
import { PreTradeRiskLimitsEngine } from "@/lib/institutional/PreTradeRiskLimitsEngine";
import { evaluatePreTradeWithServer } from "@/lib/institutional/preTradeClient";
import { useInstitutionalRiskStore } from "@/store/useInstitutionalRiskStore";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import { evaluateExecutionGuards } from "@/lib/wedge/executionGuards";
import { INSTITUTIONAL_INTERACTION, TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { resolveMoneySafety } from "@/lib/beginner/beginnerTranslation";
import { builderFeeLabel } from "@/lib/hyperliquid/builder";
import {
  lookupSpotBalance,
  maxSpotBuySize,
  maxSpotSellSize,
  spotBaseSymbol,
} from "@/lib/hyperliquid/spotDesk";
import { terminalBus } from "@/store/eventBus";
import { useBuilderFeeGate } from "@/hooks/useBuilderFeeGate";
import { BuilderFeeApprovalModal } from "@/components/terminal/BuilderFeeApprovalModal";

const SIZE_PRESETS = [0.25, 0.5, 1] as const;
const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 25, 50] as const;
const PAPER_DEFAULT_ACCOUNT_USD = 10_000;

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
    builderFeeApproved,
  } = useHyperliquidAuthContext();

  const {
    modalOpen: builderModalOpen,
    modalContext: builderModalContext,
    builderFeeApproving,
    authError: builderAuthError,
    runWithBuilderFee,
    cancelModal: cancelBuilderModal,
    confirmApproval: confirmBuilderApproval,
  } = useBuilderFeeGate();

  const selectedAsset = useHyperliquidStore((s) => s.selectedAsset);
  const book = useHyperliquidStore((s) => s.book);
  const accountValue = useHyperliquidStore((s) => s.accountValue);
  const withdrawable = useHyperliquidStore((s) => s.withdrawable);
  const orderPending = useHyperliquidStore((s) => s.orderPending);
  const orderError = useHyperliquidStore((s) => s.orderError);
  const tradeTicketDraft = useHyperliquidStore((s) => s.tradeTicketDraft);
  const spotBalances = useHyperliquidStore((s) => s.spotBalances);
  const connectionStatus = useHyperliquidStore((s) => s.connectionStatus);
  const lastMessageAt = useHyperliquidStore((s) => s.lastMessageAt);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const deskMode = useDeskExecutionStore((s) => s.mode);
  const paperPositions = useDeskExecutionStore((s) => s.paperPositions);
  const claims = useProductionConfigStore((s) => s.claims);
  const siwePending = useProductionConfigStore((s) => s.siwePending);
  const siweLastError = useProductionConfigStore((s) => s.siweLastError);
  const riskLimits = useInstitutionalRiskStore((s) => s.limits);
  const moneySafety = resolveMoneySafety({ isConnected, isAuthorized, deskMode, hasDeskSession: Boolean(claims) });

  const [mode, setMode] = useState<TradeOrderMode>("market");
  const [size, setSize] = useState("");
  const [limitPx, setLimitPx] = useState("");
  const [stopPx, setStopPx] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [flashSide, setFlashSide] = useState<"buy" | "sell" | null>(null);
  const [liveConfirm, setLiveConfirm] = useState<"buy" | "sell" | null>(null);

  const markPx = book?.mid ?? null;
  const isSpot = selectedAsset?.market === "spot";
  const paperAccountUsd =
    deskMode === "paper" ? (withdrawable ?? accountValue ?? PAPER_DEFAULT_ACCOUNT_USD) : null;
  const displayAccountValue = paperAccountUsd ?? accountValue;
  const displayWithdrawable = paperAccountUsd ?? withdrawable;
  const spotHolding =
    isSpot && selectedAsset ? lookupSpotBalance(spotBalances, selectedAsset.coin) : null;

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
    const limit =
      mode === "limit" && limitPx && Number.isFinite(Number.parseFloat(limitPx))
        ? Number.parseFloat(limitPx)
        : undefined;
    const stop =
      stopPx && Number.isFinite(Number.parseFloat(stopPx))
        ? Number.parseFloat(stopPx)
        : undefined;
    useChartToolsStore.getState().setTicketPreview(
      limit || stop ? { limit, stop } : null,
    );
  }, [mode, limitPx, stopPx]);

  useEffect(() => {
    if (!tradeTicketDraft) return;
    if (tradeTicketDraft.side) setFlashSide(tradeTicketDraft.side);
    if (tradeTicketDraft.size) setSize(tradeTicketDraft.size);
    window.setTimeout(() => setFlashSide(null), 400);
  }, [tradeTicketDraft]);

  const maxPerpSize = useMemo(() => {
    const equity = paperAccountUsd ?? accountValue;
    if (!equity || !markPx || isSpot) return 0;
    return (equity * leverage) / markPx;
  }, [accountValue, isSpot, leverage, markPx, paperAccountUsd]);

  const maxSpotBuy = useMemo(() => {
    if (!isSpot || !selectedAsset || !markPx) return 0;
    if (deskMode === "paper") {
      const free = paperAccountUsd ?? withdrawable ?? accountValue ?? PAPER_DEFAULT_ACCOUNT_USD;
      return free > 0 ? free / markPx : 0;
    }
    return maxSpotBuySize(spotBalances, selectedAsset.coin, markPx, withdrawable);
  }, [accountValue, deskMode, isSpot, markPx, paperAccountUsd, selectedAsset, spotBalances, withdrawable]);

  const maxSpotSell = useMemo(() => {
    if (!isSpot || !selectedAsset) return 0;
    if (deskMode === "paper") {
      const pp = paperPositions.find((p) => p.coin === selectedAsset.coin);
      return pp && pp.size > 0 ? pp.size : 0;
    }
    return maxSpotSellSize(spotBalances, selectedAsset.coin);
  }, [deskMode, isSpot, paperPositions, selectedAsset, spotBalances]);

  const maxNotional = isSpot ? maxSpotBuy : maxPerpSize;

  const applySizePct = useCallback(
    (pct: number, side: "buy" | "sell" = "buy") => {
      const cap = isSpot ? (side === "buy" ? maxSpotBuy : maxSpotSell) : maxPerpSize;
      if (!cap) return;
      const sz = cap * pct;
      const decimals = selectedAsset?.szDecimals ?? 4;
      setSize(sz.toFixed(decimals));
    },
    [isSpot, maxPerpSize, maxSpotBuy, maxSpotSell, selectedAsset?.szDecimals],
  );

  const submit = useCallback(
    async (isBuy: boolean) => {
      if (executionGuard.blocked) return;
      if (selectedAsset?.assetIndex === undefined) return;
      const sz = parseFloat(size);
      if (!sz || sz <= 0) return;

      setLiveConfirm(null);
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
        if (selectedAsset.market === "perp" && deskMode === "live") {
          await setAssetLeverage(selectedAsset.assetIndex, leverage, true);
        }
        await executeOrder(params);
      } catch {
        /* surfaced via orderError */
      }
    },
    [
      deskMode,
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

  const estNotional =
    markPx && size && parseFloat(size) > 0 ? parseFloat(size) * markPx : null;

  const preTradeBlock = useMemo(() => {
    const sz = parseFloat(size);
    if (!markPx || !sz || sz <= 0 || !selectedAsset) return null;
    return PreTradeRiskLimitsEngine.evaluate(
      {
        coin: selectedAsset.coin,
        side: "buy",
        size: sz,
        markPx,
        leverage,
        isPerp: selectedAsset.market === "perp",
      },
      riskLimits,
    );
  }, [leverage, markPx, riskLimits, selectedAsset, size]);

  const submitBlocked =
    executionGuard.blocked ||
    orderPending ||
    (deskMode === "live" && (!isAuthorized || !oneClickEnabled || !claims)) ||
    (preTradeBlock?.severity === "block" && !preTradeBlock.allowed);

  const requestSubmit = (isBuy: boolean) => {
    if (submitBlocked) return;
    void (async () => {
      if (markPx && selectedAsset && parseFloat(size) > 0) {
        const order = {
          coin: selectedAsset.coin,
          side: isBuy ? ("buy" as const) : ("sell" as const),
          size: parseFloat(size),
          markPx,
          leverage,
          isPerp: selectedAsset.market === "perp",
        };
        const check = await evaluatePreTradeWithServer(order, riskLimits);
        if (!check.allowed) return;
      }
      if (deskMode === "live") {
        const side = isBuy ? "buy" : "sell";
        const proceed = () => setLiveConfirm(side);
        runWithBuilderFee({
          isPerp: selectedAsset?.market === "perp",
          context: "trade",
          action: proceed,
        });
        return;
      }
      void submit(isBuy);
    })();
  };

  if (!isConnected && deskMode !== "paper") {
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
    <div
      data-trade-panel="ticket"
      className={cn("flex h-full flex-col gap-1 p-1 font-mono", TERMINAL_TYPO.data)}
    >
      <ExecutionContextStrip />
      <LiveExecutionReadinessStrip />
      <ExecutionWarningBanner />
      {selectedAsset && markPx && parseFloat(size) > 0 ? (
        <PreTradeRiskStrip
          coin={selectedAsset.coin}
          side={flashSide ?? "buy"}
          size={parseFloat(size)}
          markPx={markPx}
          leverage={leverage}
          isPerp={selectedAsset.market === "perp"}
        />
      ) : null}
      <ExecutionLastResultStrip />
      {beginnerMode ? (
        <div
          className={cn(
            "border px-1.5 py-1",
            moneySafety.trading === "LIVE"
              ? "border-rose-800/50 bg-rose-950/25"
              : "border-cyan-800/50 bg-cyan-950/20",
            TERMINAL_TYPO.micro,
          )}
        >
          <p className={moneySafety.trading === "LIVE" ? "text-rose-300" : "text-cyan-300"}>
            {moneySafety.connection} · {moneySafety.trading}
          </p>
          <p className="mt-0.5 text-slate-500">{moneySafety.hint}</p>
        </div>
      ) : null}
      <div className={cn(terminalSkin.border, "flex items-center justify-between bg-slate-950 px-1 py-0.5")}>
        <div>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Account</p>
          <p className={cn(TERMINAL_TYPO.dataLg, "text-slate-200")}>
            ${displayAccountValue !== null ? displayAccountValue.toFixed(2) : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Free</p>
          <p className={cn(TERMINAL_TYPO.data, terminalSkin.textUp)}>
            ${displayWithdrawable !== null ? displayWithdrawable.toFixed(2) : "—"}
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
      {!oneClickEnabled && deskMode === "live" && authStatus !== "approving" ? (
        <Button variant="terminal" className="w-full" onClick={() => void approveAgent()}>
          Authorize Agent (One-Click)
        </Button>
      ) : null}
      {deskMode === "paper" ? (
        <p className={cn(TERMINAL_TYPO.micro, "text-cyan-400/90")}>
          Paper desk — simulated fills at live Hyperliquid prices. Switch DESK → LIVE for mainnet orders.
        </p>
      ) : null}
      {deskMode === "live" && !claims ? (
        <div className="space-y-1">
          <p className={cn(TERMINAL_TYPO.micro, "text-amber-400/90")}>
            Sign desk session to submit live Hyperliquid orders.
          </p>
          <Button
            variant="terminal"
            className="w-full"
            disabled={siwePending}
            onClick={() => terminalBus.emit("platform:sign-in", {})}
          >
            {siwePending ? (
              <>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign Desk Session"
            )}
          </Button>
          {siweLastError ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-rose-400")}>{siweLastError}</p>
          ) : null}
        </div>
      ) : null}
      {authStatus === "approving" ? (
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Awaiting wallet signature…
        </div>
      ) : null}
      {authError ? <p className="text-[10px] text-neon-ruby">{authError}</p> : null}

      {deskMode === "paper" && paperPositions.length > 0 ? (
        <div className={cn(terminalSkin.border, "bg-slate-950 px-1 py-0.5")}>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Paper book</p>
          {paperPositions.slice(0, 3).map((p) => (
            <p key={p.coin} className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
              {p.coin} {p.size > 0 ? "LONG" : "SHORT"} {Math.abs(p.size).toFixed(4)} @ {p.avgPx.toFixed(2)}
            </p>
          ))}
        </div>
      ) : null}

      {isSpot ? (
        <div className={cn(terminalSkin.border, "grid grid-cols-2 gap-px bg-slate-900")} data-trade-region="spot-balance">
          <div className="bg-slate-950 px-1 py-0.5">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Spot hold</p>
            <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
              {spotHolding
                ? `${formatSize(spotHolding.available)} ${spotBaseSymbol(selectedAsset?.coin ?? "")}`
                : deskMode === "paper" && maxSpotSell > 0
                  ? `${formatSize(maxSpotSell)} ${spotBaseSymbol(selectedAsset?.coin ?? "")}`
                  : "—"}
            </p>
          </div>
          <div className="bg-slate-950 px-1 py-0.5 text-right">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Max buy</p>
            <p className={cn(TERMINAL_TYPO.dataSm, terminalSkin.textUp)}>
              {maxSpotBuy > 0 ? formatSize(maxSpotBuy) : "—"}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-px bg-slate-900" data-trade-region="order-modes">
        {(["market", "limit", "stop"] as TradeOrderMode[]).map((m) => (
          <button
            key={m}
            type="button"
            data-trade-region={`mode-${m}`}
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

      {!isSpot ? (
        <div className="grid grid-cols-4 gap-px bg-slate-900" data-trade-region="leverage">
          {LEVERAGE_OPTIONS.map((lev) => (
            <button
              key={lev}
              type="button"
              data-trade-region="leverage"
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
      ) : (
        <p className={cn(TERMINAL_TYPO.micro, "text-cyan-400/80 px-0.5")}>
          Spot desk — no leverage · builder fee not applied on spot fills
        </p>
      )}

      <label className="flex flex-col gap-0.5" data-trade-region="size">
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Size</span>
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          placeholder="0.00"
        />
      </label>

      <div className="grid grid-cols-3 gap-px bg-slate-900" data-trade-region="size-presets">
        {SIZE_PRESETS.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => applySizePct(pct, "buy")}
            className={cn(
              TERMINAL_TYPO.micro,
              "bg-slate-950 py-1 text-slate-600 hover:text-slate-300",
            )}
          >
            {pct * 100}%
          </button>
        ))}
      </div>
      {isSpot && maxSpotSell > 0 ? (
        <button
          type="button"
          onClick={() => applySizePct(1, "sell")}
          className={cn(
            TERMINAL_TYPO.micro,
            terminalSkin.border,
            "w-full bg-slate-950 py-0.5 text-slate-500 hover:text-slate-300",
          )}
        >
          Max sell · {formatSize(maxSpotSell)} {spotBaseSymbol(selectedAsset?.coin ?? "")}
        </button>
      ) : null}

      {mode === "limit" ? (
        <label className="flex flex-col gap-0.5" data-trade-region="limit-price">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Limit price</span>
          <input
            value={limitPx}
            onChange={(e) => setLimitPx(e.target.value)}
            className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          />
        </label>
      ) : null}

      {mode === "stop" ? (
        <label className="flex flex-col gap-0.5" data-trade-region="stop-trigger">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Stop trigger</span>
          <input
            value={stopPx}
            onChange={(e) => setStopPx(e.target.value)}
            className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          />
        </label>
      ) : null}

      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")} data-trade-region="risk-display">
        Mark {markPx !== null ? formatPrice(markPx) : "—"} · Max buy ≈{" "}
        {maxNotional > 0 ? formatSize(maxNotional) : "—"} {selectedAsset?.symbol}
        {isSpot && maxSpotSell > 0 ? ` · Max sell ${formatSize(maxSpotSell)}` : ""}
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

      {liveConfirm ? (
        <div className={cn(terminalSkin.border, "space-y-1 border-rose-800/50 bg-rose-950/25 p-2")}>
          <p className={cn(TERMINAL_TYPO.micro, "font-semibold uppercase text-rose-300")}>
            Confirm live {liveConfirm} · {selectedAsset?.symbol}
          </p>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
            {mode.toUpperCase()} {size} @ {markPx !== null ? formatPrice(markPx) : "—"}
            {estNotional ? ` · ≈ $${estNotional.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : ""}
            {selectedAsset?.market === "perp" ? ` · ${leverage}x` : ""}
          </p>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
            Real mainnet order — submits to Hyperliquid.
            {selectedAsset?.market === "perp"
              ? ` Equilibrium builder fee ${builderFeeLabel()} on fill.`
              : " Spot fills do not attach a builder fee."}
          </p>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setLiveConfirm(null)}
              className={cn(TERMINAL_TYPO.micro, "border border-slate-700 py-1 text-slate-400")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit(liveConfirm === "buy")}
              className={cn(
                TERMINAL_TYPO.micro,
                "border py-1 font-semibold uppercase",
                liveConfirm === "buy"
                  ? "border-emerald-700/50 text-emerald-300"
                  : "border-rose-700/50 text-rose-300",
              )}
            >
              Confirm {liveConfirm}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-auto grid grid-cols-2 gap-1">
        <button
          type="button"
          disabled={submitBlocked || Boolean(liveConfirm)}
          onClick={() => requestSubmit(true)}
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
          disabled={submitBlocked || Boolean(liveConfirm)}
          onClick={() => requestSubmit(false)}
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
