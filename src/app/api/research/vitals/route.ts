import { NextResponse } from "next/server";
import { ResearchDeskOrchestrator } from "@/lib/research-desk/ResearchDeskOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "research_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";
  const q = searchParams.get("q") ?? "";

  try {
    const snap = ResearchDeskOrchestrator.snapshot(asset, q);
    return NextResponse.json({
      researchScore: snap.researchScore,
      telemetry: snap.telemetry,
      memoryContext: snap.memoryContext,
      thesisCount: snap.theses.length,
      journalCount: snap.journal.length,
      aiBrief: snap.aiBrief,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "research_vitals_failed" }, { status: 500 });
  }
}
