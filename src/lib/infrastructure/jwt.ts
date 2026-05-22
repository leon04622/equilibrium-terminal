import type { AuthSessionClaims } from "@/types/production-platform";

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

export interface JwtVerifyResult {
  valid: boolean;
  claims: AuthSessionClaims | null;
  error: string | null;
}

export async function signJwt(
  claims: Omit<AuthSessionClaims, "iat" | "exp">,
  secret: string,
  ttlSec: number,
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSessionClaims = {
    ...claims,
    iat: now,
    exp: now + ttlSec,
  };
  const headerPart = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = await hmacSha256(secret, signingInput);
  const signaturePart = base64UrlEncode(signature);
  return `${signingInput}.${signaturePart}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JwtVerifyResult> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, claims: null, error: "malformed_token" };
  }
  const [headerPart, payloadPart, signaturePart] = parts;
  if (!headerPart || !payloadPart || !signaturePart) {
    return { valid: false, claims: null, error: "malformed_token" };
  }

  const signingInput = `${headerPart}.${payloadPart}`;
  const expected = await hmacSha256(secret, signingInput);
  const provided = base64UrlDecode(signaturePart);
  if (!timingSafeEqual(expected, provided)) {
    return { valid: false, claims: null, error: "invalid_signature" };
  }

  let claims: AuthSessionClaims;
  try {
    claims = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadPart)),
    ) as AuthSessionClaims;
  } catch {
    return { valid: false, claims: null, error: "invalid_payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== "number" || claims.exp <= now) {
    return { valid: false, claims: null, error: "token_expired" };
  }

  return { valid: true, claims, error: null };
}

export function getJwtSecret(): string {
  const fromEnv = process.env.EQUILIBRIUM_JWT_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  return "equilibrium-dev-jwt-secret-min-32-chars!!";
}
