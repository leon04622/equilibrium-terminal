import type { HlClearinghouseState, HlSpotClearinghouseState } from "@/types/account";
import type {
  HlAllMids,
  HlPerpAssetCtx,
  HlPerpDex,
  HlPerpMeta,
  HlSpotAssetCtx,
  HlSpotMeta,
} from "@/types/hyperliquid";
import type { HlReferralState } from "@/types/hyperliquid-referral";
import { HL_INFO_HTTP_URL } from "@/lib/hyperliquid/constants";

async function postInfo<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(HL_INFO_HTTP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Hyperliquid info error: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchPerpMeta(): Promise<HlPerpMeta> {
  return postInfo<HlPerpMeta>({ type: "meta" });
}

export function fetchSpotMeta(): Promise<HlSpotMeta> {
  return postInfo<HlSpotMeta>({ type: "spotMeta" });
}

export function fetchPerpDexs(): Promise<Array<HlPerpDex | null>> {
  return postInfo<Array<HlPerpDex | null>>({ type: "perpDexs" });
}

export function fetchAllPerpMetas(): Promise<HlPerpMeta[]> {
  return postInfo<HlPerpMeta[]>({ type: "allPerpMetas" });
}

export function fetchMetaAndAssetCtxs(dex?: string): Promise<[HlPerpMeta, HlPerpAssetCtx[]]> {
  const body: Record<string, unknown> = { type: "metaAndAssetCtxs" };
  if (dex) body.dex = dex;
  return postInfo(body);
}

export function fetchSpotMetaAndAssetCtxs(): Promise<[HlSpotMeta, HlSpotAssetCtx[]]> {
  return postInfo<[HlSpotMeta, HlSpotAssetCtx[]]>({ type: "spotMetaAndAssetCtxs" });
}

export function fetchClearinghouseState(user: string): Promise<HlClearinghouseState> {
  return postInfo<HlClearinghouseState>({ type: "clearinghouseState", user });
}

export function fetchSpotClearinghouseState(user: string): Promise<HlSpotClearinghouseState> {
  return postInfo<HlSpotClearinghouseState>({ type: "spotClearinghouseState", user });
}

export function fetchAllMids(): Promise<HlAllMids> {
  return postInfo<HlAllMids>({ type: "allMids" });
}

export interface HlUserRoleAgent {
  role: "agent";
  data: { user: string };
}

export type HlUserRole =
  | HlUserRoleAgent
  | { role: "user" | "missing" | "vault" | "subAccount" };

export function fetchUserRole(user: string): Promise<HlUserRole> {
  return postInfo<HlUserRole>({ type: "userRole", user });
}

export async function verifyAgentForMaster(
  agentAddress: string,
  masterAddress: string,
): Promise<boolean> {
  try {
    const role = await fetchUserRole(agentAddress);
    if (role.role !== "agent") return false;
    return role.data.user.toLowerCase() === masterAddress.toLowerCase();
  } catch {
    return false;
  }
}

export async function fetchMaxBuilderFee(user: string, builder: string): Promise<number> {
  const value = await postInfo<number | string>({
    type: "maxBuilderFee",
    user: user.toLowerCase(),
    builder: builder.toLowerCase(),
  });
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function fetchBuilderReferralState(builder: string): Promise<HlReferralState> {
  return postInfo<HlReferralState>({
    type: "referral",
    user: builder.toLowerCase(),
  });
}

export interface HlFrontendOpenOrder {
  coin: string;
  side: "B" | "A";
  limitPx: string;
  sz: string;
  oid: number;
  timestamp: number;
  origSz: string;
  orderType?: string;
  reduceOnly?: boolean;
}

export interface HlUserFill {
  coin: string;
  px: string;
  sz: string;
  side: "B" | "A";
  time: number;
  closedPnl: string;
  fee: string;
  crossed: boolean;
  dir: string;
  hash: string;
  oid: number;
  tid: number;
}

export function fetchFrontendOpenOrders(user: string): Promise<HlFrontendOpenOrder[]> {
  return postInfo<HlFrontendOpenOrder[]>({ type: "frontendOpenOrders", user });
}

export function fetchUserFills(user: string): Promise<HlUserFill[]> {
  return postInfo<HlUserFill[]>({ type: "userFills", user });
}
