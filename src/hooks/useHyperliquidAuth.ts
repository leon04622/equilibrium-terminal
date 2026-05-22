"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Address, Hex } from "viem";
import {
  createEphemeralAgent,
  executeMarketClose,
  executeOrder,
  getActiveAgent,
  markAgentApproved,
  postApproveAgent,
  updateLeverage,
} from "@/lib/hyperliquid/executor";
import { clearPersistedAgent, persistAgentSession } from "@/lib/hyperliquid/agent-session";
import { fetchClearinghouseState, verifyAgentForMaster } from "@/lib/hyperliquid/api";
import { HL_SIGNATURE_CHAIN_ID } from "@/lib/hyperliquid/constants";
import { ensureAssetIndexMaps, resolveAssetIndex } from "@/lib/asset-index";
import {
  readWalletChainId,
  signApproveAgentWithWallet,
  switchWalletToHyperliquidSigningChain,
} from "@/lib/wallet/hyperliquid-wallet";
import type { ExecuteOrderParams } from "@/types/exchange";
import { useHyperliquidStore } from "@/store/hyperliquidStore";

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
  const resetAccount = useHyperliquidStore((s) => s.resetAccount);
  const applyClearinghouse = useHyperliquidStore((s) => s.applyClearinghouse);

  const [authError, setAuthError] = useState<string | null>(null);

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

  const refreshAccount = useCallback(async (user: Address) => {
    const state = await fetchClearinghouseState(user);
    await applyClearinghouse(state, user);
  }, [applyClearinghouse]);

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
    },
    [refreshAccount, setAgentAddress, setAuthStatus, setOneClickEnabled],
  );

  useEffect(() => {
    if (!isConnected || !address) {
      agentPrivateKeyRef.current = null;
      setWalletAddress(null);
      setAgentAddress(null);
      setAuthStatus("disconnected");
      setOneClickEnabled(false);
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
      const pk = agentPrivateKeyRef.current;
      if (!pk || !oneClickEnabled) {
        throw new Error("Enable 1-Click Trading (approve agent) first");
      }

      setOrderPending(true);
      setOrderError(null);
      try {
        await ensureAssetIndexMaps();
        const asset =
          params.asset >= 0
            ? params.asset
            : await resolveAssetIndex(params.coin);
        const res = await executeOrder({ ...params, asset }, pk);
        if (res.status !== "ok") throw new Error("Order rejected by exchange");
        if (address) await refreshAccount(address);
        return res;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Order failed";
        setOrderError(message);
        throw err;
      } finally {
        setOrderPending(false);
      }
    },
    [address, oneClickEnabled, refreshAccount, setOrderError, setOrderPending],
  );

  const closePositionMarket = useCallback(
    async (coin: string, assetIndex: number, size: number, markPx: number) => {
      const pk = agentPrivateKeyRef.current;
      if (!pk || !oneClickEnabled) {
        throw new Error("Enable 1-Click Trading first");
      }
      const isBuy = size < 0;
      setOrderPending(true);
      setOrderError(null);
      try {
        const res = await executeMarketClose({
          coin,
          asset: assetIndex,
          isBuy,
          size: Math.abs(size),
          markPx,
        });
        if (res.status !== "ok") throw new Error("Close order rejected");
        if (address) await refreshAccount(address);
        return res;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Close failed";
        setOrderError(message);
        throw err;
      } finally {
        setOrderPending(false);
      }
    },
    [address, oneClickEnabled, refreshAccount, setOrderError, setOrderPending],
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
    executeOrder: executeOrderSigned,
    closePositionMarket,
    setAssetLeverage,
    refreshAccount,
    switchToArbitrum,
    isAuthorized: oneClickEnabled && authStatus === "agent_ready",
    walletChainId,
    needsArbitrumForAuth:
      isConnected &&
      walletChainId !== null &&
      walletChainId !== HL_SIGNATURE_CHAIN_ID,
  };
}
