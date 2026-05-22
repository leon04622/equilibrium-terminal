import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { getJwtSecret } from "@/lib/infrastructure/jwt";
import { getSession, touchSession } from "@/lib/infrastructure/server/sessionStore";

export const runtime = "nodejs";

const authEngine = new AuthEngine({ jwtSecret: getJwtSecret() });

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const claims = await authEngine.verifyAccessToken(token);
  if (!claims) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const stored = getSession(claims.sid);
  if (stored) {
    touchSession(claims.sid);
  }

  return NextResponse.json({
    authenticated: true,
    claims,
    session: stored?.state ?? null,
    health: authEngine.sessionHealthFromClaims(claims),
  });
}
