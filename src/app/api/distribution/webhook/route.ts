import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
        timestamp: number;
      };
    };

    const url = body.url?.trim();
    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "valid_url_required" }, { status: 400 });
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

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Equilibrium-Terminal-Distribution/1.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "webhook_delivery_failed", status: res.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "webhook_failed" }, { status: 500 });
  }
}
