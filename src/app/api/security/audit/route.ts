import { NextResponse } from "next/server";
import { appendAudit, listAudit, ensureAuditHydratedAsync } from "@/lib/security/server/auditStore";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";
import type { AuditLogEntry } from "@/types/security-trust";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "security_audit", 40, 60_000);
  if (limited) return limited;

  const url = new URL(request.url);
  const exportFmt = url.searchParams.get("format");
  const limit = Math.min(500, Number.parseInt(url.searchParams.get("limit") ?? "48", 10));
  await ensureAuditHydratedAsync();
  const entries = listAudit(limit);

  if (exportFmt === "csv") {
    const header = "at,traceId,category,action,outcome,actorWallet,resource,detail";
    const esc = (v: string | null) => {
      const s = v ?? "";
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = entries.map((e) =>
      [
        new Date(e.at).toISOString(),
        e.traceId,
        e.category,
        e.action,
        e.outcome,
        esc(e.actorWallet),
        esc(e.resource),
        esc(e.detail),
      ].join(","),
    );
    return new NextResponse([header, ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="equilibrium-audit.csv"',
        "x-eq-trace": ctx.traceId,
      },
    });
  }

  return NextResponse.json({
    entries,
    traceId: ctx.traceId,
  });
}

export async function POST(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "security_audit_append", 120, 60_000);
  if (limited) return limited;

  let body: { entry?: Partial<AuditLogEntry> };
  try {
    body = (await request.json()) as { entry?: Partial<AuditLogEntry> };
  } catch {
    return NextResponse.json({ error: "invalid_json", traceId: ctx.traceId }, { status: 400 });
  }

  const input = body.entry;
  if (!input?.category || !input.action || !input.traceId) {
    return NextResponse.json({ error: "invalid_entry", traceId: ctx.traceId }, { status: 400 });
  }

  const allowed: AuditLogEntry["category"][] = [
    "execution",
    "auth",
    "workspace",
    "api",
    "system",
  ];
  if (!allowed.includes(input.category as AuditLogEntry["category"])) {
    return NextResponse.json({ error: "category_denied", traceId: ctx.traceId }, { status: 403 });
  }

  const stored = appendAudit({
    category: input.category as AuditLogEntry["category"],
    action: String(input.action).slice(0, 120),
    actorWallet: input.actorWallet ?? null,
    sessionId: input.sessionId ?? null,
    resource: input.resource ?? null,
    outcome: input.outcome ?? "ok",
    detail: String(input.detail ?? "").slice(0, 2000),
    traceId: String(input.traceId).slice(0, 64),
  });

  return NextResponse.json({ ok: true, id: stored.id, traceId: ctx.traceId });
}
