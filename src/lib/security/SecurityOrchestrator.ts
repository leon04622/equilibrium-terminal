import { AuditLogEngine } from "@/lib/security/AuditLogEngine";
import { SecretsVault } from "@/lib/security/SecretsVault";
import { WebSocketSecurityGate } from "@/lib/security/WebSocketSecurityGate";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { SecurityTrustSnapshot } from "@/types/security-trust";
import type { AuthSessionClaims } from "@/types/production-platform";

export class SecurityOrchestrator {
  static snapshot(claims: AuthSessionClaims | null): SecurityTrustSnapshot {
    const perf = usePerformanceStore.getState().vitals;
    const sessionHealth = useProductionConfigStore.getState().sessionHealth;
    const clientAudit = AuditLogEngine.load();
    const denials = clientAudit.filter(
      (e) => e.category === "execution" && e.outcome === "denied",
    ).length;

    let trustScore = 88;
    if (sessionHealth === "jwt_invalid") trustScore -= 35;
    if (sessionHealth === "jwt_expiring") trustScore -= 12;
    if (perf.stressActive) trustScore -= 8;
    if (perf.droppedFrames > 5) trustScore -= 6;
    if (SecretsVault.rotationDue()) trustScore -= 10;
    if (!WebSocketSecurityGate.isSessionBound()) trustScore -= 5;
    trustScore = Math.max(0, Math.min(100, trustScore));

    const healthMap = {
      healthy: "healthy",
      jwt_expiring: "expiring",
      jwt_invalid: "invalid",
    } as const;

    return {
      trustScore,
      sessionHealth: claims
        ? (healthMap[sessionHealth as keyof typeof healthMap] ?? "healthy")
        : "none",
      activeDevices: claims ? 1 : 0,
      suspiciousDevices: 0,
      auditEntries24h: clientAudit.length,
      threatEvents24h: clientAudit.filter((e) => e.outcome === "denied").length,
      rateLimitHits1h: 0,
      executionDenials1h: denials,
      secretsRotationDue: SecretsVault.rotationDue(),
      wsSessionBound: WebSocketSecurityGate.isSessionBound(),
      updatedAt: Date.now(),
    };
  }
}
