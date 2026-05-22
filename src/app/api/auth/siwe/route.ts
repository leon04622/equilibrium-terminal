import { NextResponse } from "next/server";
import type { Address, Hex } from "viem";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { getJwtSecret } from "@/lib/infrastructure/jwt";
import {
  createUserSession,
  persistSession,
} from "@/lib/infrastructure/server/sessionStore";

export const runtime = "nodejs";

const authEngine = new AuthEngine({ jwtSecret: getJwtSecret() });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address") as Address | null;
  const chainId = Number.parseInt(url.searchParams.get("chainId") ?? "42161", 10);

  if (!address || !address.startsWith("0x")) {
    return NextResponse.json({ error: "address_required" }, { status: 400 });
  }

  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const challenge = authEngine.createSiweChallenge(
    address,
    host,
    `${protocol}://${host}`,
    chainId,
  );

  return NextResponse.json(challenge);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      signature?: Hex;
    };

    if (!body.message || !body.signature) {
      return NextResponse.json({ error: "message_and_signature_required" }, { status: 400 });
    }

    const verified = await authEngine.verifySiweSignature({
      message: body.message,
      signature: body.signature,
    });

    if (!verified.valid || !verified.address) {
      return NextResponse.json({ error: verified.error ?? "verification_failed" }, { status: 401 });
    }

    const session = createUserSession(verified.address);
    const tokens = await authEngine.mintTokenBundle(session);
    persistSession(session, tokens.refreshToken);

    const response = NextResponse.json({
      session,
      claims: tokens.claims,
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
  } catch {
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
