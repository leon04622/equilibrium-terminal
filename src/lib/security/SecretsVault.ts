import { AuditLogEngine } from "@/lib/security/AuditLogEngine";

export type SecretKey =
  | "EQUILIBRIUM_JWT_SECRET"
  | "EQUILIBRIUM_WEBHOOK_HMAC"
  | "EQUILIBRIUM_VAULT_KEY";

const ACCESS_LOG: Array<{ key: SecretKey; at: number }> = [];

/**
 * Environment-isolated secret access — production must set EQUILIBRIUM_JWT_SECRET (≥32 chars).
 */
export class SecretsVault {
  static read(key: SecretKey): string | null {
    ACCESS_LOG.unshift({ key, at: Date.now() });
    if (ACCESS_LOG.length > 100) ACCESS_LOG.length = 100;

    if (typeof process !== "undefined" && process.env) {
      const value = process.env[key];
      if (value) return value;
    }
    return null;
  }

  static jwtSecret(): string {
    const fromVault = SecretsVault.read("EQUILIBRIUM_JWT_SECRET");
    if (fromVault && fromVault.length >= 32) return fromVault;
    return "equilibrium-dev-jwt-secret-min-32-chars!!";
  }

  static rotationDue(): boolean {
    if (typeof process === "undefined") return false;
    const rotatedAt = process.env.EQUILIBRIUM_JWT_ROTATED_AT;
    if (!rotatedAt) return true;
    const ts = Date.parse(rotatedAt);
    if (Number.isNaN(ts)) return true;
    return Date.now() - ts > 86_400_000 * 30;
  }

  static auditAccess(): Array<{ key: SecretKey; at: number }> {
    return [...ACCESS_LOG];
  }

  static logClientAccess(key: SecretKey): void {
    AuditLogEngine.logCategory("secret", `vault_read:${key}`, "ok", "client metadata only");
  }
}
