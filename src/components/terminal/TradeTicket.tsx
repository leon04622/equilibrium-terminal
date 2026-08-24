"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, ChevronDown } from "lucide-react";
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
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { resolveMoneySafety } from "@/lib/beginner/beginnerTranslation";
import { resolveAssetIndex } from "@/lib/hyperliquid/asset-index";
import { MARKET_SLIPPAGE } from "@/lib/hyperliquid/constants";
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
  const setOrderError = useHyperliquidStore((s) => s.setOrderError);
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
  const [sizeUnit, setSizeUnit] = useState<"coin" | "usd">("usd");
  const [limitPx, setLimitPx] = useState("");
  const [stopPx, setStopPx] = useState("");
  const [leverage, setLeverage] = useState(10);
  const [isCross, setIsCross] = useState(true);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tif, setTif] = useState<HlTimeInForce>("Gtc");
  const [tpslOn, setTpslOn] = useState(false);
  const [takeProfitPx, setTakeProfitPx] = useState("");
  const [stopLossPx, setStopLossPx] = useState("");
  const [tpGain, setTpGain] = useState("");
  const [slLoss, setSlLoss] = useState("");
  const [usdDraft, setUsdDraft] = useState<string | null>(null);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [flashSide, setFlashSide] = useState<"buy" | "sell" | null>(null);
  const [liveConfirm, setLiveConfirm] = useState<{ side: "buy" | "sell"; size: number } | null>(
    null,
  );

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

  const maxNotional = isSpot ? maxBuy : Math.max(maxBuy, maxSell);
  const szDecimals = selectedAsset?.szDecimals ?? 4;

  useEffect(() => {
    if (!tradeTicketDraft) return;
    if (tradeTicketDraft.side) {
      setSide(tradeTicketDraft.side);
      setFlashSide(tradeTicketDraft.side);
    }
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
    setUsdDraft(null);
    setReduceOnly(false);
    setTpslOn(false);
    setTakeProfitPx("");
    setStopLossPx("");
    setTpGain("");
    setSlLoss("");
  }, [selectedAsset?.coin]);

  useEffect(() => {
    if (sizePct <= 0 || maxNotional <= 0) return;
    setUsdDraft(null);
    setSize(sizeFromCapitalPct(sizePct, maxNotional, szDecimals));
    // Recalc coin size when the slider or leverage changes — not on every mark tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- maxNotional read at lev/pct change
  }, [leverage, sizePct, szDecimals]);

  const onCapitalPctChange = useCallback(
    (pct: number) => {
      setUsdDraft(null);
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
      tpslOn && takeProfitPx && Number.isFinite(Number.parseFloat(takeProfitPx))
        ? Number.parseFloat(takeProfitPx)
        : undefined;
    const sl =
      tpslOn && stopLossPx && Number.isFinite(Number.parseFloat(stopLossPx))
        ? Number.parseFloat(stopLossPx)
        : undefined;
    useChartToolsStore.getState().setTicketPreview(
      limit || stop || tp || sl ? { limit, stop, tp, sl } : null,
    );
  }, [limitPx, mode, stopLossPx, stopPx, takeProfitPx, tpslOn]);

  const submit = useCallback(
    async (isBuy: boolean, sizeOverride?: number) => {
      if (executionGuard.blocked) {
        if (executionGuard.reason) setOrderError(executionGuard.reason);
        return;
      }
      if (!selectedAsset) {
        setOrderError("Select a market first");
        return;
      }

      let assetIndex = selectedAsset.assetIndex;
      if (assetIndex === undefined) {
        if (deskMode === "paper") {
          assetIndex = isSpot ? 10_000 : 0;
        } else {
          try {
            assetIndex = await resolveAssetIndex(selectedAsset.coin);
          } catch {
            setOrderError("Unknown asset — cannot route order");
            return;
          }
        }
      }

      let sz = sizeOverride ?? parseFloat(size);
      const cap = isBuy ? maxBuy : maxSell;
      if (cap > 0 && sz > cap) sz = Number(cap.toFixed(szDecimals));
      if (!sz || sz <= 0) {
        setOrderError("Enter a size or drag the slider, then Buy or Sell");
        return;
      }

      setLiveConfirm(null);
      setFlashSide(isBuy ? "buy" : "sell");
      window.setTimeout(() => setFlashSide(null), 400);

      const tpRaw = tpslOn ? Number.parseFloat(takeProfitPx) : undefined;
      const slRaw = tpslOn ? Number.parseFloat(stopLossPx) : undefined;
      const gain = Number.parseFloat(tpGain);
      const loss = Number.parseFloat(slLoss);
      const tpFromGain =
        tpslOn && markPx && Number.isFinite(gain) && gain > 0
          ? isBuy
            ? markPx * (1 + gain / 100)
            : markPx * (1 - gain / 100)
          : undefined;
      const slFromLoss =
        tpslOn && markPx && Number.isFinite(loss) && loss > 0
          ? isBuy
            ? markPx * (1 - loss / 100)
            : markPx * (1 + loss / 100)
          : undefined;
      const tp = tpRaw && Number.isFinite(tpRaw) && tpRaw > 0 ? tpRaw : tpFromGain;
      const sl = slRaw && Number.isFinite(slRaw) && slRaw > 0 ? slRaw : slFromLoss;

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
        takeProfitPx: tp,
        stopLossPx: sl,
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
      executionGuard.reason,
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
      slLoss,
      stopLossPx,
      stopPx,
      szDecimals,
      takeProfitPx,
      tif,
      tpGain,
      tpslOn,
      setOrderError,
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
    setSide(isBuy ? "buy" : "sell");
    if (submitBlocked) {
      if (executionGuard.reason) setOrderError(executionGuard.reason);
      else if (!orderPending) setOrderError("Cannot submit this order yet");
      return;
    }
    let sz = Number.parseFloat(size);
    if (!Number.isFinite(sz) || sz <= 0) {
      if (sizePct > 0 && maxNotional > 0) {
        sz = maxNotional * (sizePct / 100);
      } else {
        setOrderError("Enter a size or drag the slider, then Buy or Sell");
        return;
      }
    }
    const cap = isBuy ? maxBuy : maxSell;
    if (cap > 0 && sz > cap) sz = Number(cap.toFixed(szDecimals));
    if (!sz || sz <= 0) {
      setOrderError(isBuy ? "Not enough margin to buy" : "Not enough size to sell");
      return;
    }
    setUsdDraft(null);
    setSize(sz.toFixed(szDecimals));
    setOrderError(null);
    void (async () => {
      if (deskMode === "live") {
        if (markPx && selectedAsset && sz > 0) {
          const order = {
            coin: selectedAsset.coin,
            side: isBuy ? ("buy" as const) : ("sell" as const),
            size: sz,
            markPx,
            leverage,
            isPerp: selectedAsset.market === "perp",
          };
          const check = await evaluatePreTradeWithServer(order, riskLimits);
          if (!check.allowed) return;
        }
        runWithBuilderFee({
          isPerp: selectedAsset?.market === "perp",
          context: "trade",
          action: () => setLiveConfirm({ side: isBuy ? "buy" : "sell", size: sz }),
        });
        return;
      }
      void submit(isBuy, sz);
    })();
  };

  const onSizeInput = (raw: string) => {
    if (sizeUnit === "usd") {
      setUsdDraft(raw);
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
    setUsdDraft(null);
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
      ? usdDraft != null
        ? usdDraft
        : sizeOk && markPx
          ? (sizeNum * markPx).toFixed(2)
          : ""
      : size;

  const estLiq = side === "buy" ? estLiqLong : estLiqShort;
  const symbol = selectedAsset?.symbol ?? "";
  const actionBlocked = submitBlocked || Boolean(liveConfirm);
  const posSize =
    existingPaper && Math.abs(existingPaper.size) > 1e-9
      ? `${formatSize(Math.abs(existingPaper.size))} ${symbol}`
      : isSpot && (spotHolding || maxSell > 0)
        ? `${formatSize(spotHolding?.available ?? maxSell)} ${spotBaseSymbol(selectedAsset?.coin ?? "")}`
        : "—";
  const slipMaxPct = (MARKET_SLIPPAGE * 100).toFixed(2);
  const field =
    "h-10 w-full rounded-md border border-[#1e2329] bg-[#13161c] px-3 text-[13px] text-white outline-none placeholder:text-[#5d656f] focus:border-[#50d2c1]";
  const chk = "h-3.5 w-3.5 rounded-sm border-[#2b3139] accent-[#50d2c1]";

  if (!isConnected && deskMode !== "paper") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#0b0e11] p-4 text-center">
        <p className="text-[13px] text-[#8a9199]">Connect a wallet to trade on Hyperliquid</p>
        <Button variant="terminal" onClick={connectWallet} disabled={isConnecting} className="w-full max-w-[200px]">
          {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Wallet"}
        </Button>
      </div>
    );
  }

  return (
    <div
      data-trade-panel="ticket"
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0b0e11] font-sans text-[#eee]"
      onWheel={stopPanelWheelBubble}
    >
      <div className="eq-panel-scroll mx-auto flex min-h-0 w-full max-w-[380px] flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain px-3 pt-2">
        {deskMode === "live" ? <LiveExecutionReadinessStrip /> : null}
        <ExecutionWarningBanner />
        <ExecutionLastResultStrip />

        {beginnerMode ? (
          <p className="text-[11px] text-[#8a9199]">
            {moneySafety.connection} · {moneySafety.trading}
          </p>
        ) : null}

        {deskMode === "live" && needsArbitrumForAuth && authStatus !== "approving" ? (
          <button
            type="button"
            onClick={() => void switchToArbitrum()}
            className="rounded-md border border-amber-700/50 py-2 text-[12px] text-amber-300"
          >
            Switch wallet to Arbitrum One
          </button>
        ) : null}
        {!oneClickEnabled && deskMode === "live" && authStatus !== "approving" ? (
          <button
            type="button"
            onClick={() => void approveAgent()}
            className="rounded-md bg-[#50d2c1] py-2 text-[13px] font-semibold text-[#0b0e11]"
          >
            Authorize Agent (One-Click)
          </button>
        ) : null}
        {deskMode === "live" && !claims ? (
          <div className="space-y-1">
            <button
              type="button"
              disabled={siwePending}
              onClick={() => terminalBus.emit("platform:sign-in", {})}
              className="w-full rounded-md bg-[#50d2c1] py-2 text-[13px] font-semibold text-[#0b0e11] disabled:opacity-50"
            >
              {siwePending ? "Signing in…" : "Sign Desk Session"}
            </button>
            {siweLastError ? <p className="text-[11px] text-[#e5484d]">{siweLastError}</p> : null}
          </div>
        ) : null}
        {authStatus === "approving" ? (
          <div className="flex items-center justify-center gap-2 text-[12px] text-amber-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Awaiting wallet signature…
          </div>
        ) : null}
        {authError ? <p className="text-[11px] text-[#e5484d]">{authError}</p> : null}

        {!isSpot ? (
          <TradeLeverageSlider
            leverage={leverage}
            maxLeverage={maxLeverage}
            onLeverageChange={setLeverage}
            isCross={isCross}
            onCrossChange={setIsCross}
            accountLabel={deskMode === "paper" ? "Paper" : "Live"}
          />
        ) : (
          <p className="text-[11px] text-[#50d2c1]">Spot — no leverage</p>
        )}

        <div className="flex border-b border-[#1e2329]" data-trade-region="order-modes">
          {(["market", "limit", "stop"] as TradeOrderMode[]).map((m) => (
            <button
              key={m}
              type="button"
              data-trade-region={`mode-${m}`}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2 text-[13px] capitalize",
                mode === m
                  ? "border-b-2 border-[#50d2c1] text-[#eee]"
                  : "text-[#8a9199] hover:text-[#eee]",
              )}
            >
              {m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-1 text-[12px]">
          <div className="flex justify-between text-[#8a9199]">
            <span>Available to Trade</span>
            <span className="tabular-nums text-[#eee]">
              {displayWithdrawable != null
                ? `${displayWithdrawable.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-[#8a9199]">
            <span>Current Position</span>
            <span className={cn("tabular-nums", posSize !== "—" ? "text-[#50d2c1]" : "text-[#eee]")}>
              {posSize}
            </span>
          </div>
        </div>

        {mode === "limit" ? (
          <div data-trade-region="limit-price">
            <input
              value={limitPx}
              onChange={(e) => setLimitPx(e.target.value)}
              className={field}
              placeholder="Price"
            />
            <div className="mt-1 flex justify-end gap-1">
              {TIF_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTif(t)}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] uppercase",
                    tif === t ? "text-[#50d2c1]" : "text-[#5d656f]",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {mode === "stop" ? (
          <input
            data-trade-region="stop-trigger"
            value={stopPx}
            onChange={(e) => setStopPx(e.target.value)}
            className={field}
            placeholder="Stop trigger"
          />
        ) : null}

        <div data-trade-region="size">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5d656f]">
              Size
            </span>
            <input
              value={sizeFieldValue}
              onChange={(e) => onSizeInput(e.target.value)}
              className={cn(field, "px-14 text-right")}
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={() => {
                setUsdDraft(null);
                setSizeUnit((u) => (u === "usd" ? "coin" : "usd"));
              }}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 text-[12px] text-[#8a9199] hover:text-[#eee]"
            >
              {sizeUnit === "usd" ? "USDC" : symbol || "Coin"}
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        <TradeCapitalSlider
          pct={sizePct}
          onPctChange={onCapitalPctChange}
          maxSize={maxNotional}
          disabled={maxNotional <= 0}
        />
        {!sizeOk ? (
          <p className="text-[11px] text-[#5d656f]">
            Type a size in USDC or drag the slider, then tap Buy or Sell
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#8a9199]">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className={chk}
            />
            Reduce Only
          </label>
          {!isSpot ? (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={tpslOn}
                onChange={(e) => setTpslOn(e.target.checked)}
                className={chk}
              />
              Take Profit / Stop Loss
            </label>
          ) : null}
        </div>

        {tpslOn && !isSpot ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              value={takeProfitPx}
              onChange={(e) => setTakeProfitPx(e.target.value)}
              className={field}
              placeholder="TP Price"
            />
            <input
              value={tpGain}
              onChange={(e) => setTpGain(e.target.value)}
              className={field}
              placeholder="Gain %"
            />
            <input
              value={stopLossPx}
              onChange={(e) => setStopLossPx(e.target.value)}
              className={field}
              placeholder="SL Price"
            />
            <input
              value={slLoss}
              onChange={(e) => setSlLoss(e.target.value)}
              className={field}
              placeholder="Loss %"
            />
          </div>
        ) : null}

        {deskMode === "live" && selectedAsset && markPx && sizeOk ? (
          <PreTradeRiskStrip
            coin={selectedAsset.coin}
            side={side}
            size={sizeNum}
            markPx={markPx}
            leverage={leverage}
            isPerp={selectedAsset.market === "perp"}
          />
        ) : null}

        <div className="space-y-1.5 border-t border-[#1e2329] pt-3 text-[12px]" data-trade-region="risk-display">
          <Detail
            label="Liquidation Price"
            value={!isSpot && estLiq != null ? formatPrice(estLiq) : "—"}
          />
          <Detail
            label="Order Value"
            value={
              estNotional != null
                ? `${estNotional.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
                : "—"
            }
          />
          <Detail
            label="Margin Required"
            value={
              estMargin != null
                ? `${estMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
                : "—"
            }
          />
          <Detail
            label="Slippage"
            value={
              <span className="text-[#50d2c1]">
                Est: 0.02% / Max: {slipMaxPct}%
              </span>
            }
          />
          <Detail label="Fees" value={isSpot ? "Spot · no builder" : `Taker 0.0450% · builder ${builderFeeLabel()}`} />
        </div>

        <div className="space-y-1.5 border-t border-[#1e2329] pt-3 text-[12px]">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#5d656f]">
            {deskMode === "paper" ? "Paper account" : "Account"}
          </p>
          <Detail
            label="Portfolio Value"
            value={
              displayAccountValue != null
                ? `$${displayAccountValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : "—"
            }
          />
          <Detail
            label="Unrealized PNL"
            value={
              paperSnap ? (
                <span className={paperSnap.unrealized >= 0 ? "text-[#3ed598]" : "text-[#e5484d]"}>
                  {paperSnap.unrealized >= 0 ? "+" : ""}
                  {paperSnap.unrealized.toFixed(2)}
                </span>
              ) : (
                "—"
              )
            }
          />
          <Detail
            label="Available"
            value={
              displayWithdrawable != null
                ? `$${displayWithdrawable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : "—"
            }
          />
        </div>

        <details className="pb-2 text-[11px] text-[#5d656f]">
          <summary className="cursor-pointer hover:text-[#8a9199]">Desk intel</summary>
          <div className="mt-2">
            <ExecutionContextStrip />
          </div>
        </details>
      </div>

      <div className="mx-auto w-full max-w-[380px] shrink-0 space-y-1.5 border-t border-[#1e2329] bg-[#0b0e11] px-3 py-2">
        {liveConfirm ? (
          <div className="space-y-2 rounded-md border border-[#e5484d]/40 bg-[#2a0f12] p-3">
            <p className="text-[12px] font-semibold uppercase text-[#e5484d]">
              Confirm live {liveConfirm.side} · {symbol}
            </p>
            <p className="text-[12px] text-[#c9cdd3]">
              {mode.toUpperCase()} {liveConfirm.size} @ {markPx !== null ? formatPrice(markPx) : "—"}
              {estNotional
                ? ` · ≈ $${estNotional.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : ""}
              {!isSpot ? ` · ${leverage}x ${isCross ? "Cross" : "Iso"}` : ""}
            </p>
            <p className="text-[11px] text-[#8a9199]">
              Real mainnet order.
              {!isSpot ? ` Builder fee ${builderFeeLabel()} on fill.` : " No builder fee on spot."}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLiveConfirm(null)}
                className="rounded-md border border-[#1e2329] py-2 text-[12px] text-[#8a9199]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submit(liveConfirm.side === "buy", liveConfirm.size)}
                className={cn(
                  "rounded-md py-2 text-[12px] font-semibold",
                  liveConfirm.side === "buy" ? "bg-[#50d2c1] text-[#0b0e11]" : "bg-[#e5484d] text-white",
                )}
              >
                Confirm {liveConfirm.side}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5" data-trade-region="exec-buttons">
            <button
              type="button"
              disabled={actionBlocked}
              onMouseEnter={() => setSide("buy")}
              onClick={() => requestSubmit(true)}
              className={cn(
                "rounded-md py-3 text-[13px] font-semibold",
                "bg-[#50d2c1] text-[#0b0e11]",
                flashSide === "buy" && "ring-1 ring-[#50d2c1]",
                actionBlocked && "cursor-not-allowed opacity-40",
              )}
            >
              {orderPending && flashSide === "buy" ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Buy / Long"
              )}
            </button>
            <button
              type="button"
              disabled={actionBlocked}
              onMouseEnter={() => setSide("sell")}
              onClick={() => requestSubmit(false)}
              className={cn(
                "rounded-md py-3 text-[13px] font-semibold",
                "bg-[#e5484d] text-white",
                flashSide === "sell" && "ring-1 ring-[#e5484d]",
                actionBlocked && "cursor-not-allowed opacity-40",
              )}
            >
              {orderPending && flashSide === "sell" ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Sell / Short"
              )}
            </button>
          </div>
        )}
        {executionGuard.reason ? (
          <p className="text-center text-[11px] text-amber-400">{executionGuard.reason}</p>
        ) : null}
        {orderError ? <p className="text-center text-[11px] text-[#e5484d]">{orderError}</p> : null}
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

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#8a9199]">{label}</span>
      <span className="tabular-nums text-[#eee]">{value}</span>
    </div>
  );
}
