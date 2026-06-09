import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authEngine } from "@/lib/security/ApiSecurityGuard";
import { appendAudit } from "@/lib/security/server/auditStore";
import { revokeDevicesForSession } from "@/lib/security/server/deviceSessionStore";
import { revokeSession } from "@/lib/infrastructure/server/sessionStore";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  if (token) {
    const claims = await authEngine.verifyAccessToken(token);
    if (claims?.sid) {
      revokeSession(claims.sid);
      revokeDevicesForSession(claims.sid);
      appendAudit({
        category: "auth",
        action: "logout",
        actorWallet: claims.wallet,
        sessionId: claims.sid,
        resource: "session",
        outcome: "ok",
        detail: "session revoked",
        traceId: `tr_logout_${Date.now()}`,
      });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("eq_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("eq_refresh", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
