import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { SecretsVault } from "@/lib/security/SecretsVault";
import { appendAudit } from "@/lib/security/server/auditStore";
import { checkRateLimit } from "@/lib/security/server/rateLimitStore";
import { recordThreat } from "@/lib/security/server/threatStore";
import { RbacEngine } from "@/lib/security/RbacEngine";
import { createTraceId } from "@/lib/security/AuditLogEngine";
import type { AuthSessionClaims } from "@/types/production-platform";
import type { SecurityPermission } from "@/types/security-trust";

const authEngine = new AuthEngine({ jwtSecret: SecretsVault.jwtSecret() });

export function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) h = (h * 31 + ip.charCodeAt(i)) | 0;
  return `ip_${Math.abs(h).toString(36)}`;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local"
  );
}

export function deviceIdFromRequest(request: Request): string {
  const ua = request.headers.get("user-agent") ?? "unknown";
  return `dev_${hashIp(ua).slice(0, 12)}`;
}

export interface GuardContext {
  traceId: string;
  ip: string;
  ipHash: string;
  deviceId: string;
}

export function buildGuardContext(request: Request): GuardContext {
  const ip = clientIp(request);
  return {
    traceId: createTraceId(),
    ip,
    ipHash: hashIp(ip),
    deviceId: deviceIdFromRequest(request),
  };
}

export function enforceRateLimit(
  ctx: GuardContext,
  route: string,
  limit = 60,
  windowMs = 60_000,
): NextResponse | null {
  const key = `${route}:${ctx.ipHash}`;
  const result = checkRateLimit(key, limit, windowMs);
  if (result.allowed) return null;

  recordThreat("rate_limit", "watch", `Rate limit · ${route}`, ctx.ipHash);
  appendAudit({
    category: "api",
    action: `rate_limit:${route}`,
    actorWallet: null,
    sessionId: null,
    resource: route,
    outcome: "denied",
    detail: ctx.ipHash,
    traceId: ctx.traceId,
  });

  return NextResponse.json(
    { error: "rate_limit_exceeded", traceId: ctx.traceId },
    { status: 429, headers: { "x-eq-trace": ctx.traceId } },
  );
}

export async function requireSession(
  permission?: SecurityPermission,
): Promise<
  | { claims: AuthSessionClaims; error: null }
  | { claims: null; error: NextResponse }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  if (!token) {
    return {
      claims: null,
      error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  const claims = await authEngine.verifyAccessToken(token);
  if (!claims) {
    return {
      claims: null,
      error: NextResponse.json({ error: "invalid_session" }, { status: 401 }),
    };
  }

  if (permission) {
    const rbac = RbacEngine.authorize(claims, permission);
    if (!rbac.allowed) {
      return {
        claims: null,
        error: NextResponse.json({ error: rbac.reason }, { status: 403 }),
      };
    }
  }

  return { claims, error: null };
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ sid: string; sub: string } | null> {
  const { verifyJwt } = await import("@/lib/infrastructure/jwt");
  const refresh = await verifyJwt(token, SecretsVault.jwtSecret());
  if (!refresh.valid || !refresh.claims) return null;
  if (!refresh.claims.sub.endsWith(":refresh")) return null;
  return {
    sid: refresh.claims.sid,
    sub: refresh.claims.sub.replace(/:refresh$/, ""),
  };
}

export { authEngine };
