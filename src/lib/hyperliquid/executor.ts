/**
 * Hyperliquid ephemeral agent executor — one-click L1 order placement.
 * Session key lives in memory (+ optional localStorage persist).
 */

import type { Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  AGENT_NAME,
  getMemoryAgentSession,
  loadPersistedAgent,
  persistAgentSession,
  setMemoryAgentSession,
  type AgentSession,
} from "@/lib/hyperliquid/agent-session";
import { HL_EXCHANGE_URL, MARKET_SLIPPAGE } from "@/lib/hyperliquid/constants";
import {
  buildApproveAgentTypedData,
  floatToWire,
  normalizeWalletSignature,
  signL1Action,
  slippagePrice,
  timestampMs,
} from "@/lib/hyperliquid/signing";
import { getSzDecimals, resolveAssetIndex } from "@/lib/hyperliquid/asset-index";
import type {
  ExecuteOrderParams,
  HlApproveAgentAction,
  HlExchangeRequest,
  HlExchangeResponse,
  HlL1Action,
  HlOrderAction,
  HlOrderWire,
  HlSignature,
  OrderRequest,
} from "@/types/exchange";

export type { ExecuteOrderParams, AgentSession };
export { AGENT_NAME } from "@/lib/hyperliquid/agent-session";
export { buildApproveAgentTypedData, normalizeWalletSignature, floatToWire } from "@/lib/hyperliquid/signing";

export function createEphemeralAgent(masterAddress: Address): AgentSession {
  const existing = getMemoryAgentSession() ?? loadPersistedAgent(masterAddress);
  if (existing && existing.masterAddress.toLowerCase() === masterAddress.toLowerCase()) {
    setMemoryAgentSession(existing);
    return existing;
  }
  const agentPrivateKey = generatePrivateKey();
  const account = privateKeyToAccount(agentPrivateKey);
  const session: AgentSession = {
    masterAddress,
    agentPrivateKey,
    agentAddress: account.address,
    agentName: AGENT_NAME,
    approvedAt: 0,
  };
  persistAgentSession(session);
  return session;
}

export function getActiveAgent(): AgentSession | null {
  return getMemoryAgentSession();
}

export function markAgentApproved(masterAddress: Address): void {
  const session = getMemoryAgentSession() ?? loadPersistedAgent(masterAddress);
  if (!session) return;
  session.approvedAt = Date.now();
  persistAgentSession(session);
}

