import { NextResponse } from "next/server";
import { countAuditSince, listAudit } from "@/lib/security/server/auditStore";
import { rateLimitHits1h } from "@/lib/security/server/rateLimitStore";
import { listDevicesForSession } from "@/lib/security/server/deviceSessionStore";
import { countThreatsSince, listThreats } from "@/lib/security/server/threatStore";
import { SecretsVault } from "@/lib/security/SecretsVault";
import {
  buildGuardContext,
  enforceRateLimit,
  requireSession,
} from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "security_vitals", 120, 60_000);
  if (limited) return limited;

  const auth = await requireSession("audit.read");
  if (auth.error) {
    const pub = enforceRateLimit(ctx, "security_vitals_pub", 30, 60_000);
    if (pub) return pub;
    return NextResponse.json({
      trustScore: 72,
      sessionHealth: "none",
      secretsRotationDue: SecretsVault.rotationDue(),
      public: true,
      updatedAt: Date.now(),
    });
  }

  const devices = listDevicesForSession(auth.claims!.sid);
  const suspicious = devices.filter((d) => d.suspicious).length;

  return NextResponse.json({
    trustScore: Math.max(0, 100 - suspicious * 15 - (SecretsVault.rotationDue() ? 10 : 0)),
    sessionHealth: "healthy",
    activeDevices: devices.length,
    suspiciousDevices: suspicious,
    auditEntries24h: countAuditSince(86_400_000),
    threatEvents24h: countThreatsSince(86_400_000),
    rateLimitHits1h: rateLimitHits1h(),
    secretsRotationDue: SecretsVault.rotationDue(),
    recentThreats: listThreats(8),
    recentAudit: listAudit(12),
    updatedAt: Date.now(),
  });
}
