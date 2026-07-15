import { NextResponse } from "next/server";
import {
  getInstitutionalNewsHeadlines,
  getInstitutionalNewsStatus,
} from "@/lib/infrastructure/server/institutionalNewsOrchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(96, Math.max(1, parseInt(searchParams.get("limit") ?? "64", 10) || 64));

  try {
    const headlines = await getInstitutionalNewsHeadlines(limit);
    const status = getInstitutionalNewsStatus();
    return NextResponse.json({
      feedId: status.feedId,
      generatedAt: Date.now(),
      status,
      count: headlines.length,
      headlines,
    });
  } catch {
    return NextResponse.json({ error: "news_fetch_failed" }, { status: 502 });
  }
}
