import type { TeamRole, SubscriptionTier, UserSessionState } from "@/types/production-platform";

export interface StoredSession {
  state: UserSessionState;
  refreshToken: string;
}

const sessions = new Map<string, StoredSession>();
const refreshIndex = new Map<string, string>();

function tierForWallet(wallet: string): SubscriptionTier {
  const hash = wallet.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  if (hash % 11 === 0) return "enterprise";
  if (hash % 5 === 0) return "team";
  return "desk";
}

function rolesForTier(tier: SubscriptionTier): TeamRole[] {
  if (tier === "enterprise") return ["admin", "trader"];
  if (tier === "team") return ["trader", "analyst"];
  return ["analyst"];
}

export function createUserSession(walletAddress: string): UserSessionState {
  const normalized = walletAddress.toLowerCase();
  const tier = tierForWallet(normalized);
  const now = Date.now();
  return {
    sessionId: `sess_${now}_${normalized.slice(2, 10)}`,
    userId: `usr_${normalized.slice(2, 12)}`,
    walletAddress: normalized,
    issuedAt: now,
    expiresAt: now + 86_400_000,
    roles: rolesForTier(tier),
    tier,
    workspaceId: `ws_${normalized.slice(2, 14)}`,
    lastVerifiedAt: now,
  };
}

export function persistSession(state: UserSessionState, refreshToken: string): void {
  sessions.set(state.sessionId, { state, refreshToken });
  refreshIndex.set(refreshToken, state.sessionId);
}

export function getSession(sessionId: string): StoredSession | null {
  return sessions.get(sessionId) ?? null;
}

export function getSessionByRefresh(refreshToken: string): StoredSession | null {
  const sessionId = refreshIndex.get(refreshToken);
  if (!sessionId) return null;
  return sessions.get(sessionId) ?? null;
}

export function touchSession(sessionId: string): UserSessionState | null {
  const row = sessions.get(sessionId);
  if (!row) return null;
  row.state.lastVerifiedAt = Date.now();
  sessions.set(sessionId, row);
  return row.state;
}

export function revokeSession(sessionId: string): void {
  const row = sessions.get(sessionId);
  if (!row) return;
  refreshIndex.delete(row.refreshToken);
  sessions.delete(sessionId);
}
