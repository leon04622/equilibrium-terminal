import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { getJwtSecret } from "@/lib/infrastructure/jwt";
import { revokeSession } from "@/lib/infrastructure/server/sessionStore";

export const runtime = "nodejs";

const authEngine = new AuthEngine({ jwtSecret: getJwtSecret() });

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  if (token) {
    const claims = await authEngine.verifyAccessToken(token);
    if (claims?.sid) {
      revokeSession(claims.sid);
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("eq_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set("eq_refresh", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
