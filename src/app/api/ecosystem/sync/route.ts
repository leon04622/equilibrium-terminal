import { NextResponse } from "next/server";
import { getEcosystemVitals, syncEcosystemState } from "@/lib/infrastructure/server/ecosystemStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getEcosystemVitals());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ecosystemScore?: number;
      operatingReadiness?: number;
      layerCount?: number;
    };
    syncEcosystemState({
      ecosystemScore: body.ecosystemScore ?? 0,
      operatingReadiness: body.operatingReadiness ?? 0,
      layerCount: body.layerCount ?? 0,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
