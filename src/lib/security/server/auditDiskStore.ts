import fs from "node:fs";
import path from "node:path";
import type { AuditLogEntry } from "@/types/security-trust";

function auditDataPath(): string {
  if (process.env.EQUILIBRIUM_AUDIT_DIR) {
    return path.join(process.env.EQUILIBRIUM_AUDIT_DIR, "audit-log.jsonl");
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "eq-audit", "audit-log.jsonl");
  }
  return path.join(process.cwd(), ".data", "audit", "audit-log.jsonl");
}

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function appendAuditToDisk(entry: AuditLogEntry): void {
  try {
    const file = auditDataPath();
    ensureDir(file);
    fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    /* in-memory buffer remains authoritative */
  }
}

export function hydrateAuditFromDisk(limit = 500): AuditLogEntry[] {
  try {
    const file = auditDataPath();
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as AuditLogEntry)
      .reverse();
  } catch {
    return [];
  }
}
