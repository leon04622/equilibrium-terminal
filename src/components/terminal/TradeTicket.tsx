"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { cn, formatPrice, formatSize } from "@/lib/utils";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import type { HlTimeInForce, TradeOrderMode } from "@/types/exchange";
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
import { resolveAssetIndex } from "@/lib/hyperliquid/asset-index";
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
import {
  TradeCapitalSlider,
  capitalPctFromSize,
  sizeFromCapitalPct,
} from "@/components/terminal/TradeCapitalSlider";
import { TradeLeverageSlider } from "@/components/terminal/TradeLeverageSlider";
import { useHlMarketContexts } from "@/hooks/useHlMarketContexts";
import {
  estLiqAfterOrder,
  maxOrderSize,
  paperAccountSnapshot,
  positionMargin,
} from "@/lib/execution/paperLedger";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";

const TIF_OPTIONS: HlTimeInForce[] = ["Gtc", "Ioc", "Alo"];

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
  const allMids = useHyperliquidStore((s) => s.mids.mids);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const deskMode = useDeskExecutionStore((s) => s.mode);
  const paperPositions = useDeskExecutionStore((s) => s.paperPositions);
  const paperRealizedPnl = useDeskExecutionStore((s) => s.paperRealizedPnl);
  const paperStartingEquity = useDeskExecutionStore((s) => s.paperStartingEquity);
  const claims = useProductionConfigStore((s) => s.claims);
  const siwePending = useProductionConfigStore((s) => s.siwePending);
  const siweLastError = useProductionConfigStore((s) => s.siweLastError);
  const riskLimits = useInstitutionalRiskStore((s) => s.limits);
  const moneySafety = resolveMoneySafety({ isConnected, isAuthorized, deskMode, hasDeskSession: Boolean(claims) });
  const { rows: marketRows } = useHlMarketContexts(true);

  const [mode, setMode] = useState<TradeOrderMode>("market");
  const [size, setSize] = useState("");
  const [sizePct, setSizePct] = useState(0);
  const [sizeUnit, setSizeUnit] = useState<"coin" | "usd">("coin");
  const [limitPx, setLimitPx] = useState("");
  const [stopPx, setStopPx] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [isCross, setIsCross] = useState(true);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tif, setTif] = useState<HlTimeInForce>("Gtc");
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const [takeProfitPx, setTakeProfitPx] = useState("");
  const [stopLossPx, setStopLossPx] = useState("");
  const [flashSide, setFlashSide] = useState<"buy" | "sell" | null>(null);
  const [liveConfirm, setLiveConfirm] = useState<"buy" | "sell" | null>(null);

  const markPx =
    book?.mid ??
    (selectedAsset?.coin ? allMids[selectedAsset.coin] : undefined) ??
    null;
  const isSpot = selectedAsset?.market === "spot";
  const maxLeverage = useMemo(() => {
    if (isSpot) return 1;
    const row = marketRows.find((r) => r.coin === selectedAsset?.coin && r.market === "perp");
    return Math.max(1, Math.round(row?.maxLeverage ?? 50));
  }, [isSpot, marketRows, selectedAsset?.coin]);

  const paperSnap = useMemo(() => {
    if (deskMode !== "paper") return null;
    const marks = { ...allMids };
    if (selectedAsset?.coin && markPx) marks[selectedAsset.coin] = markPx;
    return paperAccountSnapshot(paperPositions, paperRealizedPnl, paperStartingEquity, marks);
  }, [allMids, deskMode, markPx, paperPositions, paperRealizedPnl, paperStartingEquity, selectedAsset?.coin]);

  const displayAccountValue = paperSnap?.equity ?? accountValue;
  const displayWithdrawable = paperSnap != null ? Math.max(0, paperSnap.available) : withdrawable;
  const spotHolding =
    isSpot && selectedAsset ? lookupSpotBalance(spotBalances, selectedAsset.coin) : null;
  const existingPaper = selectedAsset
    ? paperPositions.find((p) => p.coin === selectedAsset.coin) ?? null
    : null;

  const executionGuard = useMemo(() => {
    if (deskMode === "paper") {
      if (markPx == null || markPx <= 0) {
        return { blocked: true, reason: "Waiting for live price — chart/book feed loading" };
      }
      return { blocked: false, reason: null };
    }
    return evaluateExecutionGuards({
      connectionStatus,
      lastMessageAt,
      markPx,
      bookUpdatedAt: book?.time ?? null,
    });
  }, [book?.time, connectionStatus, deskMode, lastMessageAt, markPx]);

  useEffect(() => {
    if (markPx && mode === "limit" && !limitPx) {
      setLimitPx(String(markPx));
    }
  }, [markPx, mode, limitPx]);

  useEffect(() => {
    if (leverage > maxLeverage) setLeverage(maxLeverage);
  }, [leverage, maxLeverage]);

  const liveMaxPerp = useMemo(() => {
    if (!accountValue || !markPx || isSpot) return 0;
    return (accountValue * leverage) / markPx;
  }, [accountValue, isSpot, leverage, markPx]);

  const maxBuy = useMemo(() => {
    if (!markPx || !selectedAsset) return 0;
    if (deskMode === "paper") {
      return maxOrderSize({
        available: Math.max(0, paperSnap?.available ?? 0),
        markPx,
        leverage: isSpot ? 1 : leverage,
        isBuy: true,
        isSpot,
        reduceOnly,
        existing: existingPaper,
      });
    }
    if (isSpot) return maxSpotBuySize(spotBalances, selectedAsset.coin, markPx, withdrawable);
    return liveMaxPerp;
  }, [
    deskMode,
    existingPaper,
    isSpot,
    leverage,
    liveMaxPerp,
    markPx,
    paperSnap?.available,
    reduceOnly,
    selectedAsset,
    spotBalances,
    withdrawable,
  ]);

  const maxSell = useMemo(() => {
    if (!selectedAsset || !markPx) return 0;
    if (deskMode === "paper") {
      return maxOrderSize({
        available: Math.max(0, paperSnap?.available ?? 0),
        markPx,
        leverage: isSpot ? 1 : leverage,
        isBuy: false,
        isSpot,
        reduceOnly,
        existing: existingPaper,
      });
    }
    if (isSpot) return maxSpotSellSize(spotBalances, selectedAsset.coin);
    return liveMaxPerp;
  }, [
    deskMode,
    existingPaper,
    isSpot,
    leverage,
    liveMaxPerp,
    markPx,
    paperSnap?.available,
    reduceOnly,
    selectedAsset,
    spotBalances,
  ]);

  const maxNotional = Math.max(maxBuy, isSpot ? 0 : maxSell);
  const szDecimals = selectedAsset?.szDecimals ?? 4;

  useEffect(() => {
    if (!tradeTicketDraft) return;
    if (tradeTicketDraft.side) setFlashSide(tradeTicketDraft.side);
    if (tradeTicketDraft.size) {
      setSize(tradeTicketDraft.size);
      const n = Number.parseFloat(tradeTicketDraft.size);
      if (Number.isFinite(n) && maxNotional > 0) {
        setSizePct(capitalPctFromSize(n, maxNotional));
      }
    }
    window.setTimeout(() => setFlashSide(null), 400);
  }, [tradeTicketDraft, maxNotional]);

  useEffect(() => {
    setSizePct(0);
    setSize("");
    setReduceOnly(false);
    setTpEnabled(false);
    setSlEnabled(false);
    setTakeProfitPx("");
    setStopLossPx("");
  }, [selectedAsset?.coin]);

  useEffect(() => {
    if (sizePct <= 0 || maxNotional <= 0) return;
    setSize(sizeFromCapitalPct(sizePct, maxNotional, szDecimals));
    // Recalc coin size when the slider or leverage changes — not on every mark tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- maxNotional read at lev/pct change
  }, [leverage, sizePct, szDecimals]);

  const onCapitalPctChange = useCallback(
    (pct: number) => {
      setSizePct(pct);
      setSize(sizeFromCapitalPct(pct, maxNotional, szDecimals));
    },
    [maxNotional, szDecimals],
  );

  const sizeNum = Number.parseFloat(size);
  const sizeOk = Number.isFinite(sizeNum) && sizeNum > 0;
  const refPx =
    mode === "limit" && limitPx && Number.isFinite(Number.parseFloat(limitPx))
      ? Number.parseFloat(limitPx)
      : markPx;
  const estNotional = sizeOk && refPx ? sizeNum * refPx : null;
  const estMargin =
    estNotional != null && !isSpot ? positionMargin(sizeNum, refPx ?? 0, leverage) : estNotional;
  const estLiqLong =
    !isSpot && sizeOk && refPx
      ? estLiqAfterOrder({
          existing: deskMode === "paper" ? existingPaper : null,
          isBuy: true,
          size: sizeNum,
          px: refPx,
          leverage,
          isCross,
        })
      : null;
  const estLiqShort =
    !isSpot && sizeOk && refPx
      ? estLiqAfterOrder({
          existing: deskMode === "paper" ? existingPaper : null,
          isBuy: false,
          size: sizeNum,
          px: refPx,
          leverage,
          isCross,
        })
      : null;

  useEffect(() => {
    const limit =
      mode === "limit" && limitPx && Number.isFinite(Number.parseFloat(limitPx))
        ? Number.parseFloat(limitPx)
        : undefined;
    const stop =
      stopPx && Number.isFinite(Number.parseFloat(stopPx))
        ? Number.parseFloat(stopPx)
        : undefined;
    const tp =
      tpEnabled && takeProfitPx && Number.isFinite(Number.parseFloat(takeProfitPx))
        ? Number.parseFloat(takeProfitPx)
        : undefined;
    const sl =
      slEnabled && stopLossPx && Number.isFinite(Number.parseFloat(stopLossPx))
        ? Number.parseFloat(stopLossPx)
        : undefined;
    useChartToolsStore.getState().setTicketPreview(
      limit || stop || tp || sl ? { limit, stop, tp, sl } : null,
    );
  }, [limitPx, mode, slEnabled, stopLossPx, stopPx, takeProfitPx, tpEnabled]);

  const submit = useCallback(
    async (isBuy: boolean) => {
      if (executionGuard.blocked) return;
      if (!selectedAsset) return;

      let assetIndex = selectedAsset.assetIndex;
      if (assetIndex === undefined) {
        try {
          assetIndex = await resolveAssetIndex(selectedAsset.coin);
        } catch {
          return;
        }
      }

      let sz = parseFloat(size);
      const cap = isBuy ? maxBuy : maxSell;
      if (cap > 0 && sz > cap) sz = Number(cap.toFixed(szDecimals));
      if (!sz || sz <= 0) return;

      setLiveConfirm(null);
      setFlashSide(isBuy ? "buy" : "sell");
      window.setTimeout(() => setFlashSide(null), 400);

      const tp = tpEnabled ? Number.parseFloat(takeProfitPx) : undefined;
      const sl = slEnabled ? Number.parseFloat(stopLossPx) : undefined;

      const params = {
        coin: selectedAsset.coin,
        asset: assetIndex,
        isBuy,
        size: sz,
        mode,
        limitPx: mode === "limit" ? parseFloat(limitPx) : undefined,
        stopPx: mode === "stop" ? parseFloat(stopPx) : undefined,
        markPx: markPx ?? undefined,
        szDecimals: selectedAsset.szDecimals,
        reduceOnly,
        tif: mode === "limit" ? tif : undefined,
        takeProfitPx: tp && Number.isFinite(tp) && tp > 0 ? tp : undefined,
        stopLossPx: sl && Number.isFinite(sl) && sl > 0 ? sl : undefined,
        leverage: isSpot ? 1 : leverage,
        isCross,
        isSpot,
      };

      try {
        if (selectedAsset.market === "perp" && deskMode === "live") {
          await setAssetLeverage(assetIndex, leverage, isCross);
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
      isCross,
      isSpot,
      leverage,
      limitPx,
      markPx,
      maxBuy,
      maxSell,
      mode,
      reduceOnly,
      selectedAsset,
      setAssetLeverage,
      size,
      slEnabled,
      stopLossPx,
      stopPx,
      szDecimals,
      takeProfitPx,
      tif,
      tpEnabled,
    ],
  );

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
    (deskMode === "live" && preTradeBlock?.severity === "block" && !preTradeBlock.allowed);

  const requestSubmit = (isBuy: boolean) => {
    if (submitBlocked) return;
    const sz = Number.parseFloat(size);
    if (!Number.isFinite(sz) || sz <= 0) return;
    void (async () => {
      if (deskMode === "live") {
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

  const onSizeInput = (raw: string) => {
    if (sizeUnit === "usd") {
      if (!raw.trim()) {
        setSize("");
        setSizePct(0);
        return;
      }
      const usd = Number.parseFloat(raw);
      if (!Number.isFinite(usd) || !markPx || markPx <= 0) return;
      const coin = usd / markPx;
      setSize(coin.toFixed(szDecimals));
      if (maxNotional > 0) setSizePct(capitalPctFromSize(coin, maxNotional));
      return;
    }
    setSize(raw);
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n) && n > 0 && maxNotional > 0) {
      setSizePct(capitalPctFromSize(n, maxNotional));
    } else if (!raw.trim()) {
      setSizePct(0);
    }
  };

  const sizeFieldValue =
    sizeUnit === "usd"
      ? sizeOk && markPx
        ? (sizeNum * markPx).toFixed(2)
        : ""
      : size;

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
      className={cn(
        "eq-panel-scroll flex h-full min-h-0 flex-col gap-1 overflow-y-auto overscroll-y-contain p-1 font-mono",
        TERMINAL_TYPO.data,
      )}
      onWheel={stopPanelWheelBubble}
    >
      <ExecutionContextStrip />
      {deskMode === "live" ? <LiveExecutionReadinessStrip /> : null}
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
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            {deskMode === "paper" ? "Paper equity" : "Account"}
          </p>
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
        {deskMode === "live" ? (
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
        ) : (
          <div className={cn(TERMINAL_TYPO.micro, "border-[0.5px] border-cyan-800/50 px-1 py-0.5 text-cyan-300")}>
            PAPER
          </div>
        )}
      </div>

      {deskMode === "live" && needsArbitrumForAuth && authStatus !== "approving" ? (
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
          Paper · ${paperStartingEquity.toLocaleString()} sim account at live Hyperliquid prices. DESK → LIVE for mainnet.
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

      {deskMode === "paper" && existingPaper && Math.abs(existingPaper.size) > 1e-9 ? (
        <div className={cn(terminalSkin.border, "bg-slate-950 px-1 py-0.5")}>
          <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
            {existingPaper.coin} {existingPaper.size > 0 ? "LONG" : "SHORT"}{" "}
            {Math.abs(existingPaper.size).toFixed(4)} @ {existingPaper.avgPx.toFixed(2)} · {existingPaper.leverage}x{" "}
            {existingPaper.isCross ? "Cross" : "Iso"}
          </p>
        </div>
      ) : null}

      {isSpot ? (
        <div className={cn(terminalSkin.border, "grid grid-cols-2 gap-px bg-slate-900")} data-trade-region="spot-balance">
          <div className="bg-slate-950 px-1 py-0.5">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Spot hold</p>
            <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
              {spotHolding
                ? `${formatSize(spotHolding.available)} ${spotBaseSymbol(selectedAsset?.coin ?? "")}`
                : deskMode === "paper" && maxSell > 0
                  ? `${formatSize(maxSell)} ${spotBaseSymbol(selectedAsset?.coin ?? "")}`
                  : "—"}
            </p>
          </div>
          <div className="bg-slate-950 px-1 py-0.5 text-right">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Max buy</p>
            <p className={cn(TERMINAL_TYPO.dataSm, terminalSkin.textUp)}>
              {maxBuy > 0 ? formatSize(maxBuy) : "—"}
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
        <TradeLeverageSlider
          leverage={leverage}
          maxLeverage={maxLeverage}
          onLeverageChange={setLeverage}
          isCross={isCross}
          onCrossChange={setIsCross}
        />
      ) : (
        <p className={cn(TERMINAL_TYPO.micro, "px-0.5 text-cyan-400/80")}>
          Spot desk — no leverage · builder fee not applied on spot fills
        </p>
      )}

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

      <label className="flex flex-col gap-0.5" data-trade-region="size">
        <span className="flex items-center justify-between">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Size</span>
          <span className="flex gap-px bg-slate-900">
            {(["coin", "usd"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setSizeUnit(u)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "bg-slate-950 px-1.5 py-0.5 uppercase",
                  sizeUnit === u ? "text-cyan-300" : "text-slate-600 hover:text-slate-400",
                )}
              >
                {u === "coin" ? selectedAsset?.symbol ?? "Coin" : "USD"}
              </button>
            ))}
          </span>
        </span>
        <input
          value={sizeFieldValue}
          onChange={(e) => onSizeInput(e.target.value)}
          className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data)}
          placeholder={sizeUnit === "usd" ? "0.00" : "0.00"}
        />
      </label>

      <TradeCapitalSlider
        pct={sizePct}
        onPctChange={onCapitalPctChange}
        maxSize={maxNotional}
        markPx={markPx}
        symbol={selectedAsset?.symbol ?? ""}
        szDecimals={szDecimals}
        disabled={maxNotional <= 0}
        capLabel={isSpot ? "balance" : "available"}
        marginUsd={!isSpot ? estMargin : null}
        availableUsd={displayWithdrawable}
      />

      {isSpot && maxSell > 0 ? (
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Max sell · {formatSize(maxSell)} {spotBaseSymbol(selectedAsset?.coin ?? "")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 px-0.5">
        <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-400")}>
          <input
            type="checkbox"
            checked={reduceOnly}
            onChange={(e) => setReduceOnly(e.target.checked)}
            className="accent-[#26a69a]"
          />
          Reduce only
        </label>
        {mode === "limit" ? (
          <span className="ml-auto flex gap-px bg-slate-900">
            {TIF_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTif(t)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "bg-slate-950 px-1.5 py-0.5 uppercase",
                  tif === t ? "text-cyan-300" : "text-slate-600 hover:text-slate-400",
                )}
              >
                {t}
              </button>
            ))}
          </span>
        ) : null}
      </div>

      {!isSpot ? (
        <div className="grid grid-cols-2 gap-1">
          <label className="flex flex-col gap-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-500")}>
              <input
                type="checkbox"
                checked={tpEnabled}
                onChange={(e) => setTpEnabled(e.target.checked)}
                className="accent-[#26a69a]"
              />
              Take profit
            </span>
            <input
              value={takeProfitPx}
              disabled={!tpEnabled}
              onChange={(e) => setTakeProfitPx(e.target.value)}
              className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data, !tpEnabled && "opacity-40")}
              placeholder="TP trigger"
            />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-500")}>
              <input
                type="checkbox"
                checked={slEnabled}
                onChange={(e) => setSlEnabled(e.target.checked)}
                className="accent-[#26a69a]"
              />
              Stop loss
            </span>
            <input
              value={stopLossPx}
              disabled={!slEnabled}
              onChange={(e) => setStopLossPx(e.target.value)}
              className={cn(INSTITUTIONAL_INTERACTION.input, TERMINAL_TYPO.data, !slEnabled && "opacity-40")}
              placeholder="SL trigger"
            />
          </label>
        </div>
      ) : null}

      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")} data-trade-region="risk-display">
        {estNotional != null ? (
          <>
            Value ${estNotional.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            {!isSpot && estMargin != null ? ` · Margin $${estMargin.toFixed(2)}` : ""}
            {!isSpot && (estLiqLong != null || estLiqShort != null)
              ? ` · Liq L ${estLiqLong != null ? formatPrice(estLiqLong) : "—"} / S ${estLiqShort != null ? formatPrice(estLiqShort) : "—"}`
              : ""}
          </>
        ) : (
          <>Mark {markPx !== null ? formatPrice(markPx) : "—"}</>
        )}
      </p>

      <div className="grid grid-cols-2 gap-1" data-trade-region="exec-buttons">
        <button
          type="button"
          disabled={submitBlocked || Boolean(liveConfirm) || maxBuy <= 0}
          onClick={() => requestSubmit(true)}
          className={cn(
            TERMINAL_TYPO.label,
            "py-2.5 uppercase",
            terminalSkin.execBuy,
            flashSide === "buy" && terminalSkin.flashUp,
            (submitBlocked || maxBuy <= 0) && "opacity-50",
          )}
        >
          {orderPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Buy / Long"}
        </button>
        <button
          type="button"
          disabled={submitBlocked || Boolean(liveConfirm) || maxSell <= 0}
          onClick={() => requestSubmit(false)}
          className={cn(
            TERMINAL_TYPO.label,
            "py-2.5 uppercase",
            terminalSkin.execSell,
            flashSide === "sell" && terminalSkin.flashDown,
            (submitBlocked || maxSell <= 0) && "opacity-50",
          )}
        >
          {orderPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Sell / Short"}
        </button>
      </div>

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
            {selectedAsset?.market === "perp" ? ` · ${leverage}x ${isCross ? "Cross" : "Iso"}` : ""}
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
