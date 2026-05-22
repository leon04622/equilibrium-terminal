import type { HlClearinghouseState } from "@/types/account";
import type { HlAllMids, HlPerpMeta, HlSpotMeta } from "@/types/hyperliquid";
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

export function fetchClearinghouseState(user: string): Promise<HlClearinghouseState> {
  return postInfo<HlClearinghouseState>({ type: "clearinghouseState", user });
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
