import { createHmac } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(h)) return true;
  if (h.endsWith(".local")) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

function validateWebhookUrl(raw: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "unsupported_protocol" };
  }
  if (isPrivateHost(parsed.hostname)) {
    return { ok: false, reason: "blocked_host" };
  }
  return { ok: true, url: parsed };
}

function signPayload(body: string): string | null {
  const secret = process.env.EQUILIBRIUM_WEBHOOK_SIGNING_SECRET?.trim();
  if (!secret) return null;
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function postWithRetry(
  url: string,
  payloadText: string,
  signature: string | null,
): Promise<{ ok: boolean; status: number; latencyMs: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Equilibrium-Terminal-Distribution/1.0",
    ...(signature ? { "X-Equilibrium-Signature": `sha256=${signature}` } : {}),
  };

  let lastStatus = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    const started = Date.now();
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: payloadText,
        signal: AbortSignal.timeout(8_000),
      });
      lastStatus = res.status;
      if (res.ok) {
        return { ok: true, status: res.status, latencyMs: Date.now() - started };
      }
    } catch {
      lastStatus = 0;
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
  return { ok: false, status: lastStatus, latencyMs: 0 };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      url?: string;
      event?: {
        id: string;
        headline: string;
        detail?: string;
        coin?: string | null;
        severity: string;
        category?: string;
        source?: string;
        timestamp: number;
      };
    };

    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: "valid_url_required" }, { status: 400 });
    }

    const validated = validateWebhookUrl(url);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.reason }, { status: 400 });
    }

    if (!body.event?.headline) {
      return NextResponse.json({ error: "event_required" }, { status: 400 });
    }

    const payload = {
      source: "equilibrium-terminal",
      version: "1",
      event: body.event,
      deliveredAt: Date.now(),
    };

    const payloadText = JSON.stringify(payload);
    const signature = signPayload(payloadText);
    const result = await postWithRetry(validated.url.toString(), payloadText, signature);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: "webhook_delivery_failed",
          status: result.status || 502,
          signed: Boolean(signature),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      signed: Boolean(signature),
      latencyMs: result.latencyMs,
      signingConfigured: Boolean(process.env.EQUILIBRIUM_WEBHOOK_SIGNING_SECRET?.trim()),
    });
  } catch {
    return NextResponse.json({ error: "webhook_failed" }, { status: 500 });
  }
}
