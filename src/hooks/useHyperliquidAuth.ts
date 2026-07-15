"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Address, Hex } from "viem";
import {
  createEphemeralAgent,
  executeMarketClose,
  executeOrder,
  cancelOrders,
  getActiveAgent,
  markAgentApproved,
  postApproveAgent,
  postApproveBuilderFee,
  updateLeverage,
} from "@/lib/hyperliquid/executor";
import { clearPersistedAgent, persistAgentSession } from "@/lib/hyperliquid/agent-session";
import { fetchClearinghouseState, fetchMaxBuilderFee, fetchSpotClearinghouseState, verifyAgentForMaster } from "@/lib/hyperliquid/api";
import {
  EQUILIBRIUM_BUILDER_ADDRESS,
  isBuilderFeeSufficient,
} from "@/lib/hyperliquid/builder";
import { HL_SIGNATURE_CHAIN_ID } from "@/lib/hyperliquid/constants";
import { ensureAssetIndexMaps, resolveAssetIndex } from "@/lib/asset-index";
import {
  readWalletChainId,
  signApproveAgentWithWallet,
  signApproveBuilderFeeWithWallet,
  switchWalletToHyperliquidSigningChain,
} from "@/lib/wallet/hyperliquid-wallet";
import type { ExecuteOrderParams } from "@/types/exchange";
import { AuditLogEngine } from "@/lib/security/AuditLogEngine";
import { executionAuthorizationEngine } from "@/lib/security/ExecutionAuthorizationEngine";
import { AlphaFeatureFlags } from "@/lib/alpha/AlphaFeatureFlags";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { paperFillPrice } from "@/lib/execution/PaperExecutionEngine";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import {
  assertExchangeOk,
  ExchangeRejectError,
} from "@/lib/hyperliquid/exchangeErrors";
import { refreshAccountAfterFill } from "@/lib/hyperliquid/refreshAfterFill";
import {
  beginLiveExecutionAudit,
  logLiveExecutionOutcome,
} from "@/lib/hyperliquid/executionAudit";

function formatAuthError(err: unknown): string {
  if (!(err instanceof Error)) return "Approval failed";
  const msg = err.message;
  if (/user rejected|denied|cancelled|canceled/i.test(msg)) {
    return "Signature or network switch was cancelled";
  }
  if (/chainId.*must match/i.test(msg)) {
    return "Switch your wallet to Arbitrum One, then authorize again";
  }
  return msg;
}

