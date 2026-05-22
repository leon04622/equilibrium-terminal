import { NextResponse } from "next/server";
import { getProprietaryVitals, syncProprietaryIntel } from "@/lib/infrastructure/server/proprietaryIntelStore";
import type { ProprietaryMetric } from "@/types/proprietary-intelligence";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getProprietaryVitals());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      moatScore?: number;
      differentiationScore?: number;
      metrics?: ProprietaryMetric[];
    };
    syncProprietaryIntel({
      moatScore: body.moatScore ?? 0,
      differentiationScore: body.differentiationScore ?? 0,
      metrics: body.metrics ?? [],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
