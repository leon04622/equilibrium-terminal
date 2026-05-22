import { NextResponse } from "next/server";
import { getIngestionFeed, syncIngestionFeed } from "@/lib/infrastructure/server/ingestionFeedStore";
import type { IngestEventEnvelope, StreamProcessingMetrics } from "@/types/data-ingestion";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(64, Math.max(1, parseInt(searchParams.get("limit") ?? "32", 10) || 32));
  const feed = getIngestionFeed(limit);
  return NextResponse.json({ ...feed, format: "json" });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      events?: IngestEventEnvelope[];
      vitals?: StreamProcessingMetrics;
    };
    if (!body.events?.length) {
      return NextResponse.json({ error: "events_required" }, { status: 400 });
    }
    syncIngestionFeed(body.events, body.vitals);
    return NextResponse.json({ ok: true, count: body.events.length });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