export function useHyperliquidAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [walletChainId, setWalletChainId] = useState<number | null>(null);

  const agentPrivateKeyRef = useRef<Hex | null>(getActiveAgent()?.agentPrivateKey ?? null);

  const authStatus = useHyperliquidStore((s) => s.authStatus);
  const oneClickEnabled = useHyperliquidStore((s) => s.oneClickEnabled);
  const agentAddress = useHyperliquidStore((s) => s.agentAddress);
  const setWalletAddress = useHyperliquidStore((s) => s.setWalletAddress);
  const setAgentAddress = useHyperliquidStore((s) => s.setAgentAddress);
  const setAuthStatus = useHyperliquidStore((s) => s.setAuthStatus);
  const setOneClickEnabled = useHyperliquidStore((s) => s.setOneClickEnabled);
  const setOrderError = useHyperliquidStore((s) => s.setOrderError);
  const setOrderPending = useHyperliquidStore((s) => s.setOrderPending);
  const setLastExecutionEvent = useHyperliquidStore((s) => s.setLastExecutionEvent);
  const resetAccount = useHyperliquidStore((s) => s.resetAccount);
  const applyClearinghouse = useHyperliquidStore((s) => s.applyClearinghouse);
  const applySpotClearinghouse = useHyperliquidStore((s) => s.applySpotClearinghouse);

  const [authError, setAuthError] = useState<string | null>(null);
  const [builderFeeApproved, setBuilderFeeApproved] = useState(false);
  const [builderFeeApproving, setBuilderFeeApproving] = useState(false);

  const refreshBuilderFeeStatus = useCallback(async (user: Address) => {
    try {
      const maxFee = await fetchMaxBuilderFee(user, EQUILIBRIUM_BUILDER_ADDRESS);
      setBuilderFeeApproved(isBuilderFeeSufficient(maxFee));
    } catch {
      setBuilderFeeApproved(false);
    }
  }, []);

  const syncWalletChainId = useCallback(async () => {
    if (!isConnected) {
      setWalletChainId(null);
      return;
    }
    setWalletChainId(await readWalletChainId());
  }, [isConnected]);

  useEffect(() => {
    void syncWalletChainId();
    if (!isConnected) return;
    const id = window.setInterval(() => void syncWalletChainId(), 2000);
    return () => window.clearInterval(id);
  }, [isConnected, address, syncWalletChainId]);

  useEffect(() => {
    if (!isConnected || !address) return;
    void refreshBuilderFeeStatus(address);
    const id = window.setInterval(() => void refreshBuilderFeeStatus(address), 5_000);
    return () => window.clearInterval(id);
  }, [address, isConnected, refreshBuilderFeeStatus]);

  const refreshAccount = useCallback(async (user: Address) => {
    const [perp, spot] = await Promise.all([
      fetchClearinghouseState(user),
      fetchSpotClearinghouseState(user),
    ]);
    await applyClearinghouse(perp, user);
    applySpotClearinghouse(spot);
  }, [applyClearinghouse, applySpotClearinghouse]);

  const syncAccountAfterFill = useCallback(
    async (user: Address) => {
      await refreshAccountAfterFill(user, applyClearinghouse, applySpotClearinghouse);
    },
    [applyClearinghouse, applySpotClearinghouse],
  );

  const ensureLiveAgentValid = useCallback(async (): Promise<void> => {
    const agentAddr = useHyperliquidStore.getState().agentAddress;
    if (!agentAddr || !address) return;
    const approved = await verifyAgentForMaster(agentAddr, address);
    if (!approved) {
      agentPrivateKeyRef.current = null;
      setOneClickEnabled(false);
      setAuthStatus("connected");
      throw new Error("Trading agent expired — re-enable 1-Click Trading");
    }
  }, [address, setAuthStatus, setOneClickEnabled]);

  const bootstrapAgent = useCallback(
    async (master: Address) => {
      setAuthError(null);
      const session = createEphemeralAgent(master);
      const privateKey = session.agentPrivateKey;

      agentPrivateKeyRef.current = privateKey;
      setAgentAddress(session.agentAddress);

      const approved = await verifyAgentForMaster(session.agentAddress, master);
      setOneClickEnabled(approved);
      setAuthStatus(approved ? "agent_ready" : "connected");

      if (approved) {
        markAgentApproved(master);
        persistAgentSession({ ...session, approvedAt: Date.now() });
      }

      await refreshAccount(master);
      await refreshBuilderFeeStatus(master);
    },
    [refreshAccount, refreshBuilderFeeStatus, setAgentAddress, setAuthStatus, setOneClickEnabled],
  );

  useEffect(() => {
    if (!isConnected || !address) {
      agentPrivateKeyRef.current = null;
      setWalletAddress(null);
      setAgentAddress(null);
      setAuthStatus("disconnected");
      setOneClickEnabled(false);
      setBuilderFeeApproved(false);
      resetAccount();
      return;
    }

    setWalletAddress(address);
    setAuthStatus("connecting");
    void bootstrapAgent(address);
  }, [
    address,
    isConnected,
    bootstrapAgent,
    resetAccount,
    setAgentAddress,
    setAuthStatus,
    setOneClickEnabled,
    setWalletAddress,
  ]);

  const connectWallet = useCallback(() => {
    const injected = connectors[0];
    if (injected) connect({ connector: injected });
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    if (address) clearPersistedAgent(address);
    agentPrivateKeyRef.current = null;
    disconnect();
    resetAccount();
    setAuthStatus("disconnected");
    setOneClickEnabled(false);
    setBuilderFeeApproved(false);
  }, [address, disconnect, resetAccount, setAuthStatus, setOneClickEnabled]);

  const approveAgent = useCallback(async () => {
    if (!address || !agentAddress) {
      setAuthError("Connect wallet first");
      return false;
    }

    setAuthStatus("approving");
    setAuthError(null);

    try {
      const nonce = Date.now();
      const { signature, action } = await signApproveAgentWithWallet(
        address,
        agentAddress,
        nonce,
      );
      await syncWalletChainId();

      const res = await postApproveAgent(signature, action, nonce);
      if (res.status !== "ok") {
        throw new Error("Agent approval rejected");
      }

      const privateKey = agentPrivateKeyRef.current;
      markAgentApproved(address);

      setOneClickEnabled(true);
      setAuthStatus("agent_ready");
      await refreshAccount(address);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      setAuthStatus("connected");
      return false;
    }
  }, [
    address,
    agentAddress,
    refreshAccount,
    setAuthStatus,
    setOneClickEnabled,
    syncWalletChainId,
  ]);

  const approveBuilderFee = useCallback(async () => {
    if (!address) {
      setAuthError("Connect wallet first");
      return false;
    }

    setBuilderFeeApproving(true);
    setAuthError(null);

    try {
      const nonce = Date.now();
      const { signature, action } = await signApproveBuilderFeeWithWallet(address, nonce);
      await syncWalletChainId();

      const res = await postApproveBuilderFee(signature, action, nonce);
      if (res.status !== "ok") {
        throw new Error("Builder fee approval rejected");
      }

      await refreshBuilderFeeStatus(address);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    } finally {
      setBuilderFeeApproving(false);
    }
  }, [address, refreshBuilderFeeStatus, syncWalletChainId]);

  const switchToArbitrum = useCallback(async () => {
    setAuthError(null);
    const ok = await switchWalletToHyperliquidSigningChain();
    await syncWalletChainId();
    if (!ok) {
      setAuthError(
        "Could not switch networks. Open your wallet and select Arbitrum One manually.",
      );
    }
    return ok;
  }, [syncWalletChainId]);

  const executeOrderSigned = useCallback(
    async (params: ExecuteOrderParams) => {
      if (!AlphaFeatureFlags.isEnabled("execution")) {
        throw new Error("Execution paused by operator kill switch");
      }

      const pk = agentPrivateKeyRef.current;
      const terminal = useHyperliquidStore.getState();
      const executionMode = useDeskExecutionStore.getState().mode;
      const auth = executionAuthorizationEngine.authorize({
        walletAddress: address ?? null,
        claims: useProductionConfigStore.getState().claims,
        oneClickEnabled,
        connectionStatus: terminal.connectionStatus,
        lastMessageAt: terminal.lastMessageAt,
        markPx: terminal.book?.mid ?? null,
        operation: "place_order",
        executionMode,
        builderFeeApproved,
        isPerp: params.asset < 10_000,
      });
      if (!auth.allowed) {
        AuditLogEngine.logExecution(
          auth.auditAction,
          "denied",
          auth.reason,
          address ?? null,
          params.coin,
        );
        throw new Error(auth.reason);
      }

      const mark = params.markPx ?? terminal.book?.mid ?? null;
      if (executionMode === "paper") {
        if (mark == null || mark <= 0) throw new Error("Live price unavailable for paper fill");
        const audit = beginLiveExecutionAudit({
          action: "place_order",
          mode: "paper",
          coin: params.coin,
          side: params.isBuy ? "buy" : "sell",
          size: params.size,
          builderAttached: false,
          wallet: address ?? null,
        });
        setOrderPending(true);
        setOrderError(null);
        try {
          const fillPx = paperFillPrice(params, mark);
          useDeskExecutionStore.getState().recordPaperFill(params, fillPx);
          logLiveExecutionOutcome(
            {
              action: "place_order",
              mode: "paper",
              coin: params.coin,
              side: params.isBuy ? "buy" : "sell",
              size: params.size,
              builderAttached: false,
              wallet: address ?? null,
              outcome: "ok",
              traceId: audit.traceId,
              detail: `${audit.detailPrefix} | @ ${fillPx}`,
            },
            setLastExecutionEvent,
          );
          return { status: "ok" as const, response: { type: "paper" } };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Paper order failed";
          logLiveExecutionOutcome(
            {
              action: "place_order",
              mode: "paper",
              coin: params.coin,
              side: params.isBuy ? "buy" : "sell",
              size: params.size,
              builderAttached: false,
              wallet: address ?? null,
              outcome: "error",
              traceId: audit.traceId,
              detail: `${audit.detailPrefix} | ${message}`,
            },
            setLastExecutionEvent,
          );
          setOrderError(message);
          throw err;
        } finally {
          setOrderPending(false);
        }
      }

      if (!pk || !oneClickEnabled) {
        throw new Error("Enable 1-Click Trading (approve agent) first");
      }

      await ensureLiveAgentValid();

      setOrderPending(true);
      setOrderError(null);
      try {
        await ensureAssetIndexMaps();
        const asset =
          params.asset >= 0
            ? params.asset
            : await resolveAssetIndex(params.coin);
        const attachBuilder = builderFeeApproved && asset < 10_000;
        const audit = beginLiveExecutionAudit({
          action: "place_order",
          mode: "live",
          coin: params.coin,
          side: params.isBuy ? "buy" : "sell",
          size: params.size,
          builderAttached: attachBuilder,
          wallet: address ?? null,
        });
        const res = await executeOrder({ ...params, asset }, pk, { attachBuilder });
        const fillSummary = assertExchangeOk(res);
        logLiveExecutionOutcome(
          {
            action: "place_order",
            mode: "live",
            coin: params.coin,
            side: params.isBuy ? "buy" : "sell",
            size: params.size,
            builderAttached: attachBuilder,
            wallet: address ?? null,
            outcome: "ok",
            traceId: audit.traceId,
            detail: `${audit.detailPrefix}${fillSummary ? ` | ${fillSummary}` : ""}`,
          },
          setLastExecutionEvent,
        );
        if (address) await syncAccountAfterFill(address);
        return res;
      } catch (err) {
        const reject = err instanceof ExchangeRejectError ? err : null;
        const message = err instanceof Error ? err.message : "Order failed";
        const side = params.isBuy ? "buy" : "sell";
        const attachBuilder = builderFeeApproved && params.asset < 10_000;
        const audit = beginLiveExecutionAudit({
          action: "place_order",
          mode: "live",
          coin: params.coin,
          side,
          size: params.size,
          builderAttached: attachBuilder,
          wallet: address ?? null,
        });
        logLiveExecutionOutcome(
          {
            action: "place_order",
            mode: "live",
            coin: params.coin,
            side,
            size: params.size,
            builderAttached: attachBuilder,
            wallet: address ?? null,
            outcome: "error",
            traceId: audit.traceId,
            detail: `${audit.detailPrefix} | ${message}`,
            hint: reject?.hint ?? null,
          },
          setLastExecutionEvent,
        );
        setOrderError(reject?.hint ? `${message} — ${reject.hint}` : message);
        throw err;
      } finally {
        setOrderPending(false);
      }
    },
    [
      address,
      builderFeeApproved,
      ensureLiveAgentValid,
      oneClickEnabled,
      setLastExecutionEvent,
      syncAccountAfterFill,
      setOrderError,
      setOrderPending,
    ],
  );

  const closePositionMarket = useCallback(
    async (coin: string, assetIndex: number, size: number, markPx: number) => {
      if (!AlphaFeatureFlags.isEnabled("execution")) {
        throw new Error("Execution paused by operator kill switch");
      }

      const pk = agentPrivateKeyRef.current;
      const terminal = useHyperliquidStore.getState();
      const executionMode = useDeskExecutionStore.getState().mode;
      const auth = executionAuthorizationEngine.authorize({
        walletAddress: address ?? null,
        claims: useProductionConfigStore.getState().claims,
        oneClickEnabled,
        connectionStatus: terminal.connectionStatus,
        lastMessageAt: terminal.lastMessageAt,
        markPx,
        operation: "close_position",
        executionMode,
        builderFeeApproved,
        isPerp: assetIndex < 10_000,
      });
      if (!auth.allowed) {
        AuditLogEngine.logExecution(
          auth.auditAction,
          "denied",
          auth.reason,
          address ?? null,
          coin,
        );
        throw new Error(auth.reason);
      }

      const isBuy = size < 0;
      const closeSize = Math.abs(size);

      if (executionMode === "paper") {
        const audit = beginLiveExecutionAudit({
          action: "close_position",
          mode: "paper",
          coin,
          side: isBuy ? "buy" : "sell",
          size: closeSize,
          builderAttached: false,
          wallet: address ?? null,
        });
        setOrderPending(true);
        setOrderError(null);
        try {
          const fillPx = paperFillPrice(
            {
              coin,
              asset: assetIndex,
              isBuy,
              size: closeSize,
              mode: "market",
              markPx,
            },
            markPx,
          );
          useDeskExecutionStore.getState().recordPaperFill(
            {
              coin,
              asset: assetIndex,
              isBuy,
              size: closeSize,
              mode: "market",
              markPx,
            },
            fillPx,
          );
          logLiveExecutionOutcome(
            {
              action: "close_position",
              mode: "paper",
              coin,
              side: isBuy ? "buy" : "sell",
              size: closeSize,
              builderAttached: false,
              wallet: address ?? null,
              outcome: "ok",
              traceId: audit.traceId,
              detail: `${audit.detailPrefix} | @ ${fillPx}`,
            },
            setLastExecutionEvent,
          );
          return { status: "ok" as const, response: { type: "paper" } };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Paper close failed";
          logLiveExecutionOutcome(
            {
              action: "close_position",
              mode: "paper",
              coin,
              side: isBuy ? "buy" : "sell",
              size: closeSize,
              builderAttached: false,
              wallet: address ?? null,
              outcome: "error",
              traceId: audit.traceId,
              detail: `${audit.detailPrefix} | ${message}`,
            },
            setLastExecutionEvent,
          );
          setOrderError(message);
          throw err;
        } finally {
          setOrderPending(false);
        }
      }

      if (!pk || !oneClickEnabled) {
        throw new Error("Enable 1-Click Trading (approve agent) first");
      }

      await ensureLiveAgentValid();

      setOrderPending(true);
      setOrderError(null);
      try {
        const attachBuilder = builderFeeApproved && assetIndex < 10_000;
        const audit = beginLiveExecutionAudit({
          action: "close_position",
          mode: "live",
          coin,
          side: isBuy ? "buy" : "sell",
          size: closeSize,
          builderAttached: attachBuilder,
          wallet: address ?? null,
        });
        const res = await executeMarketClose(
          {
            coin,
            asset: assetIndex,
            isBuy,
            size: closeSize,
            markPx,
          },
          { attachBuilder },
        );
        const fillSummary = assertExchangeOk(res);
        logLiveExecutionOutcome(
          {
            action: "close_position",
            mode: "live",
            coin,
            side: isBuy ? "buy" : "sell",
            size: closeSize,
            builderAttached: attachBuilder,
            wallet: address ?? null,
            outcome: "ok",
            traceId: audit.traceId,
            detail: `${audit.detailPrefix}${fillSummary ? ` | ${fillSummary}` : ""}`,
          },
          setLastExecutionEvent,
        );
        if (address) await syncAccountAfterFill(address);
        return res;
      } catch (err) {
        const reject = err instanceof ExchangeRejectError ? err : null;
        const message = err instanceof Error ? err.message : "Close failed";
        const attachBuilder = builderFeeApproved && assetIndex < 10_000;
        const audit = beginLiveExecutionAudit({
          action: "close_position",
          mode: "live",
          coin,
          side: isBuy ? "buy" : "sell",
          size: closeSize,
          builderAttached: attachBuilder,
          wallet: address ?? null,
        });
        logLiveExecutionOutcome(
          {
            action: "close_position",
            mode: "live",
            coin,
            side: isBuy ? "buy" : "sell",
            size: closeSize,
            builderAttached: attachBuilder,
            wallet: address ?? null,
            outcome: "error",
            traceId: audit.traceId,
            detail: `${audit.detailPrefix} | ${message}`,
            hint: reject?.hint ?? null,
          },
          setLastExecutionEvent,
        );
        setOrderError(reject?.hint ? `${message} — ${reject.hint}` : message);
        throw err;
      } finally {
        setOrderPending(false);
      }
    },
    [
      address,
      builderFeeApproved,
      ensureLiveAgentValid,
      oneClickEnabled,
      setLastExecutionEvent,
      syncAccountAfterFill,
      setOrderError,
      setOrderPending,
    ],
  );

  const setAssetLeverage = useCallback(
    async (assetIndex: number, leverage: number, isCross = true) => {
      const pk = agentPrivateKeyRef.current;
      if (!pk || !oneClickEnabled) throw new Error("Enable 1-Click Trading first");
      setOrderPending(true);
      try {
        return await updateLeverage(assetIndex, leverage, isCross, pk);
      } finally {
        setOrderPending(false);
      }
    },
    [oneClickEnabled, setOrderPending],
  );

  const cancelOpenOrders = useCallback(
    async (orders: Array<{ coin: string; oid: number }>) => {
      if (!oneClickEnabled) throw new Error("Enable 1-Click Trading first");
      await ensureLiveAgentValid();
      const pk = agentPrivateKeyRef.current;
      if (!pk) throw new Error("No active agent session");
      setOrderPending(true);
      try {
        const cancels: Array<{ asset: number; oid: number }> = [];
        for (const o of orders) {
          const asset = await resolveAssetIndex(o.coin);
          cancels.push({ asset, oid: o.oid });
        }
        const res = await cancelOrders(cancels, pk);
        assertExchangeOk(res);
        if (address) await syncAccountAfterFill(address);
        AuditLogEngine.logExecution(
          "cancel_orders",
          "ok",
          `Cancelled ${orders.length} order(s)`,
          address ?? null,
          orders.map((o) => o.coin).join(","),
        );
        return res;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cancel failed";
        AuditLogEngine.logExecution(
          "cancel_orders",
          "error",
          message,
          address ?? null,
          orders.map((o) => o.coin).join(","),
        );
        setOrderError(message);
        throw err;
      } finally {
        setOrderPending(false);
      }
    },
    [
      address,
      ensureLiveAgentValid,
      oneClickEnabled,
      setOrderError,
      setOrderPending,
      syncAccountAfterFill,
    ],
  );

  return {
    address,
    isConnected,
    isConnecting: isConnecting || connectPending,
    authStatus,
    oneClickEnabled,
    agentAddress,
    authError,
    connectWallet,
    disconnectWallet,
    approveAgent,
    approveBuilderFee,
    executeOrder: executeOrderSigned,
    closePositionMarket,
    cancelOpenOrders,
    setAssetLeverage,
    refreshAccount,
    switchToArbitrum,
    isAuthorized: oneClickEnabled && authStatus === "agent_ready",
    builderFeeApproved,
    builderFeeApproving,
    walletChainId,
    needsArbitrumForAuth:
      isConnected &&
      walletChainId !== null &&
      walletChainId !== HL_SIGNATURE_CHAIN_ID,
  };
}
