import { NextResponse } from "next/server";
import { OpsCommandOrchestrator } from "@/lib/ops-command/OpsCommandOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "ops_command_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = OpsCommandOrchestrator.snapshot();
    return NextResponse.json({
      controlScore: snap.controlScore,
      telemetry: snap.telemetry,
      openIncidents: snap.telemetry.openIncidents,
      commandBrief: snap.commandBrief,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "ops_command_vitals_failed" }, { status: 500 });
  }
}
