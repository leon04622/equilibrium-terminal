import { NextResponse } from "next/server";
import {
  getEmbeddableFeed,
  getIntegrationsVitals,
  syncIntegrationsState,
} from "@/lib/infrastructure/server/integrationsStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type) {
    return NextResponse.json(getEmbeddableFeed(type));
  }

  return NextResponse.json(getIntegrationsVitals());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      integrationScore?: number;
      liveVenues?: number;
      apiEndpoints?: number;
    };
    syncIntegrationsState({
      integrationScore: body.integrationScore ?? 0,
      liveVenues: body.liveVenues ?? 0,
      apiEndpoints: body.apiEndpoints ?? 0,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
