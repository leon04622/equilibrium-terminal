import { NextResponse } from "next/server";
import {
  getEnterpriseVitals,
  syncEnterpriseOps,
} from "@/lib/infrastructure/server/enterpriseOpsStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getEnterpriseVitals());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenantId?: string;
      operationalScore?: number;
      auditCount?: number;
    };
    if (!body.tenantId) {
      return NextResponse.json({ error: "tenant_id_required" }, { status: 400 });
    }
    syncEnterpriseOps({
      tenantId: body.tenantId,
      operationalScore: body.operationalScore ?? 0,
      auditCount: body.auditCount ?? 0,
    });
    return NextResponse.json({ ok: true, tenantId: body.tenantId });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
