import { NextResponse } from "next/server";
import type { Address, Hex } from "viem";
import {
  authEngine,
  buildGuardContext,
  enforceRateLimit,
} from "@/lib/security/ApiSecurityGuard";
import { appendAudit } from "@/lib/security/server/auditStore";
import { registerDevice } from "@/lib/security/server/deviceSessionStore";
import { recordAuthFailure, recordThreat } from "@/lib/security/server/threatStore";
import {
  createUserSession,
  persistSession,
} from "@/lib/infrastructure/server/sessionStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "auth_siwe_challenge", 40, 60_000);
  if (limited) return limited;

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

  return NextResponse.json(challenge, { headers: { "x-eq-trace": ctx.traceId } });
}

export async function POST(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "auth_siwe_verify", 20, 60_000);
  if (limited) return limited;

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
      const fails = recordAuthFailure(`${ctx.ipHash}:${verified.error ?? "fail"}`);
      appendAudit({
        category: "auth",
        action: "siwe_verify",
        actorWallet: null,
        sessionId: null,
        resource: "siwe",
        outcome: "denied",
        detail: verified.error ?? "verification_failed",
        traceId: ctx.traceId,
      });
      if (fails >= 6) {
        recordThreat(
          "credential_stuffing",
          "watch",
          "Repeated SIWE failures",
          ctx.ipHash,
        );
      }
      return NextResponse.json({ error: verified.error ?? "verification_failed" }, { status: 401 });
    }

    const session = createUserSession(verified.address);
    const tokens = await authEngine.mintTokenBundle(session);
    persistSession(session, tokens.refreshToken);

    registerDevice({
      deviceId: ctx.deviceId,
      sessionId: session.sessionId,
      walletAddress: session.walletAddress,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      ipHash: ctx.ipHash,
    });

    appendAudit({
      category: "auth",
      action: "siwe_login",
      actorWallet: session.walletAddress,
      sessionId: session.sessionId,
      resource: "session",
      outcome: "ok",
      detail: `device ${ctx.deviceId}`,
      traceId: ctx.traceId,
    });

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
    appendAudit({
      category: "auth",
      action: "siwe_verify",
      actorWallet: null,
      sessionId: null,
      resource: "siwe",
      outcome: "error",
      detail: "internal_error",
      traceId: ctx.traceId,
    });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
