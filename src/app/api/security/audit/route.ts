import { NextResponse } from "next/server";
import { listAudit } from "@/lib/security/server/auditStore";
import { buildGuardContext, enforceRateLimit, requireSession } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "security_audit", 40, 60_000);
  if (limited) return limited;

  const auth = await requireSession("audit.read");
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const limit = Math.min(100, Number.parseInt(url.searchParams.get("limit") ?? "48", 10));

  return NextResponse.json({
    entries: listAudit(limit),
    traceId: ctx.traceId,
  });
}
