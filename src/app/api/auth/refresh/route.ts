import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { appendAudit } from "@/lib/security/server/auditStore";
import {
  authEngine,
  buildGuardContext,
  enforceRateLimit,
  verifyRefreshToken,
} from "@/lib/security/ApiSecurityGuard";
import {
  getSessionByRefresh,
  rotateRefresh,
  touchSession,
} from "@/lib/infrastructure/server/sessionStore";
import { touchDevice } from "@/lib/security/server/deviceSessionStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "auth_refresh", 30, 60_000);
  if (limited) return limited;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("eq_refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "refresh_required" }, { status: 401 });
  }

  const parsed = await verifyRefreshToken(refreshToken);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_refresh" }, { status: 401 });
  }

  const stored = getSessionByRefresh(refreshToken);
  if (!stored || stored.state.sessionId !== parsed.sid) {
    return NextResponse.json({ error: "session_revoked" }, { status: 401 });
  }

  const tokens = await authEngine.mintTokenBundle(stored.state);
  rotateRefresh(stored.state.sessionId, tokens.refreshToken);
  touchSession(stored.state.sessionId);
  touchDevice(stored.state.sessionId, ctx.deviceId);

  appendAudit({
    category: "auth",
    action: "token_rotate",
    actorWallet: stored.state.walletAddress,
    sessionId: stored.state.sessionId,
    resource: "jwt",
    outcome: "ok",
    detail: "refresh rotation",
    traceId: ctx.traceId,
  });

  const response = NextResponse.json({
    claims: tokens.claims,
    session: touchSession(stored.state.sessionId),
  });

  response.cookies.set("eq_session", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });
  response.cookies.set("eq_refresh", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86_400 * 7,
  });

  return response;
}
