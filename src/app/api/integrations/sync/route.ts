import { NextResponse } from "next/server";
import {
  getIntegrationsVitals,
  syncIntegrationsState,
} from "@/lib/infrastructure/server/integrationsStore";

export const runtime = "nodejs";

export async function GET() {
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
