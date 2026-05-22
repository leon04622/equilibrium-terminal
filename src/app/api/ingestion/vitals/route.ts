import { NextResponse } from "next/server";
import { getIngestionFeed } from "@/lib/infrastructure/server/ingestionFeedStore";

export const runtime = "nodejs";

export async function GET() {
  const feed = getIngestionFeed(8);
  return NextResponse.json({
    feedId: feed.feedId,
    generatedAt: feed.generatedAt,
    vitals: feed.vitals,
    eventCount: feed.events.length,
    latencyMs: feed.vitals?.updatedAt ? Date.now() - feed.vitals.updatedAt : null,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sourceId?: string;
      staleMs?: number;
      at?: number;
    };
    return NextResponse.json({
      ok: true,
      recorded: {
        sourceId: body.sourceId ?? "unknown",
        staleMs: body.staleMs ?? 0,
        at: body.at ?? Date.now(),
      },
    });
  } catch {
    return NextResponse.json({ error: "vitals_failed" }, { status: 500 });
  }
}
