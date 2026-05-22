import type { Address, Hex } from "viem";
import { verifyMessage } from "viem";
import {
  DEFAULT_PERMISSION_MATRIX,
  ENTITLEMENTS_BY_TIER,
  type AuthSessionClaims,
  type EntitlementMatrix,
  type TeamPermissionMatrix,
  type TeamRole,
  type UserSessionState,
} from "@/types/production-platform";
import { signJwt, verifyJwt } from "@/lib/infrastructure/jwt";
import { buildSiweMessage, createSiweNonce, parseSiweMessage, type SiweMessageFields } from "@/lib/infrastructure/siwe";

export const SESSION_COOKIE = "eq_session";
export const REFRESH_COOKIE = "eq_refresh";

export interface SiweChallenge {
  nonce: string;
  message: string;
  expiresAt: number;
}

export interface SiweVerifyInput {
  message: string;
  signature: Hex;
}

export interface AuthTokenBundle {
  accessToken: string;
  refreshToken: string;
  claims: AuthSessionClaims;
}

export interface SessionVerificationFilter {
  /** JWT workspace identity */
  workspaceId: string;
  /** Optional ephemeral agent key fingerprint — must not be persisted server-side */
  agentKeyFingerprint?: string | null;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reason: string;
  permissions: TeamPermissionMatrix[TeamRole];
  entitlements: EntitlementMatrix;
}

const challengeCache = new Map<string, { fields: SiweMessageFields; expiresAt: number }>();

export class AuthEngine {
  private readonly jwtSecret: string;
  private readonly accessTtlSec: number;
  private readonly refreshTtlSec: number;

  constructor(options?: { jwtSecret?: string; accessTtlSec?: number; refreshTtlSec?: number }) {
    this.jwtSecret = options?.jwtSecret ?? "equilibrium-dev-jwt-secret-min-32-chars!!";
    this.accessTtlSec = options?.accessTtlSec ?? 3600;
    this.refreshTtlSec = options?.refreshTtlSec ?? 86_400 * 7;
  }

  createSiweChallenge(
    address: Address,
    domain: string,
    uri: string,
    chainId: number,
  ): SiweChallenge {
    const nonce = createSiweNonce();
    const issuedAt = new Date();
    const expirationTime = new Date(issuedAt.getTime() + 10 * 60_000);
    const fields: SiweMessageFields = {
      domain,
      address,
      statement: "Sign in to Equilibrium Terminal Production Platform (2026).",
      uri,
      version: "1",
      chainId,
      nonce,
      issuedAt: issuedAt.toISOString(),
      expirationTime: expirationTime.toISOString(),
    };
    const message = buildSiweMessage(fields);
    challengeCache.set(nonce, { fields, expiresAt: expirationTime.getTime() });
    return { nonce, message, expiresAt: expirationTime.getTime() };
  }

  async verifySiweSignature(input: SiweVerifyInput): Promise<{
    valid: boolean;
    address: Address | null;
    error: string | null;
  }> {
    const parsed = parseSiweMessage(input.message);
    if (!parsed.address || !parsed.nonce) {
      return { valid: false, address: null, error: "invalid_message" };
    }

    const cached = challengeCache.get(parsed.nonce);
    if (!cached) {
      return { valid: false, address: null, error: "unknown_nonce" };
    }
    if (Date.now() > cached.expiresAt) {
      challengeCache.delete(parsed.nonce);
      return { valid: false, address: null, error: "challenge_expired" };
    }

    if (cached.fields.address.toLowerCase() !== parsed.address.toLowerCase()) {
      return { valid: false, address: null, error: "address_mismatch" };
    }

    const valid = await verifyMessage({
      address: parsed.address,
      message: input.message,
      signature: input.signature,
    });

    if (!valid) {
      return { valid: false, address: null, error: "bad_signature" };
    }

    challengeCache.delete(parsed.nonce);
    return { valid: true, address: parsed.address, error: null };
  }

  buildClaimsFromSession(session: UserSessionState): Omit<AuthSessionClaims, "iat" | "exp"> {
    return {
      sub: session.userId,
      sid: session.sessionId,
      wallet: session.walletAddress,
      workspaceId: session.workspaceId,
      roles: session.roles,
      tier: session.tier,
    };
  }

  async mintTokenBundle(session: UserSessionState): Promise<AuthTokenBundle> {
    const claimsBase = this.buildClaimsFromSession(session);
    const accessToken = await signJwt(claimsBase, this.jwtSecret, this.accessTtlSec);
    const refreshToken = await signJwt(
      { ...claimsBase, sub: `${claimsBase.sub}:refresh` },
      this.jwtSecret,
      this.refreshTtlSec,
    );
    const verified = await verifyJwt(accessToken, this.jwtSecret);
    if (!verified.valid || !verified.claims) {
      throw new Error("Failed to mint access token");
    }
    return {
      accessToken,
      refreshToken,
      claims: verified.claims,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthSessionClaims | null> {
    const result = await verifyJwt(token, this.jwtSecret);
    if (!result.valid || !result.claims) return null;
    if (result.claims.sub.includes(":refresh")) return null;
    return result.claims;
  }

  /**
   * Decouples workspace JWT identity from ephemeral trading agent parameters.
   * Trading keys never pass through this filter — only configuration authorization.
   */
  authorizeWorkspaceAction(
    claims: AuthSessionClaims,
    filter: SessionVerificationFilter,
    action: keyof TeamPermissionMatrix["admin"],
  ): AuthorizationDecision {
    const primaryRole = claims.roles[0] ?? "analyst";
    const permissions = DEFAULT_PERMISSION_MATRIX[primaryRole];
    const entitlements = ENTITLEMENTS_BY_TIER[claims.tier];

    if (claims.workspaceId !== filter.workspaceId) {
      return {
        allowed: false,
        reason: "workspace_mismatch",
        permissions,
        entitlements,
      };
    }

    if (filter.agentKeyFingerprint) {
      return {
        allowed: false,
        reason: "agent_key_must_not_route_through_config_api",
        permissions,
        entitlements,
      };
    }

    const allowed = permissions[action];
    return {
      allowed,
      reason: allowed ? "ok" : "insufficient_role",
      permissions,
      entitlements,
    };
  }

  isFeatureEntitled(claims: AuthSessionClaims, feature: keyof EntitlementMatrix): boolean {
    const entitlements = ENTITLEMENTS_BY_TIER[claims.tier];
    const value = entitlements[feature];
    return typeof value === "boolean" ? value : true;
  }

  sessionHealthFromClaims(claims: AuthSessionClaims | null): "healthy" | "jwt_expiring" | "jwt_invalid" {
    if (!claims) return "jwt_invalid";
    const remaining = claims.exp - Math.floor(Date.now() / 1000);
    if (remaining <= 0) return "jwt_invalid";
    if (remaining < 300) return "jwt_expiring";
    return "healthy";
  }
}

export const productionAuthEngine = new AuthEngine();
