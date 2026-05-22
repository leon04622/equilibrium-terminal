import { NextResponse } from "next/server";
import { getDistributionFeed, syncDistributionFeed } from "@/lib/infrastructure/server/distributionFeedStore";
import type { NewswireItem } from "@/types/information-distribution";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(64, Math.max(1, parseInt(searchParams.get("limit") ?? "32", 10) || 32));

  const feed = getDistributionFeed(limit);
  return NextResponse.json({
    ...feed,
    subscriberReady: true,
    format: "json",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { events?: NewswireItem[] };
    if (!body.events?.length) {
      return NextResponse.json({ error: "events_required" }, { status: 400 });
    }
    syncDistributionFeed(body.events);
    return NextResponse.json({ ok: true, count: body.events.length });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
