import { NextResponse } from "next/server";
import {
  getCollaborationActivity,
  getCollaborationVitals,
  syncCollaborationDesk,
} from "@/lib/infrastructure/server/collaborationStore";
import type { ActivityTimelineEntry, MarketAnnotation } from "@/types/collaboration";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(32, Math.max(1, parseInt(searchParams.get("limit") ?? "16", 10) || 16));

  const vitals = getCollaborationVitals();
  const activity = getCollaborationActivity(limit);

  return NextResponse.json({
    ...vitals,
    activity,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      deskId?: string;
      activity?: ActivityTimelineEntry[];
      annotations?: MarketAnnotation[];
    };
    if (!body.deskId) {
      return NextResponse.json({ error: "desk_id_required" }, { status: 400 });
    }
    syncCollaborationDesk({
      deskId: body.deskId,
      activity: body.activity ?? [],
      annotations: body.annotations ?? [],
    });
    return NextResponse.json({ ok: true, deskId: body.deskId });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