export async function postExchange(
  body: HlExchangeRequest,
): Promise<HlExchangeResponse> {
  const res = await fetch(HL_EXCHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as HlExchangeResponse;
  if (!res.ok) {
    throw new Error(
      typeof json.response === "string"
        ? json.response
        : `Exchange HTTP ${res.status}`,
    );
  }
  return json;
}

export function sanitizeOrderSize(size: number, szDecimals: number): string {
  return floatToWire(Number(size.toFixed(szDecimals)));
}

export function sanitizePrice(price: number, szDecimals: number, isSpot: boolean): string {
  const places = Math.max(0, (isSpot ? 8 : 6) - szDecimals);
  return floatToWire(Number(price.toFixed(places)));
}

export function orderRequestToWire(order: OrderRequest): HlOrderWire {
  return {
    a: order.asset,
    b: order.isBuy,
    p: floatToWire(order.limitPx),
    s: floatToWire(order.size),
    r: order.reduceOnly,
    t: order.orderType,
  };
}

export function buildOrderAction(orders: OrderRequest[]): HlOrderAction {
  return {
    type: "order",
    orders: orders.map(orderRequestToWire),
    grouping: "na",
  };
}

async function postL1Action(
  privateKey: Hex,
  action: HlL1Action,
  vaultAddress: Address | null = null,
): Promise<HlExchangeResponse> {
  const nonce = timestampMs();
  const signature = await signL1Action(privateKey, action, vaultAddress, nonce, null);
  return postExchange({ action, nonce, signature });
}

export async function postApproveAgent(
  signature: HlSignature,
  action: HlApproveAgentAction,
  nonce: number,
): Promise<HlExchangeResponse> {
  return postExchange({ action, nonce, signature });
}

export interface ExecuteOrderOptions extends ExecuteOrderParams {
  /** Attach TP trigger (reduce-only). */
  takeProfitPx?: number;
  /** Attach SL trigger (reduce-only). */
  stopLossPx?: number;
}

export async function executeOrder(
  params: ExecuteOrderOptions,
  agentKey?: Hex,
): Promise<HlExchangeResponse> {
  const pk = agentKey ?? getMemoryAgentSession()?.agentPrivateKey;
  if (!pk) throw new Error("No active agent session — approve agent first");

  const szDecimals =
    params.szDecimals ?? (await getSzDecimals(params.asset));
  const isSpot = params.asset >= 10_000;
  const mark = params.markPx;
  if (!mark || mark <= 0) throw new Error("Mark price unavailable");

  let limitPx: number;
  let orderType: OrderRequest["orderType"];

  if (params.mode === "market") {
    limitPx = slippagePrice(mark, params.isBuy, MARKET_SLIPPAGE, szDecimals, isSpot);
    orderType = { limit: { tif: "Ioc" } };
  } else if (params.mode === "limit") {
    if (!params.limitPx || params.limitPx <= 0) throw new Error("Limit price required");
    limitPx = params.limitPx;
    orderType = { limit: { tif: "Gtc" } };
  } else {
    if (!params.stopPx || params.stopPx <= 0) throw new Error("Stop trigger required");
    limitPx = slippagePrice(mark, params.isBuy, MARKET_SLIPPAGE, szDecimals, isSpot);
    orderType = {
      trigger: {
        isMarket: true,
        triggerPx: floatToWire(params.stopPx),
        tpsl: params.isBuy ? "sl" : "tp",
      },
    };
  }

  const orders: OrderRequest[] = [
    {
      asset: params.asset,
      coin: params.coin,
      isBuy: params.isBuy,
      size: params.size,
      limitPx,
      reduceOnly: params.reduceOnly ?? false,
      orderType,
    },
  ];

  if (params.takeProfitPx && params.takeProfitPx > 0) {
    orders.push({
      asset: params.asset,
      coin: params.coin,
      isBuy: !params.isBuy,
      size: params.size,
      limitPx: params.takeProfitPx,
      reduceOnly: true,
      orderType: {
        trigger: {
          isMarket: true,
          triggerPx: floatToWire(params.takeProfitPx),
          tpsl: "tp",
        },
      },
    });
  }

  if (params.stopLossPx && params.stopLossPx > 0) {
    orders.push({
      asset: params.asset,
      coin: params.coin,
      isBuy: !params.isBuy,
      size: params.size,
      limitPx: params.stopLossPx,
      reduceOnly: true,
      orderType: {
        trigger: {
          isMarket: true,
          triggerPx: floatToWire(params.stopLossPx),
          tpsl: "sl",
        },
      },
    });
  }

  const action = buildOrderAction(orders);
  return postL1Action(pk, action);
}

export async function executeMarketClose(params: {
  coin: string;
  asset?: number;
  isBuy: boolean;
  size: number;
  markPx: number;
  szDecimals?: number;
}): Promise<HlExchangeResponse> {
  const asset = params.asset ?? (await resolveAssetIndex(params.coin));
  return executeOrder({
    coin: params.coin,
    asset,
    isBuy: params.isBuy,
    size: params.size,
    mode: "market",
    reduceOnly: true,
    markPx: params.markPx,
    szDecimals: params.szDecimals,
  });
}

export async function updateLeverage(
  asset: number,
  leverage: number,
  isCross = true,
  agentKey?: Hex,
): Promise<HlExchangeResponse> {
  const pk = agentKey ?? getMemoryAgentSession()?.agentPrivateKey;
  if (!pk) throw new Error("No active agent session");
  return postL1Action(pk, {
    type: "updateLeverage",
    asset,
    isCross,
    leverage,
  });
}
